<script lang="ts">
  import LightSwitch from './lib/LightSwitch.svelte';
  import './app.css'; // Make sure global styles are imported

  let currentEdgeColor: string = '#888888'; // Default grey
  let currentButtonColor: string = '#AAAAAA'; // Default light grey
</script>

<div class="app-container">
  <header>
    <h1>3D Light Switch</h1>
    <div class="controls">
      <div>
        <label for="edgeColorPicker">Edge Color:</label>
        <input type="color" id="edgeColorPicker" bind:value={currentEdgeColor} />
      </div>
      <div>
        <label for="buttonColorPicker">Button Color:</label>
        <input type="color" id="buttonColorPicker" bind:value={currentButtonColor} />
      </div>
    </div>
  </header>

  <main class="switch-canvas-container">
    <LightSwitch edgeColor={currentEdgeColor} buttonColor={currentButtonColor} />
  </main>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    margin: 0; /* Remove default margin */
    padding: 0; /* Remove default padding */
    box-sizing: border-box; /* Better layout control */
  }
  header {
    padding: 1rem;
    background-color: #f0f0f0; /* Light background for header */
    color: #333; /* Dark text for header */
    flex-shrink: 0; /* Prevent header from shrinking */
  }
  .controls {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    align-items: center;
  }
  .controls label {
    font-weight: bold;
  }
  .switch-canvas-container {
    flex-grow: 1; /* Allows the canvas to take remaining space */
    overflow: hidden; /* Ensures canvas doesn't cause overflow */
    background-color: #333; /* Dark background for the canvas area */
    display: flex; /* Ensure LightSwitch container can stretch */
    justify-content: center; /* Center if smaller */
    align-items: center; /* Center if smaller */
  }

  /* Ensure LightSwitch.svelte's canvas uses full space of its container if its own styles are scoped */
  /* These :global styles are crucial if LightSwitch.svelte's styles are scoped (which they typically are in Svelte) */
  :global(.light-switch-container) {
    width: 100%;
    height: 100%;
  }
  /* The canvas inside LightSwitch.svelte should already be 100% width/height from its own styles. */
  /* Adding !important here is a fallback if there are specificity issues. */
  :global(.light-switch-container canvas) {
    width: 100% !important; 
    height: 100% !important;
  }

  /* Reset some global styles that might interfere from app.css */
  :global(body) {
    margin: 0; /* Ensure body has no margin */
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif; /* Default font */
  }
  :global(h1) {
    font-size: 1.5em; /* Smaller H1 for the header */
    line-height: 1.2;
    margin: 0; /* Remove default H1 margin */
  }
</style>
