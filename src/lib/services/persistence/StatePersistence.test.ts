import { StatePersistenceService, type GameStateSnapshot } from "./StatePersistence";
import { StorageProvider } from "$lib/utils/browserUtils";

jest.mock("$lib/utils/browserUtils", () => ({
  StorageProvider: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    isSessionPersistent: jest.fn(),
  },
}));

describe("StatePersistenceService", () => {
  const mockGameState: GameStateSnapshot = {
    playerHands: [
      {
        cards: [
          { image: "card1.png", value: "5", suit: "HEARTS", code: "5H" },
          { image: "card2.png", value: "KING", suit: "SPADES", code: "KS" },
        ],
        score: 15,
        isBusted: false,
        isStanding: false,
      },
    ],
    dealerHand: {
      cards: [
        { image: "card3.png", value: "7", suit: "DIAMONDS", code: "7D" },
        { image: "card4.png", value: "9", suit: "CLUBS", code: "9C" },
      ],
      score: 16,
      isBusted: false,
      hideFirstCard: true,
    },
    currentBet: 100,
    chips: 900,
    deckId: "test-deck-id",
    gameStatus: "playing",
    currentHandIndex: 0,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves the game state to storage", () => {
    StatePersistenceService.saveState(mockGameState);

    expect(StorageProvider.setItem).toHaveBeenCalledWith(
      "blackjack_game_state",
      expect.any(String) // Serialized JSON string
    );
    expect(StorageProvider.setItem).toHaveBeenCalledWith(
      "blackjack_last_save",
      expect.any(String) // Last save time
    );
  });

  it("loads the game state from storage", () => {
    const serializedState = JSON.stringify(mockGameState);
    (StorageProvider.getItem as jest.Mock).mockReturnValue(serializedState);

    const loadedState = StatePersistenceService.loadState();

    expect(StorageProvider.getItem).toHaveBeenCalledWith("blackjack_game_state");
    expect(loadedState).toEqual(mockGameState);
  });

  it("returns null and clears storage if the loaded state is invalid", () => {
    (StorageProvider.getItem as jest.Mock).mockReturnValue("invalid-json");

    const loadedState = StatePersistenceService.loadState();

    expect(StorageProvider.getItem).toHaveBeenCalledWith("blackjack_game_state");
    expect(StorageProvider.removeItem).toHaveBeenCalledWith("blackjack_game_state");
    expect(StorageProvider.removeItem).toHaveBeenCalledWith("blackjack_last_save");
    expect(loadedState).toBeNull();
  });

  it("clears the saved game state", () => {
    StatePersistenceService.clearState();

    expect(StorageProvider.removeItem).toHaveBeenCalledWith("blackjack_game_state");
    expect(StorageProvider.removeItem).toHaveBeenCalledWith("blackjack_last_save");
  });

  it("gets the last save time", () => {
    (StorageProvider.getItem as jest.Mock).mockReturnValue("12:00 PM");

    const lastSaveTime = StatePersistenceService.getLastSaveTime();

    expect(StorageProvider.getItem).toHaveBeenCalledWith("blackjack_last_save");
    expect(lastSaveTime).toBe("12:00 PM");
  });

  it("checks if persistent storage is available", () => {
    (StorageProvider.isSessionPersistent as jest.Mock).mockReturnValue(true);

    const isPersistent = StatePersistenceService.isPersistentStorageAvailable();

    expect(StorageProvider.isSessionPersistent).toHaveBeenCalled();
    expect(isPersistent).toBe(true);
  });

  it("validates a correct game state", () => {
    const isValid = (StatePersistenceService as any).isValidState(mockGameState);

    expect(isValid).toBe(true);
  });

  it("invalidates an incorrect game state", () => {
    const invalidState = { ...mockGameState, playerHands: null }; // Invalid structure
    const isValid = (StatePersistenceService as any).isValidState(invalidState);

    expect(isValid).toBe(false);
  });

  it("checks if the game state is expired", () => {
    const expiredState = { ...mockGameState, timestamp: Date.now() - 7 * 60 * 60 * 1000 }; // 7 hours ago
    const isExpired = StatePersistenceService.isStateExpired(expiredState);

    expect(isExpired).toBe(true);
  });

  it("does not mark a recent game state as expired", () => {
    const recentState = { ...mockGameState, timestamp: Date.now() - 1 * 60 * 60 * 1000 }; // 1 hour ago
    const isExpired = StatePersistenceService.isStateExpired(recentState);

    expect(isExpired).toBe(false);
  });
});