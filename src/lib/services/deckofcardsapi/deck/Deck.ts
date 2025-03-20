import type EndpointInterface from "$lib/types/interfaces/Endpoint";

export default class DeckEndpoint implements EndpointInterface{
    url: string;
    create = async (deckCount: number = 1, shuffled: boolean = false) => {
        const fetchUrl = `${this.url}/new${shuffled ? "/shuffle" : ""}/?deck_count=${deckCount}`;

        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            alert("Creating deck failed!");
            return;
        };

        const json = await response.json();

        if (!json.success) {
            alert("Creating deck failed: " + json?.error);
            return;
        };

        return json;
    };

    read = async (deckId: string) => {
        const url = 
            this.url + 
            "/" + 
            deckId;

        const response = await fetch(url);

        if (!response.ok) {
            alert("Reading deck failed!");
            return;
        };

        const json = await response.json();

        if (!json?.success) {
            alert("Reading deck failed: " + json?.error);
            return;
        };

        return json;

    };

    update = async (deckId: string, action: "shuffle" | "draw" ) => {
        const url = 
            this.url +
            "/" +
            deckId +
            "/" +
            action;

        const response = await fetch(url);

        if (!response.ok) {
            alert("Updating deck failed!");
            return;
        }

        const json = await response.json();

        if (!json?.success) {
            alert("Updating deck failed: " + json?.error);
            return;
        }

        return json;
    } 

    constructor(url: string) {
        this.url = url + "/deck";
        
    };


};