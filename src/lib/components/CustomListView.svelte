<script lang="ts">
  import type { Task, CustomList } from '../types';
  import taskStore from '../stores/taskStore';
  import listStore from '../stores/listStore'; // Default export
  import TaskItem from './TaskItem.svelte';
  import { onMount } from 'svelte';

  export let listId: string;

  let currentList: CustomList | undefined = undefined;
  let tasksInList: Task[] = [];
  let newTaskDescription: string = '';

  // Reactive updates for currentList and tasksInList
  $: {
    const allLists = $listStore; // $listStore is the array of lists from the default export
    currentList = allLists.find(l => l.id === listId);
    if (currentList) {
      const allTasks = $taskStore;
      tasksInList = currentList.tasks
        .map(taskId => allTasks.find(t => t.id === taskId))
        .filter(task => task !== undefined) as Task[];
    } else {
      tasksInList = [];
    }
  }

  function handleAddTaskToList() {
    if (!newTaskDescription.trim() || !currentList) return;

    // Similar to DailyLogView, handle getting new task's ID.
    // For now, using the same temporary approach.
    taskStore.addTask(newTaskDescription);

    let addedTask: Task | undefined;
    const unsubscribe = taskStore.subscribe(allTasks => {
        // Attempt to find the task that was just added and isn't already in this list
        addedTask = allTasks.find(t => 
            t.description === newTaskDescription && 
            !tasksInList.some(existingTask => existingTask.id === t.id)
        );
    });
    unsubscribe();

    if (addedTask) {
      listStore.addTaskToList(currentList.id, addedTask.id);
    } else {
      // Fallback: find the most recent task with matching description not already in list
      const allCurrentTasks = $taskStore;
      const potentiallyAddedTask = allCurrentTasks
                                      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                      .find(t => t.description === newTaskDescription && !tasksInList.some(existingTask => existingTask.id === t.id));
      
      if(potentiallyAddedTask) {
        listStore.addTaskToList(currentList.id, potentiallyAddedTask.id);
      } else {
        console.error("Failed to find the newly added task to link to custom list.");
      }
    }
    newTaskDescription = ''; // Clear input
  }

</script>

<div class="custom-list-view">
  {#if currentList}
    <h3>{currentList.name}</h3>

    <div class="add-task-form">
      <input type="text" bind:value={newTaskDescription} placeholder="Add a new task to this list" />
      <button on:click={handleAddTaskToList}>Add Task</button>
    </div>

    <div class="task-list">
      {#if tasksInList.length > 0}
        {#each tasksInList as task (task.id)}
        <TaskItem {task} currentContextType="customList" currentContextId={listId} />
        {/each}
      {:else}
        <p>This list is empty.</p>
      {/if}
    </div>
  {:else}
    <p>List not found. Select a list to view its tasks.</p>
  {/if}
</div>

<style>
  .custom-list-view {
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .add-task-form {
    display: flex;
    margin-bottom: 15px;
  }

  .add-task-form input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .add-task-form button {
    padding: 8px 12px;
    margin-left: 8px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-task-form button:hover {
    background-color: #0056b3;
  }

  .task-list p {
    color: #777;
  }
</style>
