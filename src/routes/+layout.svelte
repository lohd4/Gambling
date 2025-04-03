<script>
    import Header from "$lib/components/header/Header.svelte";
</script>

<div class="body">
    <Header/>
    <slot class="background"/>
</div>

<style>
    .body {
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-rows: 1fr 7fr;
    }

    .body :global(> :last-child) {
        width: 100vw;
        height: 87.5vh;
        overflow-y: auto;
        overflow-x: hidden;
        background: linear-gradient(to right, #0d3522 0%, #1b5e3a 35%, #1b5e3a 65%, #0d3522 100%);
    }

    .body :global(> :last-child)::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.15;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        background-size: 200px 200px;
        mix-blend-mode: overlay;
    }
</style>