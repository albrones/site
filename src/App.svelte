<script lang="ts">
  import DailyLogView from './lib/components/DailyLogView.svelte';
  import MonthlyLogView from './lib/components/MonthlyLogView.svelte';
  import FutureLogView from './lib/components/FutureLogView.svelte';
  import CustomListView from './lib/components/CustomListView.svelte';
  import ListManager from './lib/components/ListManager.svelte';
  import taskStore from './lib/stores/taskStore'; // preload to ensure it's initialized
  import { dailyLogStore, monthlyLogStore, futureLogStore } from './lib/stores/logStore'; // preload
  import listStore from './lib/stores/listStore'; // preload

  // Ensure stores are initialized by accessing them (Svelte's $ prefix does this)
  // This helps in loading data from localStorage at app startup
  $: console.log('Task store loaded:', $taskStore.length, 'tasks');
  $: console.log('Daily logs loaded:', Object.keys($dailyLogStore).length, 'days');
  $: console.log('Monthly logs loaded:', Object.keys($monthlyLogStore).length, 'months');
  $: console.log('Future log entries loaded:', $futureLogStore.entries.length, 'entries');
  $: console.log('Custom lists loaded:', $listStore.length, 'lists');


  type View = 'daily' | 'monthly' | 'future' | 'customList' | 'dashboard';
  let currentView: View = 'dashboard'; // Default view

  // State for different views
  let selectedDateForDailyLog: string = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
  let selectedListIdForCustomView: string | null = null;

  // Props for MonthlyLogView, bound to allow navigation within the component
  let monthlyViewYear: number = new Date().getFullYear();
  let monthlyViewMonth: number = new Date().getMonth() + 1; // 1-12

  function navigateTo(view: View) {
    currentView = view;
  }

  function showDailyLogForDate(date: string) {
    selectedDateForDailyLog = date;
    currentView = 'daily';
  }

  function handleDayClickedFromMonthly(event: CustomEvent<{ year: number; month: number; day: number }>) {
    const { year, month, day } = event.detail;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    showDailyLogForDate(dateStr);
  }

  function handleSelectListFromManager(event: CustomEvent<string>) {
    selectedListIdForCustomView = event.detail;
    if (selectedListIdForCustomView) {
      currentView = 'customList';
    } else {
      // If listId is empty (e.g. after delete), maybe go to dashboard or clear selection
      currentView = 'dashboard'; 
    }
  }

  // Helper to get today's date string
  function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
  }

</script>

<main>
  <header>
    <h1>Bullet Journal</h1>
    <nav>
      <button on:click={() => navigateTo('dashboard')} class:active={currentView === 'dashboard'}>Dashboard</button>
      <button on:click={() => showDailyLogForDate(getTodayISO())} class:active={currentView === 'daily' && selectedDateForDailyLog === getTodayISO()}>Today's Log</button>
      <button on:click={() => navigateTo('monthly')} class:active={currentView === 'monthly'}>Monthly Log</button>
      <button on:click={() => navigateTo('future')} class:active={currentView === 'future'}>Future Log</button>
    </nav>
  </header>

  <div class="app-body">
    <aside class="sidebar">
      <ListManager on:selectList={handleSelectListFromManager} />
    </aside>

    <section class="main-content">
      {#if currentView === 'dashboard'}
        <h2>Welcome to your Bullet Journal!</h2>
        <p>Select a log from the navigation or a custom list from the sidebar.</p>
        <p>Today is: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <button on:click={() => showDailyLogForDate(getTodayISO())}>View Today's Log</button>
         <!-- Quick summary components could go here eventually -->
      {/if}

      {#if currentView === 'daily'}
        <DailyLogView date={selectedDateForDailyLog} />
      {/if}

      {#if currentView === 'monthly'}
        <MonthlyLogView 
          bind:currentYear={monthlyViewYear} 
          bind:currentMonth={monthlyViewMonth} 
          on:dayClicked={handleDayClickedFromMonthly} 
        />
      {/if}

      {#if currentView === 'future'}
        <FutureLogView />
      {/if}

      {#if currentView === 'customList' && selectedListIdForCustomView}
        <CustomListView listId={selectedListIdForCustomView} />
      {:else if currentView === 'customList' && !selectedListIdForCustomView}
        <p>Please select a custom list from the sidebar to view its tasks.</p>
      {/if}
    </section>
  </div>
</main>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    background-color: #f4f4f8;
    color: #333;
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Full viewport height */
  }

  header {
    background-color: #4A5568; /* Tailwind Slate 700 */
    color: white;
    padding: 1rem;
    text-align: center;
  }

  header h1 {
    margin: 0 0 0.5rem 0;
  }

  nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  nav button {
    background-color: transparent;
    color: white;
    border: 1px solid white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }
  nav button:hover, nav button.active {
    background-color: #2D3748; /* Tailwind Slate 800 */
  }

  .app-body {
    display: flex;
    flex-grow: 1; /* Takes remaining height */
    overflow: hidden; /* Prevent scrollbars on body if content overflows */
  }

  .sidebar {
    width: 280px;
    background-color: #EDF2F7; /* Tailwind Cool Gray 100 / Slate 100 */
    padding: 1rem;
    overflow-y: auto; /* Scroll if content is too long */
    border-right: 1px solid #CBD5E0; /* Tailwind Cool Gray 300 / Slate 300 */
  }

  .main-content {
    flex-grow: 1;
    padding: 1.5rem;
    overflow-y: auto; /* Scroll if content is too long */
    background-color: #FFFFFF;
  }
  
  .main-content h2 {
      margin-top: 0;
  }

  /* Basic styling for dashboard */
  .main-content button {
    padding: 0.6rem 1.2rem;
    background-color: #4299E1; /* Tailwind Blue 500 */
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
  }
  .main-content button:hover {
    background-color: #2B6CB0; /* Tailwind Blue 700 */
  }

</style>
