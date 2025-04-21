<script lang="ts">
  import Blackjack from "$lib/game/Blackjack";
  let gameHasStarted = false;
  let startingMoney = 1000;

  const startGame = (startingMoney: number) => {
    const blackJack = new Blackjack(startingMoney)
    blackJack.init().then(() => {
      
    })
  }

</script>

<main>
  {#if !gameHasStarted}
  <div>  
    <button onclick={() => startGame(startingMoney)}>Start Game</button>
    <div>Starting Amount {startingMoney}</div>
    <Slider value={startingMoney} max={10000} min={100} step={100} />
  </div>
    {/if}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
</style>
