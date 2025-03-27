import type CardInterface from "$lib/types/interfaces/Card";

export default class Player {
    hand: CardInterface[] | null = null;
    budget: number | null = null; 

    constructor(budget: number | null) {
        this.budget = budget ?? 2500
    }
}