import DeckFactory from "./deck/DeckFactory";


class DeckOfCardsApiClass {
    url: string = "https://deckofcardsapi.com/api";
    deck: DeckFactory['deck'];

    constructor() {
        const factory = new DeckFactory(this.url);
        this.deck = factory.deck;
    }
}

export const DeckOfCardsApi = new DeckOfCardsApiClass();