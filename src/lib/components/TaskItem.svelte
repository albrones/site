<script lang="ts">
  import type { Task } from '../types';
  import taskStore from '../stores/taskStore';
  import listStore from '../stores/listStore';
  import { dailyLogStore } from '../stores/logStore';

  export let task: Task;
  export let currentContextType: 'daily' | 'customList' | 'future' | null = null;
  export let currentContextId: string | null = null; // e.g., date for daily, listId for custom, entry.id for future

  let showMoveOptions = false; // Basic toggle for simplicity, could be a modal component later

  function openMoveModal() {
    showMoveOptions = !showMoveOptions;
    // In a real app, this would open a more sophisticated modal.
    // For now, we'll add interactive elements directly or use prompts.
  }

  async function moveToCustomList() {
    const lists = $listStore;
    if (!lists.length) {
      alert('No custom lists available to move to.');
      return;
    }
    const listNames = lists.map((l, i) => `(${i + 1}) ${l.name}`).join('\n');
    const choice = prompt(`Move task "${task.description}" to which list?\nEnter number:\n${listNames}`);
    if (choice && !isNaN(parseInt(choice))) {
      const selectedList = lists[parseInt(choice) - 1];
      if (selectedList) {
        await executeMove(task.id, 'customList', selectedList.id);
        showMoveOptions = false;
      } else {
        alert('Invalid selection.');
      }
    }
  }

  async function moveToDailyLog() {
    let dateStr = prompt('Enter date to move to (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (dateStr) {
      // Basic validation for YYYY-MM-DD format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        alert('Invalid date format. Please use YYYY-MM-DD.');
        return;
      }
      try {
        new Date(dateStr).toISOString(); // Check if it's a valid date
        await executeMove(task.id, 'daily', dateStr);
        showMoveOptions = false;
      } catch (e) {
        alert('Invalid date entered.');
        return;
      }
    }
  }

  async function executeMove(taskId: string, targetType: 'customList' | 'daily', targetId: string) {
    if (!currentContextType || !currentContextId) {
      console.warn('Task context not set, cannot determine source for move.');
      // If context is not set, we can only add to destination, not remove from source.
      // This might be okay for tasks not yet in any list/log.
    } else {
      // 1. Remove from current context
      if (currentContextType === 'customList' && currentContextId) {
        listStore.removeTaskFromList(currentContextId, taskId);
      } else if (currentContextType === 'daily' && currentContextId) {
        dailyLogStore.removeTaskFromDailyLog(currentContextId, taskId);
      }
      // Add more 'else if' for monthly, future log contexts as they are implemented
    }

    // 2. Add to new context
    if (targetType === 'customList') {
      listStore.addTaskToList(targetId, taskId);
      alert(`Task moved to custom list.`);
    } else if (targetType === 'daily') {
      dailyLogStore.addTaskIdToDailyLog(targetId, taskId);
      alert(`Task moved to daily log for ${targetId}.`);
    }

    // Notify App.svelte or parent to potentially refresh views or change context
    // This might be needed if the task is removed from the currently viewed list/log.
    // For now, store reactivity should handle it, but complex scenarios might need explicit events.
  }

  function handleToggleComplete() {
    taskStore.toggleTaskCompletion(task.id);
    // Optionally re-assign task to trigger reactivity if needed locally,
    // though store updates should ideally propagate.
    // task = { ...task, completed: !task.completed }; 
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this task?')) {
      taskStore.deleteTask(task.id);
    }
  }
</script>

<div class="task-item" class:completed={task.completed}>
  <input type="checkbox" bind:checked={task.completed} on:change={handleToggleComplete} />
  <span class="description">{task.description}</span>
  {#if task.priority}
    <span class="priority priority-{task.priority}">{task.priority}</span>
  {/if}
  {#if task.dueDate}
    <span class="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
  {/if}
  <button class="delete-btn" on:click={handleDelete}>Delete</button>
  <button class="move-btn" on:click={openMoveModal}>Move</button>
  {#if showMoveOptions}
    <div class="move-options">
      <button on:click={moveToCustomList}>To Custom List</button>
      <button on:click={moveToDailyLog}>To Daily Log</button>
      <!-- Add more options later e.g. Monthly Log, Future Log -->
    </div>
  {/if}
</div>

<style>
  .task-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
  }

  .task-item.completed .description {
    text-decoration: line-through;
    color: #aaa;
  }

  .description {
    flex-grow: 1;
    margin-left: 8px;
    margin-right: 8px;
  }

  .priority {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8em;
    margin-right: 8px;
    color: white;
  }
  .priority-high { background-color: #ff4d4f; }
  .priority-medium { background-color: #faad14; }
  .priority-low { background-color: #52c41a; }

  .due-date {
    font-size: 0.9em;
    color: #777;
    margin-right: 8px;
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

  .move-btn {
    background-color: #1890ff; /* Ant Design Blue */
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 4px;
  }
  .move-btn:hover {
    background-color: #096dd9;
  }

  .move-options {
    display: flex;
    gap: 5px; /* Spacing between buttons */
    padding: 5px;
    background-color: #f0f2f5; /* Light background for the options area */
    border-radius: 4px;
    margin-top: 5px;
  }

  .move-options button {
    background-color: #52c41a; /* Ant Design Green */
    color: white;
    border: none;
    padding: 3px 6px;
    font-size: 0.9em;
    border-radius: 3px;
  }
  .move-options button:hover {
    background-color: #389e0d;
  }
</style>
