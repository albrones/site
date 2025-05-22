<script lang="ts">
  import type { FutureLogEntry } from '../types';
  import { futureLogStore } from '../stores/logStore';
  import { onMount } from 'svelte';

  // Subscribe to future log entries
  // The store itself is auto-updating from localStorage within its definition.
  // We can directly use $futureLogStore in the template for reactive updates.

  let newEntryDescription: string = '';
  let newEntryTargetMonth: number | undefined = undefined;
  let newEntryTargetYear: number | undefined = new Date().getFullYear();

  const currentYear = new Date().getFullYear();
  const years: number[] = Array.from({length: 10}, (_, i) => currentYear + i);
  const months: {value: number, name: string}[] = Array.from({length: 12}, (_, i) => ({
    value: i + 1,
    name: new Date(0, i).toLocaleString('default', { month: 'long' })
  }));


  function handleAddEntry() {
    if (!newEntryDescription.trim()) {
      alert('Please enter a description for the future log entry.');
      return;
    }
    futureLogStore.addFutureLogEntry({
      description: newEntryDescription,
      targetMonth: newEntryTargetMonth,
      targetYear: newEntryTargetYear,
      // completed and createdAt will be set by the store
    });
    newEntryDescription = '';
    newEntryTargetMonth = undefined;
    newEntryTargetYear = new Date().getFullYear();
  }

  function handleDeleteEntry(id: string) {
    if (confirm('Are you sure you want to delete this future log entry?')) {
      futureLogStore.removeFutureLogEntry(id);
    }
  }

  function handleToggleCompletion(id: string) {
    futureLogStore.toggleFutureLogEntryCompletion(id);
  }

</script>

<div class="future-log-view">
  <h3>Future Log</h3>

  <div class="add-entry-form">
    <input type="text" bind:value={newEntryDescription} placeholder="New future task/event" />
    <select bind:value={newEntryTargetMonth}>
      <option value={undefined}>No Specific Month</option>
      {#each months as monthOpt}
        <option value={monthOpt.value}>{monthOpt.name}</option>
      {/each}
    </select>
    <select bind:value={newEntryTargetYear}>
      <option value={undefined}>No Specific Year</option>
      {#each years as yearOpt}
        <option value={yearOpt}>{yearOpt}</option>
      {/each}
    </select>
    <button on:click={handleAddEntry}>Add to Future Log</button>
  </div>

  <div class="entry-list">
    {#if $futureLogStore.entries && $futureLogStore.entries.length > 0}
      {#each $futureLogStore.entries as entry (entry.id)}
        <div class="future-entry-item" class:completed={entry.completed}>
          <input type="checkbox" bind:checked={entry.completed} on:change={() => handleToggleCompletion(entry.id)} />
          <span class="description">{entry.description}</span>
          <span class="target-date">
            {#if entry.targetMonth && entry.targetYear}
              {months.find(m => m.value === entry.targetMonth)?.name} {entry.targetYear}
            {:else if entry.targetYear}
              {entry.targetYear}
            {:else if entry.targetMonth}
              {months.find(m => m.value === entry.targetMonth)?.name} (Any Year)
            {:else}
              (No specific date)
            {/if}
          </span>
          <span class="created-at">Added: {new Date(entry.createdAt).toLocaleDateString()}</span>
          <button class="delete-btn" on:click={() => handleDeleteEntry(entry.id)}>Delete</button>
        </div>
      {/each}
    {:else}
      <p>No entries in the future log yet.</p>
    {/if}
  </div>
</div>

<style>
  .future-log-view {
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .add-entry-form {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
  }

  .add-entry-form input[type="text"] {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .add-entry-form select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .add-entry-form button {
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-entry-form button:hover {
    background-color: #0056b3;
  }

  .entry-list {
    margin-top: 15px;
  }

  .future-entry-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
    gap: 10px;
  }
  .future-entry-item:last-child {
    border-bottom: none;
  }

  .future-entry-item.completed .description {
    text-decoration: line-through;
    color: #aaa;
  }

  .future-entry-item .description {
    flex-grow: 1;
  }
  
  .target-date, .created-at {
    font-size: 0.9em;
    color: #555;
  }

  .delete-btn {
    background-color: #ff7875;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .delete-btn:hover {
    background-color: #ff4d4f;
  }
</style>
