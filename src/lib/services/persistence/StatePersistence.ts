import type { Writable } from "svelte/store";
import { StorageProvider } from "$lib/utils/browserUtils";

export interface GameStateSnapshot {
    playerHands: Array<{
        cards: Array<{
            image: string;
            value: string;
            suit: string;
            code: string;
        }>;
        score: number;
        isBusted: boolean;
        isStanding: boolean;
    }>;
    dealerHand: {
        cards: Array<{
            image: string;
            value: string;
            suit: string;
            code: string;
        }>;
        score: number;
        isBusted: boolean;
        hideFirstCard: boolean;
    };
    currentBet: number;
    chips: number;
    deckId: string;
    gameStatus: "betting" | "playing" | "evaluating" | "gameover";
    currentHandIndex: number;
    timestamp: number;
}

export class StatePersistenceService {
    private static STORAGE_KEY = "blackjack_game_state";
    private static LAST_SAVE_TIME_KEY = "blackjack_last_save";

    /**
     * Saves the current game state
     */
    static saveState(state: GameStateSnapshot): void {
        try {
            const serializedState = JSON.stringify({
                ...state,
                timestamp: Date.now()
            });

            StorageProvider.setItem(this.STORAGE_KEY, serializedState);
            StorageProvider.setItem(this.LAST_SAVE_TIME_KEY, new Date().toLocaleTimeString());

        } catch (error) {
            console.error("Failed to save game state:", error);
        }
    }

    /**
     * Retrieves the saved game state
     */
    static loadState(): GameStateSnapshot | null {
        try {
            const serializedState = StorageProvider.getItem(this.STORAGE_KEY);
            if (!serializedState) return null;

            const state = JSON.parse(serializedState) as GameStateSnapshot;

            // Validate the state has expected structure to detect corruption
            if (!this.isValidState(state)) {
                console.warn("Corrupt or invalid game state detected, discarding");
                this.clearState();
                return null;
            }

            return state;
        } catch (error) {
            console.error("Failed to load game state:", error);
            this.clearState();
            return null;
        }
    }

    /**
     * Clears the saved game state
     */
    static clearState(): void {
        StorageProvider.removeItem(this.STORAGE_KEY);
        StorageProvider.removeItem(this.LAST_SAVE_TIME_KEY);
    }

    /**
     * Get the last time the game was saved
     */
    static getLastSaveTime(): string | null {
        return StorageProvider.getItem(this.LAST_SAVE_TIME_KEY);
    }

    /**
     * Check if there is persistent storage available
     */
    static isPersistentStorageAvailable(): boolean {
        return StorageProvider.isSessionPersistent();
    }

    /**
     * Basic validation to ensure the loaded state has the expected structure
     */
    private static isValidState(state: any): boolean {
        return state &&
            typeof state === "object" &&
            Array.isArray(state.playerHands) &&
            typeof state.dealerHand === "object" &&
            typeof state.gameStatus === "string" &&
            typeof state.timestamp === "number";
    }

    /**
     * Checks if the state is too old (e.g., saved more than 6 hours ago)
     */
    static isStateExpired(state: GameStateSnapshot, maxAgeMs: number = 6 * 60 * 60 * 1000): boolean {
        return Date.now() - state.timestamp > maxAgeMs;
    }
}