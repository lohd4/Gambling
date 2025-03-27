import type { DeckResponse } from "$lib/services/deckofcardsapi/deck/Deck";
import { DeckOfCardsApi } from "$lib/services/deckofcardsapi/DeckOfCardsApi";
import Player from "./Player";
import Dealer from "./Dealer";

class Blackjack {
    shuffledDeck: DeckResponse | null = null;
    playerBudget: number | null = null;
    player: Player = new Player(this.playerBudget);
    dealer: Dealer = new Dealer();

    constructor(playerBudget: number | null) {
        this.playerBudget = playerBudget
    }

    init = async () => {
        DeckOfCardsApi.deck.new.shuffle().then(deck => { this.shuffledDeck = deck});
    }        
};