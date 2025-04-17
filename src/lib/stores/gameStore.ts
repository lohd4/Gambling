import { writable, get } from "svelte/store";
import type CardInterface from "$lib/types/interfaces/Card";
import { DeckOfCardsApi } from "$lib/services/deckofcardsapi/DeckOfCardsApi";
import { StatePersistenceService, type GameStateSnapshot } from "$lib/services/persistence/StatePersistence";

export interface PlayerHand {
    cards: CardInterface[];
    score: number;
    isBusted: boolean;
    isStanding: boolean;
}

export interface DealerHand {
    cards: CardInterface[];
    score: number;
    isBusted: boolean;
    hideFirstCard: boolean;
}

export interface GameState {
    playerHands: PlayerHand[];
    dealerHand: DealerHand;
    currentBet: number;
    chips: number;
    deckId: string | null;
    gameStatus: "betting" | "playing" | "evaluating" | "gameover";
    currentHandIndex: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: GameState = {
    playerHands: [],
    dealerHand: {
        cards: [],
        score: 0,
        isBusted: false,
        hideFirstCard: true
    },
    currentBet: 0,
    chips: 1000, // Starting chips
    deckId: null,
    gameStatus: "betting",
    currentHandIndex: 0,
    isLoading: false,
    error: null
};

export class GameStore {
    private store = writable<GameState>(initialState);
    
    constructor() {
        this.loadPersistedState();
    }

    // Store subscribe/update/set methods
    subscribe = this.store.subscribe;
    update = this.store.update;
    set = this.store.set;
    
    /**
     * Initialize a new game
     */
    startNewGame = async () => {
        try {
            this.update(state => ({ ...state, isLoading: true, error: null }));
            
            // Get a new shuffled deck
            const deckResponse = await DeckOfCardsApi.deck.new.shuffle();
            
            // Reset game state with new deck
            this.update(state => ({
                ...initialState,
                deckId: deckResponse.deck_id,
                isLoading: false
            }));
            
            this.persistState();
        } catch (error) {
            this.update(state => ({
                ...state,
                isLoading: false,
                error: "Failed to start new game: " + (error instanceof Error ? error.message : String(error))
            }));
        }
    };

    /**
     * Place a bet and start the hand
     */
    placeBet = async (amount: number) => {
        if (amount <= 0) return;
        
        const state = get(this.store);
        if (amount > state.chips) return;
        
        try {
            this.update(state => ({ ...state, isLoading: true, error: null }));
            
            // Check if we need a new deck
            let deckId = state.deckId;
            if (!deckId) {
                const deckResponse = await DeckOfCardsApi.deck.new.shuffle();
                deckId = deckResponse.deck_id;
            }
            
            // Draw initial cards
            const cards = await DeckOfCardsApi.deck(deckId).draw(4);
            
            // Update state with initial deal
            this.update(state => ({
                ...state,
                playerHands: [{
                    cards: [cards[0], cards[2]],
                    score: this.calculateScore([cards[0], cards[2]]),
                    isBusted: false,
                    isStanding: false
                }],
                dealerHand: {
                    cards: [cards[1], cards[3]],
                    score: this.calculateScore([cards[1], cards[3]]),
                    isBusted: false,
                    hideFirstCard: true
                },
                currentBet: amount,
                chips: state.chips - amount,
                gameStatus: "playing",
                isLoading: false
            }));
            
            this.persistState();
        } catch (error) {
            this.update(state => ({
                ...state,
                isLoading: false,
                error: "Failed to place bet: " + (error instanceof Error ? error.message : String(error))
            }));
        }
    };

    /**
     * Player action: Hit (take another card)
     */
    hit = async () => {
        const state = get(this.store);
        if (state.gameStatus !== "playing" || !state.deckId) return;
        
        try {
            this.update(state => ({ ...state, isLoading: true, error: null }));
            
            // Draw a card
            const [card] = await DeckOfCardsApi.deck(state.deckId).draw(1);
            
            // Update current hand with new card
            this.update(state => {
                const playerHands = [...state.playerHands];
                const currentHand = playerHands[state.currentHandIndex];
                
                const updatedCards = [...currentHand.cards, card];
                const score = this.calculateScore(updatedCards);
                const isBusted = score > 21;
                
                playerHands[state.currentHandIndex] = {
                    ...currentHand,
                    cards: updatedCards,
                    score,
                    isBusted
                };
                
                // If busted, move to next hand or dealer's turn
                let newStatus = state.gameStatus;
                let newHandIndex = state.currentHandIndex;
                
                if (isBusted) {
                    if (state.currentHandIndex < state.playerHands.length - 1) {
                        newHandIndex++;
                    } else {
                        // All hands complete, dealer's turn
                        newStatus = "evaluating";
                    }
                }
                
                return {
                    ...state,
                    playerHands,
                    gameStatus: newStatus,
                    currentHandIndex: newHandIndex,
                    isLoading: false
                };
            });
            
            // If all player hands are complete, execute dealer's turn
            const updatedState = get(this.store);
            if (updatedState.gameStatus === "evaluating") {
                await this.dealerTurn();
            }
            
            this.persistState();
        } catch (error) {
            this.update(state => ({
                ...state,
                isLoading: false,
                error: "Failed to hit: " + (error instanceof Error ? error.message : String(error))
            }));
        }
    };

