import type CardInterface from "$lib/types/interfaces/Card";

export interface PileResponse {
    remaining: number
}

export default class PileEndpoint {
    url: string;

    add = async (cards: Array<CardInterface>): Promise<PileResponse> => {
        const cardsString = cards?.map((card: CardInterface) => card.code).join(",");
        const pileName = this.url.split("/").reverse()[1];
        
        const url = `${this.url}/add/?cards=${cardsString}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json["piles"][pileName];
    };

    shuffle = async (): Promise<PileResponse> => {
        const url = `${this.url}/shuffle`;
        const pileName = this.url.split("/").reverse()[1];

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json["piles"][pileName];
    };

    draw = async (cardCount: number = 1, option: "bottom" | "random" | "" = ""): Promise<Array<CardInterface>> => {
        const url = `${this.url}/draw/${option !== "" ? `/${option}/` : ""}?count=${cardCount}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json["cards"];
    }

    get = async (): Promise<PileResponse> => {
        const url = `${this.url}/list`;
        const pileName = this.url.split("/").reverse()[1];

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json["piles"][pileName];
    };

    static new = async (baseUrl: string, pileName: string): Promise<PileResponse> => {
        const url = `${baseUrl}/pile/${pileName}/add/?cards`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request to url: ${url} failed!`);
        };

        const json = await response.json();

        if (!json.success) {
            throw new Error(`Request to url: ${url} failed: ${json.error}`)
        };

        return json["piles"][pileName];
    };

    constructor(url: string, pileName: string) {
        this.url = `${url}/pile/${pileName}/`;
    };
}