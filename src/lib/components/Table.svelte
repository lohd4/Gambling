<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { gameStore } from "$lib/stores/gameStore";
  import { StatePersistenceService } from "$lib/services/persistence/StatePersistence";
  import Dealer from "./Dealer.svelte";
  import Player from "./Player.svelte";
  import Actions from "./Actions.svelte";
  import GameStateFeedback from "./GameStateFeedback.svelte";

  let isInitializing = true;
  let isRestoringState = false;

  onMount(() => {
    // Check for saved game state
    const savedState = StatePersistenceService.loadState();

    if (
      savedState &&
      savedState.gameStatus !== "betting" &&
      savedState.playerHands.length > 0
    ) {
      isRestoringState = true;
    }

    const unsubscribe = gameStore.subscribe((state) => {
      if (isInitializing) {
        if (
          !isRestoringState &&
          state.gameStatus === "betting" &&
          !state.deckId
        ) {
          gameStore.startNewGame();
        }
        isInitializing = false;
      }
    });

    return unsubscribe;
  });
</script>

<div class="blackjack-table">
  <Dealer />

  <div class="player-area">
    <Player />
  </div>

  <Actions />

  {#if isRestoringState}
    <div class="state-restore-notice" transition:fade>
      Game state restored from your last session
    </div>
  {/if}

  {#if $gameStore.error}
    <div class="error-message">
      {$gameStore.error}
      <button
        class="close-btn"
        on:click={() => gameStore.update((s) => ({ ...s, error: null }))}
        >×</button
      >
    </div>
  {/if}

  {#if $gameStore.isLoading}
    <div class="loading-overlay">
      <div class="spinner"></div>
    </div>
  {/if}

  <GameStateFeedback />
</div>

<style>
  .blackjack-table {
    position: relative;
    background-color: #277c3b;
    border-radius: 50% / 30%;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 800px;
    min-height: 500px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  .player-area {
    margin-top: 3rem;
  }

  .error-message {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(220, 53, 69, 0.9);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    max-width: 90%;
    text-align: center;
    display: flex;
    align-items: center;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 8px;
  }

  .state-restore-notice {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
    animation: fadeOut 3s forwards;
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 50% / 30%;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
