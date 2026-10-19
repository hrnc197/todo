(function() {
  // Initialize Supabase Client
  const SUPABASE_URL = 'https://fjhoqsujnlglcwrgtaav.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaG9xc3VqbmxnbGN3cmd0YWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzODY2MDgsImV4cCI6MjEwNzk2MjYwOH0.7enRnU6ranhxJLu8kKScVTP3qlx_inF1vk40N1uUFy4';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  // Event Listeners
  document.addEventListener('DOMContentLoaded', fetchTodos);
  todoForm.addEventListener('submit', addTodo);

  // 1. Fetch and Display Todos from Supabase
  async function fetchTodos() {
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error.message);
      return;
    }

    todoList.innerHTML = '';
    if (todos) {
      todos.forEach(todo => renderTodo(todo));
    }
  }

  // 2. Add a New Todo
  async function addTodo(e) {
    e.preventDefault();
    const taskText = todoInput.value.trim();

    if (!taskText) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: taskText, is_completed: false }])
      .select();

    if (error) {
      console.error('Error adding task:', error);
      alert('Supabase Error: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      renderTodo(data[0]);
    }
    todoInput.value = '';
  }

  // 3. Toggle Todo Status (Completed / Pending)
  async function toggleTodo(id, currentStatus) {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error.message);
      alert('Supabase Error: ' + error.message);
      return;
    }

    fetchTodos();
  }

  // 4. Delete a Todo
  async function deleteTodo(id) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error.message);
      alert('Supabase Error: ' + error.message);
      return;
    }

    fetchTodos();
  }

  // Helper Function: Render Todo in DOM
  function renderTodo(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.is_completed ? 'completed' : ''}`;

    const taskContainer = document.createElement('div');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.is_completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id, todo.is_completed));

    const span = document.createElement('span');
    span.textContent = todo.task;

    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(taskContainer);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
  }
})();