    /**
     * Player action: Stand (end turn)
     */
    stand = async () => {
        const state = get(this.store);
        if (state.gameStatus !== "playing") return;
        
        try {
            this.update(state => {
                const playerHands = [...state.playerHands];
                playerHands[state.currentHandIndex] = {
                    ...playerHands[state.currentHandIndex],
                    isStanding: true
                };
                
                let newHandIndex = state.currentHandIndex;
                let newStatus = state.gameStatus;
                
                // Move to next hand or dealer's turn
                if (newHandIndex < playerHands.length - 1) {
                    newHandIndex++;
                } else {
                    newStatus = "evaluating";
                }
                
                return {
                    ...state,
                    playerHands,
                    currentHandIndex: newHandIndex,
                    gameStatus: newStatus
                };
            });
            
            // If all player hands are complete, execute dealer's turn
            const updatedState = get(this.store);
            if (updatedState.gameStatus === "evaluating") {
                await this.dealerTurn();
            }
            
            this.persistState();
        } catch (error) {
            this.update(state => ({
                ...state,
                isLoading: false,
                error: "Failed during stand action: " + (error instanceof Error ? error.message : String(error))
            }));
        }
    };

    /**
     * Execute dealer's turn according to house rules
     */
    private dealerTurn = async () => {
        const state = get(this.store);
        if (!state.deckId) return;
        
        try {
            this.update(state => ({
                ...state,
                dealerHand: {
                    ...state.dealerHand,
                    hideFirstCard: false
                },
                isLoading: true
            }));
            
            let dealerHand = { ...get(this.store).dealerHand };
            
            // Dealer draws until score is at least 17
            while (dealerHand.score < 17) {
                const [card] = await DeckOfCardsApi.deck(state.deckId).draw(1);
                dealerHand.cards = [...dealerHand.cards, card];
                dealerHand.score = this.calculateScore(dealerHand.cards);
                dealerHand.isBusted = dealerHand.score > 21;
                
                this.update(state => ({
                    ...state,
                    dealerHand
                }));
            }
            
            // Calculate results and payouts
            this.calculateResults();
            this.persistState();
        } catch (error) {
            this.update(state => ({
                ...state,
                isLoading: false,
                error: "Failed during dealer's turn: " + (error instanceof Error ? error.message : String(error))
            }));
        }
    };

    /**
     * Calculate hand results and update chips
     */
    private calculateResults = () => {
        this.update(state => {
            let totalWinnings = 0;
            const dealerScore = state.dealerHand.isBusted ? 0 : state.dealerHand.score;
            
            // Calculate winnings for each hand
            state.playerHands.forEach(hand => {
                if (hand.isBusted) {
                    // Player busts - no winnings
                    return;
                }
                
                if (state.dealerHand.isBusted || hand.score > dealerScore) {
                    // Player wins - pays 1:1
                    totalWinnings += state.currentBet * 2;
                } else if (hand.score === dealerScore) {
                    // Push - return bet
                    totalWinnings += state.currentBet;
                }
                // If dealer wins, bet is already lost
            });
            
            return {
                ...state,
                chips: state.chips + totalWinnings,
                gameStatus: "gameover",
                isLoading: false
            };
        });
    };

    /**
     * Helper to calculate the score of a hand
     */
    private calculateScore = (cards: CardInterface[]): number => {
        let score = 0;
        let aces = 0;
        
        cards.forEach(card => {
            if (card.value === "ACE") {
                aces++;
                score += 11;
            } else if (["KING", "QUEEN", "JACK"].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        });
        
        // Adjust for aces
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    };

    /**
     * Persist current state to localStorage
     */
    private persistState = () => {
        const state = get(this.store);
        
        // Don't persist loading state or error messages
        const stateToSave: GameStateSnapshot = {
            playerHands: state.playerHands,
            dealerHand: state.dealerHand,
            currentBet: state.currentBet,
            chips: state.chips,
            deckId: state.deckId || "",
            gameStatus: state.gameStatus,
            currentHandIndex: state.currentHandIndex,
            timestamp: Date.now()
        };
        
        StatePersistenceService.saveState(stateToSave);
    };

    /**
     * Load persisted state from localStorage
     */
    private loadPersistedState = () => {
        const savedState = StatePersistenceService.loadState();
        
        if (savedState) {
            // If state is too old, discard it
            if (StatePersistenceService.isStateExpired(savedState)) {
                StatePersistenceService.clearState();
                return;
            }
            
            // Restore state
            this.update(state => ({
                ...state,
                playerHands: savedState.playerHands,
                dealerHand: savedState.dealerHand,
                currentBet: savedState.currentBet,
                chips: savedState.chips,
                deckId: savedState.deckId,
                gameStatus: savedState.gameStatus,
                currentHandIndex: savedState.currentHandIndex,
            }));
        }
    };
    
    /**
     * Reset the game state
     */
    resetGame = () => {
        StatePersistenceService.clearState();
        this.set(initialState);
    };
}

// Create and export a singleton instance
export const gameStore = new GameStore();