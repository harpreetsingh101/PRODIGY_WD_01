// ================= FORCE HOME ON RELOAD =================
window.addEventListener("load", () => {
  const entry = document.getElementById("entry");
  const app = document.getElementById("app");

  // Always reset to home/entry screen
  entry.classList.remove("hidden");
  app.classList.add("hidden");

  // Optional: reset active navigation
  const navBtns = document.querySelectorAll(".nav-btn");
  const views = document.querySelectorAll(".view");

  navBtns.forEach(btn => btn.classList.remove("active"));
  views.forEach(view => view.classList.remove("active"));

  // Set Dashboard as default active (but hidden until Start App)
  const dashboardBtn = document.querySelector('[data-view="dashboard"]');
  const dashboardView = document.getElementById("dashboard");

  if (dashboardBtn && dashboardView) {
    dashboardBtn.classList.add("active");
    dashboardView.classList.add("active");
  }
});
// ===============================================
// PRODIGY HUB - ADVANCED JAVASCRIPT
// ===============================================

// ========== STATE MANAGEMENT ==========
const AppState = {
  user: {
    name: '',
    goal: '',
    onboarded: false
  },
  notes: [],
  todos: [],
  completedTasks: 0,
  focusSessions: 0,
  totalFocusMinutes: 0,
  currentFilter: 'all',
  theme: 'dark'
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  initializeApp();
});

function initializeApp() {
  // Check if user has completed onboarding
  if (AppState.user.onboarded) {
    showApp();
  } else {
    showOnboarding();
  }
  
  // Initialize event listeners
  initOnboardingListeners();
  initNavigationListeners();
  initThemeListeners();
  initNotesListeners();
  initTodoListeners();
  initTimerListeners();
  
  // Update UI
  updateDashboard();
  updateBadges();
}

// ========== STORAGE FUNCTIONS ==========
function saveToStorage() {
  localStorage.setItem('prodigyAppState', JSON.stringify(AppState));
}

function loadFromStorage() {
  const saved = localStorage.getItem('prodigyAppState');
  if (saved) {
    Object.assign(AppState, JSON.parse(saved));
  }
}

// ========== ONBOARDING FLOW ==========
let currentStep = 1;
let selectedGoal = '';

function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  currentStep = 1;
  updateProgressBar();
}

function showApp() {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  updateGreeting();
  updateUserInfo();
  runCounters();
}

function initOnboardingListeners() {
  // Goal card selection
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedGoal = card.dataset.goal;
    });
  });
}

function nextStep() {
  // Validation
  if (currentStep === 2) {
    const nameInput = document.getElementById('userName');
    if (!nameInput.value.trim()) {
      showToast('Please enter your name');
      return;
    }
    AppState.user.name = nameInput.value.trim();
  }
  
  if (currentStep === 3) return; // Last step uses completeOnboarding
  
  // Hide current step
  document.querySelector(`.onboarding-step[data-step="${currentStep}"]`).classList.remove('active');
  
  // Show next step
  currentStep++;
  document.querySelector(`.onboarding-step[data-step="${currentStep}"]`).classList.add('active');
  updateProgressBar();
}

function prevStep() {
  if (currentStep === 1) return;
  
  document.querySelector(`.onboarding-step[data-step="${currentStep}"]`).classList.remove('active');
  currentStep--;
  document.querySelector(`.onboarding-step[data-step="${currentStep}"]`).classList.add('active');
  updateProgressBar();
}

function updateProgressBar() {
  const progress = (currentStep / 3) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
}

function completeOnboarding() {
  if (!selectedGoal) {
    showToast('Please select your main focus');
    return;
  }
  
  AppState.user.goal = selectedGoal;
  AppState.user.onboarded = true;
  saveToStorage();
  
  showApp();
  showToast(`Welcome, ${AppState.user.name}! 🎉`);
}

// ========== NAVIGATION ==========
function initNavigationListeners() {
  const navBtns = document.querySelectorAll('.nav-btn[data-view]');
  const views = document.querySelectorAll('.view');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active nav button
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Switch view
      const viewId = btn.dataset.view;
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      
      // Run view-specific logic
      if (viewId === 'dashboard') {
        runCounters();
        updateTodayOverview();
      } else if (viewId === 'notes') {
        renderNotes();
      } else if (viewId === 'todo') {
        renderTodos();
      }
    });
  });
}

