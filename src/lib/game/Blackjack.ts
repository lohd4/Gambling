import type { GameStateSnapshot } from './../services/persistence/StatePersistence';
import type { DeckResponse } from "$lib/services/deckofcardsapi/deck/Deck";
import { DeckOfCardsApi } from "$lib/services/deckofcardsapi/DeckOfCardsApi";
import Player from "./Player";
import Dealer from "./Dealer";
import { defaultGameState, StatePersistenceService } from "$lib/services/persistence/StatePersistence";

export default class Blackjack {
    shuffledDeck: DeckResponse = {
        "deck_id": "",
        "remaining": 0,
        "shuffled": false,
        "success": false
    };
    playerBudget: number | null = null;
    player: Player = new Player(this.playerBudget);
    dealer: Dealer = new Dealer();

    constructor(playerBudget: number | null) {
        this.playerBudget = playerBudget
    }

    init = async () => {
        this.shuffledDeck = await DeckOfCardsApi.deck.new.shuffle();
        let _tempState = defaultGameState 
        _tempState.deckId = this.shuffledDeck.deck_id;
        let state: GameStateSnapshot = _tempState;
        StatePersistenceService.saveState(state)
    }        
};