import type ApiInterface from "$lib/types/interfaces/Api";
import type EndpointInterface from "$lib/types/interfaces/Endpoint";
import DeckEndpoint from "./deck/Deck";

class DeckOfCardsApiClass implements ApiInterface {
    url: string = "https://deckofcardsapi.com/api";
    deck: DeckEndpoint;
    
    constructor() {        
        this.deck = new DeckEndpoint(this.url);

    };

};
  

export const DeckOfCardsApi = new DeckOfCardsApiClass();