// ========== THEME ==========
function initThemeListeners() {
  const themeToggle = document.getElementById('themeToggle');
  const themeSettingToggle = document.getElementById('themeSettingToggle');
  const themeIcon = document.getElementById('themeIcon');
  
  // Apply saved theme
  if (AppState.theme === 'light') {
    document.body.classList.add('light');
    themeIcon.textContent = '☀️';
  }
  
  const toggleTheme = () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    AppState.theme = isLight ? 'light' : 'dark';
    themeIcon.textContent = isLight ? '☀️' : '🌙';
    saveToStorage();
  };
  
  themeToggle.addEventListener('click', toggleTheme);
  themeSettingToggle.addEventListener('click', toggleTheme);
}

// ========== DASHBOARD ==========
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';
  
  const greetingText = document.getElementById('greetingText');
  greetingText.textContent = `${greeting}, ${AppState.user.name}`;
  
  const dateText = document.getElementById('dateText');
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  dateText.textContent = date;
}

function updateUserInfo() {
  const avatar = document.getElementById('userAvatar');
  avatar.textContent = AppState.user.name.charAt(0).toUpperCase();
  
  const settingsName = document.getElementById('settingsUserName');
  settingsName.textContent = AppState.user.name;
}

function updateDashboard() {
  // Update stat counts
  document.getElementById('completedCount').dataset.target = AppState.completedTasks;
  document.getElementById('notesCount').dataset.target = AppState.notes.length;
  document.getElementById('focusCount').dataset.target = AppState.focusSessions;
  
  updateTodayOverview();
}

function runCounters() {
  const counters = document.querySelectorAll('.counter');
  
  counters.forEach(counter => {
    const target = +counter.dataset.target;
    let current = 0;
    const increment = target / 50;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    updateCounter();
  });
}

function updateTodayOverview() {
  const container = document.getElementById('todayOverview');
  const activeTodos = AppState.todos.filter(t => !t.completed);
  
  if (activeTodos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✨</div>
        <h3>You're all caught up!</h3>
        <p>No pending tasks for today</p>
      </div>
    `;
  } else {
    const tasksHTML = activeTodos.slice(0, 5).map(todo => `
      <div class="todo-item" style="margin-bottom: 0.5rem;">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})"></div>
        <div class="todo-content">
          <div class="todo-text">${todo.text}</div>
          <div class="todo-meta">
            <span class="todo-priority ${todo.priority}">${todo.priority}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = `
      <h3 style="margin-bottom: 1rem;">Active Tasks (${activeTodos.length})</h3>
      ${tasksHTML}
      ${activeTodos.length > 5 ? `<p style="color: var(--text-secondary); margin-top: 1rem;">+${activeTodos.length - 5} more tasks</p>` : ''}
    `;
  }
}

function updateBadges() {
  const notesBadge = document.getElementById('notesBadge');
  const todoBadge = document.getElementById('todoBadge');
  
  notesBadge.textContent = AppState.notes.length;
  todoBadge.textContent = AppState.todos.filter(t => !t.completed).length;
  
  // Hide badge if count is 0
  notesBadge.style.display = AppState.notes.length > 0 ? 'block' : 'none';
  todoBadge.style.display = AppState.todos.filter(t => !t.completed).length > 0 ? 'block' : 'none';
}

// ========== QUICK ACTIONS ==========
function quickAddTask() {
  const navBtn = document.querySelector('.nav-btn[data-view="todo"]');
  navBtn.click();
  document.getElementById('todoInput').focus();
}

function quickAddNote() {
  const navBtn = document.querySelector('.nav-btn[data-view="notes"]');
  navBtn.click();
  createNewNote();
}

function startFocusSession() {
  const navBtn = document.querySelector('.nav-btn[data-view="focus"]');
  navBtn.click();
  document.getElementById('startTimer').click();
}

// ========== NOTES SYSTEM ==========
let currentNoteId = null;

function initNotesListeners() {
  // Note modal is opened via createNewNote() or editNote()
}

