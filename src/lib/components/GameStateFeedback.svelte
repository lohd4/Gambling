<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { gameStore } from "$lib/stores/gameStore";
  import { StatePersistenceService } from "$lib/services/persistence/StatePersistence";

  let message = "";
  let isVisible = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  const showMessage = (text: string) => {
    message = text;
    isVisible = true;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      isVisible = false;
    }, 3000);
  };

  const unsubscribe = gameStore.subscribe((state) => {
    // Check if there was a state change that might have triggered a save
    const lastSaveTime = StatePersistenceService.getLastSaveTime();

    if (lastSaveTime) {
      // Only show message when we have state changes that are important
      if (state.gameStatus !== "betting" && state.playerHands.length > 0) {
        showMessage(`Game saved automatically (${lastSaveTime})`);
      }
    }
  });

  onMount(() => {
    if (!StatePersistenceService.isPersistentStorageAvailable()) {
      showMessage("Game progress will not be saved when you close this tab");
    }
  });

  onDestroy(() => {
    unsubscribe();
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

{#if isVisible}
  <div class="feedback-message" transition:fade={{ duration: 300 }}>
    {message}
  </div>
{/if}

<style>
  .feedback-message {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    pointer-events: none;
  }
</style>
