<script lang="ts">
  import type { CustomList } from '../types';
  import listStore from '../stores/listStore'; // Default export
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ selectList: string }>(); // Dispatches listId

  let newListName: string = '';

  // $listStore will reactively provide the array of lists
  // No need for a separate variable unless further processing is done

  function handleCreateList() {
    if (!newListName.trim()) {
      alert('Please enter a name for the new list.');
      return;
    }
    listStore.addList(newListName);
    newListName = ''; // Clear input
  }

  function handleSelectList(listId: string) {
    dispatch('selectList', listId);
  }

  function handleDeleteList(listId: string) {
    if (confirm('Are you sure you want to delete this list? All tasks in it will be unlisted.')) {
      listStore.deleteList(listId);
      // Optionally, if a deleted list was selected, dispatch an event to clear selection
      // dispatch('selectList', ''); // or undefined, depending on how App.svelte handles it
    }
  }
</script>

<div class="list-manager">
  <h4>Custom Lists</h4>
  <div class="add-list-form">
    <input type="text" bind:value={newListName} placeholder="New list name" />
    <button on:click={handleCreateList}>Create List</button>
  </div>

  <ul class="list-of-lists">
    {#if $listStore && $listStore.length > 0}
      {#each $listStore as list (list.id)}
        <li class="list-item">
          <span class="list-name" on:click={() => handleSelectList(list.id)} role="button" tabindex="0" on:keypress|enter={() => handleSelectList(list.id)}>
            {list.name}
          </span>
          <button class="delete-list-btn" on:click|stopPropagation={() => handleDeleteList(list.id)}>Delete</button>
        </li>
      {/each}
    {:else}
      <p>No custom lists yet. Create one above!</p>
    {/if}
  </ul>
</div>

<style>
  .list-manager {
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .list-manager h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }

  .add-list-form {
    display: flex;
    margin-bottom: 15px;
  }

  .add-list-form input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
  }

  .add-list-form button {
    padding: 8px 12px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
  }
  .add-list-form button:hover {
    background-color: #218838;
  }

  .list-of-lists {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }
  .list-item:last-child {
    border-bottom: none;
  }
  .list-item:hover {
    background-color: #f0f0f0;
  }

  .list-name {
    flex-grow: 1;
    padding: 4px; /* Make clickable area slightly larger */
  }
  
  .delete-list-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
  }
  .delete-list-btn:hover {
    background-color: #c82333;
  }

  .list-of-lists p {
    color: #777;
    font-style: italic;
  }
</style>