function renderNotes() {
  const grid = document.getElementById('notesGrid');
  const emptyState = document.getElementById('notesEmptyState');
  
  if (AppState.notes.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = AppState.notes.map(note => `
      <div class="note-card" onclick="editNote(${note.id})">
        <h3>${note.title || 'Untitled'}</h3>
        <p>${note.content}</p>
        <div class="note-card-footer">
          <span class="note-date">${formatDate(note.date)}</span>
          <div class="note-actions">
            <button onclick="event.stopPropagation(); deleteNote(${note.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function createNewNote() {
  currentNoteId = null;
  document.getElementById('noteModalTitle').textContent = 'New Note';
  document.getElementById('noteTitleInput').value = '';
  document.getElementById('noteContentInput').value = '';
  document.getElementById('noteModal').classList.remove('hidden');
  document.getElementById('noteTitleInput').focus();
}

function editNote(id) {
  const note = AppState.notes.find(n => n.id === id);
  if (!note) return;
  
  currentNoteId = id;
  document.getElementById('noteModalTitle').textContent = 'Edit Note';
  document.getElementById('noteTitleInput').value = note.title;
  document.getElementById('noteContentInput').value = note.content;
  document.getElementById('noteModal').classList.remove('hidden');
}

function saveNote() {
  const title = document.getElementById('noteTitleInput').value.trim();
  const content = document.getElementById('noteContentInput').value.trim();
  
  if (!title && !content) {
    showToast('Please add some content');
    return;
  }
  
  if (currentNoteId) {
    // Update existing note
    const note = AppState.notes.find(n => n.id === currentNoteId);
    note.title = title;
    note.content = content;
    note.date = Date.now();
  } else {
    // Create new note
    AppState.notes.push({
      id: Date.now(),
      title: title,
      content: content,
      date: Date.now()
    });
  }
  
  saveToStorage();
  closeNoteModal();
  renderNotes();
  updateDashboard();
  updateBadges();
  showToast('Note saved successfully');
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  
  AppState.notes = AppState.notes.filter(n => n.id !== id);
  saveToStorage();
  renderNotes();
  updateDashboard();
  updateBadges();
  showToast('Note deleted');
}

function closeNoteModal() {
  document.getElementById('noteModal').classList.add('hidden');
  currentNoteId = null;
}

// ========== TODO SYSTEM ==========
function initTodoListeners() {
  const addBtn = document.getElementById('addTodo');
  const input = document.getElementById('todoInput');
  
  addBtn.addEventListener('click', addTodo);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });
}

function addTodo() {
  const input = document.getElementById('todoInput');
  const priority = document.getElementById('todoPriority');
  const text = input.value.trim();
  
  if (!text) {
    showToast('Please enter a task');
    return;
  }
  
  AppState.todos.push({
    id: Date.now(),
    text: text,
    priority: priority.value,
    completed: false,
    date: Date.now()
  });
  
  input.value = '';
  saveToStorage();
  renderTodos();
  updateDashboard();
  updateBadges();
  showToast('Task added');
}

function renderTodos() {
  const list = document.getElementById('todoList');
  const emptyState = document.getElementById('todoEmptyState');
  
  let filteredTodos = AppState.todos;
  if (AppState.currentFilter === 'active') {
    filteredTodos = AppState.todos.filter(t => !t.completed);
  } else if (AppState.currentFilter === 'completed') {
    filteredTodos = AppState.todos.filter(t => t.completed);
  }
  
  if (filteredTodos.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    list.style.display = 'block';
    emptyState.style.display = 'none';
    
    list.innerHTML = filteredTodos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})"></div>
        <div class="todo-content">
          <div class="todo-text">${todo.text}</div>
          <div class="todo-meta">
            <span class="todo-priority ${todo.priority}">${todo.priority}</span>
            <span>${formatDate(todo.date)}</span>
          </div>
        </div>
        <button class="todo-delete" onclick="deleteTodo(${todo.id})">×</button>
      </li>
    `).join('');
  }
}

function toggleTodo(id) {
  const todo = AppState.todos.find(t => t.id === id);
  if (!todo) return;
  
  todo.completed = !todo.completed;
  
  if (todo.completed) {
    AppState.completedTasks++;
    showToast('Task completed! 🎉');
  } else {
    AppState.completedTasks--;
  }
  
  saveToStorage();
  renderTodos();
  updateDashboard();
  updateBadges();
  updateTodayOverview();
}

