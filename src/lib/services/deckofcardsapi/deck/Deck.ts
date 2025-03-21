import type CardInterface from "$lib/types/interfaces/Card";
import PileFactory from "./pile/PileFactory";

export interface DeckResponse {
    "deck_id": string,
    "remaining": number,
    "shuffled": boolean,
    "success": boolean
}

export default class DeckEndpoint {
    url: string;
    pile: PileFactory['pile'];

    shuffle = async (): Promise<DeckResponse> => {
        const url = `${this.url}/shuffle`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`);
        };

        return json;
    }

    draw = async (cardCount: number = 1): Promise<Array<CardInterface>> => {
        const url = `${this.url}/draw/?count=${cardCount}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`);
        };

        return json["cards"];
    }

    get = async (): Promise<DeckResponse> => {
        const url = this.url;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json;
    }

    static new = async (baseUrl: string, deckCount: number): Promise<DeckResponse> => {
        const url = `${baseUrl}/new/?deck_count=${deckCount}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json;
    }

    constructor(url: string, deckId: string) {
        this.url = `${url}/deck/${deckId}/`;
        const factory = new PileFactory(this.url);
        this.pile = factory.pile;
    }
}