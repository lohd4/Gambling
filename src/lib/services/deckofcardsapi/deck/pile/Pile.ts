import type CardInterface from "$lib/types/interfaces/Card";
import type EndpointInterface from "$lib/types/interfaces/Endpoint";

export default class PileEndpoint implements EndpointInterface {
    url: string;

    create = async (deckId: string, pileName: string, cards: Array<CardInterface> = []) => {
        const cardsString = cards?.map((card: CardInterface) => card.code).join(",");

        const url = `${this.url.replace("{deckId}", deckId)}/${pileName}/add/?cards=${cardsString}`;

        const response = await fetch(url);

        if (!response.ok) {
            alert("Creating pile failed!");
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert("Creating pile failed: " + json.error);
        };

        return {
            name: pileName,
            ...json.piles[pileName]
        };
    };

    read = async (deckId: string, pileName: string) => {
        const url = `${this.url.replace("{deckId}", deckId)}/${pileName}/list`;
        
        const response = await fetch(url);

        if (!response.ok) {
            alert("Reading pile failed!");
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert("Rading pile failed: " + json.error);
        };

        return {
            name: pileName,
            ...json.piles[pileName]
        };
    };

    update = async (deckId: string, pileName: string, action: "add" | "shuffle" | "draw", cards: Array<CardInterface> = []) => {
        const cardsString = cards?.map((card: CardInterface) => card.code).join(",");

        const url = `${this.url.replace("{deckId}", deckId)}/${pileName}/${action}/${cards.length > 0 ? `?cards=${cardsString}` : ""}`;

        const response = await fetch(url);

        if (!response.ok) {
            alert("Updating pile failed!");
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert("Updating pile failed: " + json.error);
        };

        return {
            name: pileName,
            ...json.piles[pileName]
        };
    }


    constructor(url: string) {
        this.url = url + "/{deckId}/pile";
    };

}