function deleteTodo(id) {
  AppState.todos = AppState.todos.filter(t => t.id !== id);
  saveToStorage();
  renderTodos();
  updateDashboard();
  updateBadges();
  updateTodayOverview();
  showToast('Task deleted');
}

// ========== FOCUS TIMER ==========
let timerInterval = null;
let timerSeconds = 25 * 60; // 25 minutes
let timerRunning = false;
const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
let isBreak = false;

function initTimerListeners() {
  const startBtn = document.getElementById('startTimer');
  const resetBtn = document.getElementById('resetTimer');
  
  startBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);
  
  // Update timer stats
  document.getElementById('sessionsToday').textContent = AppState.focusSessions;
  document.getElementById('totalMinutes').textContent = AppState.totalFocusMinutes;
  
  updateTimerDisplay();
}

function toggleTimer() {
  const startBtn = document.getElementById('startTimer');
  
  if (timerRunning) {
    // Pause
    clearInterval(timerInterval);
    timerRunning = false;
    startBtn.textContent = 'Resume';
  } else {
    // Start
    timerRunning = true;
    startBtn.textContent = 'Pause';
    
    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();
      updateTimerProgress();
      
      if (timerSeconds <= 0) {
        completeTimer();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = isBreak ? BREAK_TIME : FOCUS_TIME;
  isBreak = false;
  
  document.getElementById('startTimer').textContent = 'Start Focus';
  document.getElementById('timerLabel').textContent = 'Focus Time';
  updateTimerDisplay();
  updateTimerProgress();
}

function completeTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  if (!isBreak) {
    // Focus session completed
    AppState.focusSessions++;
    AppState.totalFocusMinutes += 25;
    saveToStorage();
    
    // Update stats
    document.getElementById('sessionsToday').textContent = AppState.focusSessions;
    document.getElementById('totalMinutes').textContent = AppState.totalFocusMinutes;
    updateDashboard();
    
    showToast('Focus session complete! 🎉 Time for a break.');
    
    // Start break
    isBreak = true;
    timerSeconds = BREAK_TIME;
    document.getElementById('timerLabel').textContent = 'Break Time';
    document.getElementById('startTimer').textContent = 'Start Break';
  } else {
    // Break completed
    showToast('Break over! Ready for another session?');
    resetTimer();
  }
  
  updateTimerDisplay();
  updateTimerProgress();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timerDisplay').textContent = display;
}

function updateTimerProgress() {
  const totalSeconds = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = timerSeconds / totalSeconds;
  const circumference = 565.48; // 2 * PI * 90
  const offset = circumference * (1 - progress);
  
  const progressCircle = document.getElementById('timerProgress');
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = offset;
  }
}

// ========== SETTINGS ==========
function editUserName() {
  const newName = prompt('Enter your name:', AppState.user.name);
  if (newName && newName.trim()) {
    AppState.user.name = newName.trim();
    saveToStorage();
    updateGreeting();
    updateUserInfo();
    showToast('Name updated');
  }
}

function resetAllData() {
  if (!confirm('Are you sure? This will delete all your data.')) return;
  
  localStorage.removeItem('prodigyAppState');
  location.reload();
}

// ========== UTILITY FUNCTIONS ==========
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'Just now';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Close modal when clicking overlay
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeNoteModal();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    closeNoteModal();
  }
  
  // Ctrl/Cmd + K to quick add task (when not in input)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.target.matches('input, textarea')) {
    e.preventDefault();
    quickAddTask();
  }
  
  // Ctrl/Cmd + N to new note (when not in input)
  if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.target.matches('input, textarea')) {
    e.preventDefault();
    quickAddNote();
  }
});
// ===== MOBILE SIDEBAR TOGGLE =====
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Close sidebar when a nav item is clicked (mobile)
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
    }
  });
});
const sidebar = document.querySelector(".sidebar");

const overlay = document.createElement("div");
overlay.className = "sidebar-overlay";
document.body.appendChild(overlay);

function toggleSidebar() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// Attach toggle to logo (mobile-friendly)
document.querySelector(".sidebar-header")?.addEventListener("click", toggleSidebar);

// Close on overlay tap
overlay.addEventListener("click", toggleSidebar);

// Close sidebar after clicking menu item
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
      toggleSidebar();
    }
  });
});
