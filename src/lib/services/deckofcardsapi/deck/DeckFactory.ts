import DeckEndpoint, { type DeckResponse } from "./Deck";


export default class DeckFactory {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    deck = Object.assign(
        (deckId: string): DeckEndpoint => {
            return new DeckEndpoint(this.url, deckId);
        },
        {
            new: Object.assign(
                async (deckCount: number = 1): Promise<DeckResponse> => {
                    return await DeckEndpoint.new(this.url, deckCount);
                },
                {
                    shuffle: async (): Promise<DeckResponse> => {
                        return await new DeckEndpoint(this.url, "new").shuffle();
                    }
                }
            )
        }
    );
}