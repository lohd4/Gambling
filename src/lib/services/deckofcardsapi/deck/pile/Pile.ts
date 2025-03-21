import type CardInterface from "$lib/types/interfaces/Card";



export default class PileEndpoint {
    url: string;

    add = async (cards: Array<CardInterface>) => {
        const cardsString = cards?.map((card: CardInterface) => card.code).join(",");
        const url = `${this.url}/add/?cards=${cardsString}`;
        const response = await fetch(url);

        if (!response.ok) {
            alert(`Request to url: ${url} failed!`);
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert(`Request to url: ${url} failed: ${json.error}`)
            return;
        };

        return json;
    };

    shuffle = async () => {
        const url = `${this.url}/shuffle`;
        const response = await fetch(url);

        if (!response.ok) {
            alert(`Request to url: ${url} failed!`);
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert(`Request to url: ${url} failed: ${json.error}`)
            return;
        };

        return json;
    };

    draw = async (cardCount: number = 1, option: "bottom" | "random" | "" = "") => {
        const url = `${this.url}/draw/${option !== "" ? `/${option}/` : ""}?count=${cardCount}`;
        const response = await fetch(url);

        if (!response.ok) {
            alert(`Request to url: ${url} failed!`);
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert(`Request to url: ${url} failed: ${json.error}`)
            return;
        };

        return json;
    }

    get = async () => {
        const url = `${this.url}/list`;
        const response = await fetch(url);

        if (!response.ok) {
            alert(`Request to url: ${url} failed!`);
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert(`Request to url: ${url} failed: ${json.error}`)
            return;
        };

        return json;
    };

    static new = async (baseUrl: string, pileName: string) => {
        const url = `${baseUrl}/pile/${pileName}/add/?cards`;
        const response = await fetch(url);

        if (!response.ok) {
            alert(`Request to url: ${url} failed!`);
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert(`Request to url: ${url} failed: ${json.error}`)
            return;
        };

        return json;
    };

    constructor(url: string, pileName: string) {
        this.url = `${url}/pile/${pileName}/`;
    };
}