/* =========================================
   PRODIGY HUB – COMPLETE JAVASCRIPT
   Full functionality with mobile support
========================================= */

/* ========== GLOBAL STATE ========== */
const AppState = {
  user: {
    name: "",
    goal: "",
    onboarded: false
  },
  notes: [],
  todos: [],
  completedTasks: 0,
  focusSessions: 0,
  totalFocusMinutes: 0,
  currentFilter: "all",
  theme: "dark",
  currentNoteId: null,
  timerInterval: null,
  timerSeconds: 1500, // 25 minutes
  timerRunning: false
};

/* ========== INITIALIZATION ========== */
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  initializeApp();
});

/* ========== STORAGE ========== */
function saveToStorage() {
  localStorage.setItem("prodigyAppState", JSON.stringify(AppState));
}

function loadFromStorage() {
  const saved = localStorage.getItem("prodigyAppState");
  if (saved) {
    const data = JSON.parse(saved);
    Object.assign(AppState, data);
    // Don't restore timer state
    AppState.timerRunning = false;
    AppState.timerInterval = null;
  }
}

/* ========== APP INITIALIZATION ========== */
function initializeApp() {
  if (AppState.user.onboarded) {
    showApp();
    initApp();
  } else {
    showOnboarding();
  }

  initOnboarding();
  initNavigation();
  initTheme();
  initMobileSidebar();
}

function initApp() {
  updateGreeting();
  updateDashboard();
  renderNotes();
  renderTodos();
  updateBadges();
  initTodoListeners();
  initTimer();
  initSettings();
}

/* ========== ONBOARDING ========== */
let currentStep = 1;
let selectedGoal = "";

function showOnboarding() {
  document.getElementById("onboarding").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
  updateProgress();
}

function showApp() {
  document.getElementById("onboarding").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

function initOnboarding() {
  document.querySelectorAll(".goal-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".goal-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedGoal = card.dataset.goal;
    });
  });
}

function nextStep() {
  if (currentStep === 2) {
    const name = document.getElementById("userName").value.trim();
    if (!name) {
      showToast("Please enter your name");
      return;
    }
    AppState.user.name = name;
  }

  const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
  currentStepEl.classList.remove("active");
  
  currentStep++;
  
  const nextStepEl = document.querySelector(`[data-step="${currentStep}"]`);
  nextStepEl.classList.add("active");
  
  updateProgress();
}

function prevStep() {
  const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
  currentStepEl.classList.remove("active");
  
  currentStep--;
  
  const prevStepEl = document.querySelector(`[data-step="${currentStep}"]`);
  prevStepEl.classList.add("active");
  
  updateProgress();
}

function updateProgress() {
  const progressFill = document.getElementById("progressFill");
  progressFill.style.width = `${(currentStep / 3) * 100}%`;
}

function completeOnboarding() {
  if (!selectedGoal) {
    showToast("Please select a goal");
    return;
  }

  AppState.user.goal = selectedGoal;
  AppState.user.onboarded = true;
  saveToStorage();
  showApp();
  initApp();
}

/* ========== NAVIGATION ========== */
function initNavigation() {
  const navBtns = document.querySelectorAll(".nav-btn[data-view]");
  const views = document.querySelectorAll(".view");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));

      btn.classList.add("active");
      const viewId = btn.dataset.view;
      document.getElementById(viewId).classList.add("active");

      // Close mobile sidebar when switching views
      closeMobileSidebar();
    });
  });
}

/* ========== THEME ========== */
function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  if (AppState.theme === "light") {
    document.body.classList.add("light");
    icon.textContent = "☀️";
  }

  toggle.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  const icon = document.getElementById("themeIcon");
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  AppState.theme = isLight ? "light" : "dark";
  icon.textContent = isLight ? "☀️" : "🌙";
  saveToStorage();
}

/* ========== MOBILE SIDEBAR ========== */
function initMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("menuToggle");
  
  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", closeMobileSidebar);
}

function closeMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

// Make it globally accessible
window.closeMobileSidebar = closeMobileSidebar;

/* ========== HEADER & GREETING ========== */
function updateGreeting() {
  const greeting = document.getElementById("greetingText");
  const dateText = document.getElementById("dateText");
  const avatar = document.getElementById("userAvatar");
  
  const hour = new Date().getHours();
  let greetingText = "Good Morning";
  
  if (hour >= 12 && hour < 18) {
    greetingText = "Good Afternoon";
  } else if (hour >= 18) {
    greetingText = "Good Evening";
  }

  greeting.textContent = `${greetingText}, ${AppState.user.name}`;
  dateText.textContent = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  avatar.textContent = AppState.user.name.charAt(0).toUpperCase();
}

/* ========== DASHBOARD ========== */
function updateDashboard() {
  // Update stats
  document.getElementById("completedCount").textContent = AppState.completedTasks;
  document.getElementById("notesCount").textContent = AppState.notes.length;
  document.getElementById("focusCount").textContent = AppState.focusSessions;
  
  // Update today's overview
  updateTodayOverview();
}

function updateTodayOverview() {
  const activeTodosList = document.getElementById("activeTodosList");
  const recentNotesList = document.getElementById("recentNotesList");
  
  // Active todos
  const activeTodos = AppState.todos.filter(t => !t.completed).slice(0, 5);
  if (activeTodos.length === 0) {
    activeTodosList.innerHTML = '<li>No active tasks</li>';
  } else {
    activeTodosList.innerHTML = activeTodos.map(todo => 
      `<li>• ${todo.text}</li>`
    ).join('');
  }
  
  // Recent notes
  const recentNotes = AppState.notes.slice(0, 5);
  if (recentNotes.length === 0) {
    recentNotesList.innerHTML = '<li>No notes yet</li>';
  } else {
    recentNotesList.innerHTML = recentNotes.map(note => 
      `<li>• ${note.title || 'Untitled'}</li>`
    ).join('');
  }
}

/* ========== QUICK ACTIONS ========== */
function quickAddTask() {
  // Switch to todo view
  document.querySelector('[data-view="todo"]').click();
  // Focus on input
  setTimeout(() => {
    document.getElementById("todoInput").focus();
  }, 100);
}

function quickAddNote() {
  createNewNote();
}

function startFocusSession() {
  // Switch to focus view
  document.querySelector('[data-view="focus"]').click();
  // Start timer
  setTimeout(() => {
    if (!AppState.timerRunning) {
      document.getElementById("startTimer").click();
    }
  }, 100);
}

// Make functions globally accessible
window.quickAddTask = quickAddTask;
window.quickAddNote = quickAddNote;
window.startFocusSession = startFocusSession;

/* ========== NOTES ========== */
function renderNotes() {
  const notesGrid = document.getElementById("notesGrid");
  const emptyState = document.getElementById("notesEmptyState");

  if (AppState.notes.length === 0) {
    notesGrid.innerHTML = '';
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    notesGrid.innerHTML = AppState.notes.map(note => `
      <div class="note-card" onclick="editNote('${note.id}')">
        <h3>${escapeHtml(note.title || 'Untitled')}</h3>
        <p>${escapeHtml(note.content.substring(0, 150))}${note.content.length > 150 ? '...' : ''}</p>
        <div class="note-card-footer">
          <span>${new Date(note.date).toLocaleDateString()}</span>
          <div class="note-actions">
            <button class="note-btn" onclick="deleteNote(event, '${note.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function createNewNote() {
  AppState.currentNoteId = null;
  document.getElementById("noteModalTitle").textContent = "New Note";
  document.getElementById("noteTitleInput").value = "";
  document.getElementById("noteContentInput").value = "";
  openNoteModal();
}

function editNote(id) {
  const note = AppState.notes.find(n => n.id === id);
  if (!note) return;

  AppState.currentNoteId = id;
  document.getElementById("noteModalTitle").textContent = "Edit Note";
  document.getElementById("noteTitleInput").value = note.title;
  document.getElementById("noteContentInput").value = note.content;
  openNoteModal();
}

function saveNote() {
  const title = document.getElementById("noteTitleInput").value.trim();
  const content = document.getElementById("noteContentInput").value.trim();

  if (!title && !content) {
    showToast("Please add a title or content");
    return;
  }

  if (AppState.currentNoteId) {
    // Update existing note
    const note = AppState.notes.find(n => n.id === AppState.currentNoteId);
    if (note) {
      note.title = title;
      note.content = content;
      note.date = new Date().toISOString();
      showToast("Note updated!");
    }
  } else {
    // Create new note
    const newNote = {
      id: generateId(),
      title: title || "Untitled",
      content: content,
      date: new Date().toISOString()
    };
    AppState.notes.unshift(newNote);
    showToast("Note created!");
  }

  saveToStorage();
  renderNotes();
  updateDashboard();
  updateBadges();
  closeNoteModal();
}

function deleteNote(event, id) {
  event.stopPropagation();
  
  if (confirm("Delete this note?")) {
    AppState.notes = AppState.notes.filter(n => n.id !== id);
    saveToStorage();
    renderNotes();
    updateDashboard();
    updateBadges();
    showToast("Note deleted");
  }
}

function openNoteModal() {
  document.getElementById("noteModal").classList.remove("hidden");
  document.getElementById("noteTitleInput").focus();
}

function closeNoteModal() {
  document.getElementById("noteModal").classList.add("hidden");
  AppState.currentNoteId = null;
}

// Make functions globally accessible
window.createNewNote = createNewNote;
window.editNote = editNote;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.closeNoteModal = closeNoteModal;

/* ========== TODOS ========== */
function initTodoListeners() {
  const addBtn = document.getElementById("addTodo");
  const input = document.getElementById("todoInput");

  addBtn.addEventListener("click", addTodo);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      AppState.currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });
}

function addTodo() {
  const input = document.getElementById("todoInput");
  const priority = document.getElementById("todoPriority");
  const text = input.value.trim();

  if (!text) {
    showToast("Please enter a task");
    return;
  }

  const newTodo = {
    id: generateId(),
    text: text,
    completed: false,
    priority: priority.value,
    date: new Date().toISOString()
  };

  AppState.todos.unshift(newTodo);
  input.value = "";
  
  saveToStorage();
  renderTodos();
  updateDashboard();
  updateBadges();
  showToast("Task added!");
}

function renderTodos() {
  const todoList = document.getElementById("todoList");
  const emptyState = document.getElementById("todoEmptyState");

  let filteredTodos = AppState.todos;
  
  if (AppState.currentFilter === "active") {
    filteredTodos = AppState.todos.filter(t => !t.completed);
  } else if (AppState.currentFilter === "completed") {
    filteredTodos = AppState.todos.filter(t => t.completed);
  }

  if (filteredTodos.length === 0) {
    todoList.innerHTML = '';
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    todoList.innerHTML = filteredTodos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo.id}')"></div>
        <div class="todo-content">
          <div class="todo-text">${escapeHtml(todo.text)}</div>
        </div>
        <span class="todo-priority ${todo.priority}">${todo.priority}</span>
        <button class="todo-delete" onclick="deleteTodo('${todo.id}')">×</button>
      </li>
    `).join('');
  }
}

function toggleTodo(id) {
  const todo = AppState.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    
    if (todo.completed) {
      AppState.completedTasks++;
      showToast("Task completed! 🎉");
    } else {
      AppState.completedTasks--;
    }
    
    saveToStorage();
    renderTodos();
    updateDashboard();
    updateBadges();
  }
}

function deleteTodo(id) {
  if (confirm("Delete this task?")) {
    const todo = AppState.todos.find(t => t.id === id);
    if (todo && todo.completed) {
      AppState.completedTasks--;
    }
    
    AppState.todos = AppState.todos.filter(t => t.id !== id);
    saveToStorage();
    renderTodos();
    updateDashboard();
    updateBadges();
    showToast("Task deleted");
  }
}

// Make functions globally accessible
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

/* ========== FOCUS TIMER ========== */
function initTimer() {
  const startBtn = document.getElementById("startTimer");
  const resetBtn = document.getElementById("resetTimer");

  startBtn.addEventListener("click", toggleTimer);
  resetBtn.addEventListener("click", resetTimer);

  updateTimerDisplay();
  updateTimerStats();
}

function toggleTimer() {
  const startBtn = document.getElementById("startTimer");
  
  if (AppState.timerRunning) {
    // Pause timer
    clearInterval(AppState.timerInterval);
    AppState.timerRunning = false;
    startBtn.textContent = "Resume";
    showToast("Timer paused");
  } else {
    // Start timer
    AppState.timerRunning = true;
    startBtn.textContent = "Pause";
    
    AppState.timerInterval = setInterval(() => {
      AppState.timerSeconds--;
      
      if (AppState.timerSeconds <= 0) {
        completeTimer();
      }
      
      updateTimerDisplay();
      updateTimerProgress();
    }, 1000);
    
    showToast("Timer started!");
  }
}

function resetTimer() {
  clearInterval(AppState.timerInterval);
  AppState.timerRunning = false;
  AppState.timerSeconds = 1500; // 25 minutes
  
  document.getElementById("startTimer").textContent = "Start Focus";
  document.getElementById("timerLabel").textContent = "Focus Time";
  
  updateTimerDisplay();
  updateTimerProgress();
  showToast("Timer reset");
}

function completeTimer() {
  clearInterval(AppState.timerInterval);
  AppState.timerRunning = false;
  AppState.focusSessions++;
  AppState.totalFocusMinutes += 25;
  
  document.getElementById("startTimer").textContent = "Start Focus";
  document.getElementById("timerLabel").textContent = "Session Complete!";
  
  resetTimer();
  updateTimerStats();
  updateDashboard();
  saveToStorage();
  
  showToast("Focus session complete! 🎉 Great work!");
}

function updateTimerDisplay() {
  const minutes = Math.floor(AppState.timerSeconds / 60);
  const seconds = AppState.timerSeconds % 60;
  
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById("timerDisplay").textContent = display;
}

function updateTimerProgress() {
  const totalSeconds = 1500; // 25 minutes
  const progress = AppState.timerSeconds / totalSeconds;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference * (1 - progress);
  
  const progressCircle = document.getElementById("timerProgress");
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = offset;
  }
}

function updateTimerStats() {
  document.getElementById("sessionsToday").textContent = AppState.focusSessions;
  document.getElementById("totalMinutes").textContent = AppState.totalFocusMinutes;
}

/* ========== SETTINGS ========== */
function initSettings() {
  const themeToggle = document.getElementById("themeSettingToggle");
  const userName = document.getElementById("settingsUserName");
  
  if (userName) {
    userName.textContent = AppState.user.name;
  }
  
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function editUserName() {
  const newName = prompt("Enter your new name:", AppState.user.name);
  if (newName && newName.trim()) {
    AppState.user.name = newName.trim();
    saveToStorage();
    updateGreeting();
    document.getElementById("settingsUserName").textContent = AppState.user.name;
    showToast("Name updated!");
  }
}

function resetAllData() {
  if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
    if (confirm("Really? This will delete everything!")) {
      localStorage.clear();
      location.reload();
    }
  }
}

// Make functions globally accessible
window.editUserName = editUserName;
window.resetAllData = resetAllData;

/* ========== BADGES ========== */
function updateBadges() {
  const notesBadge = document.getElementById("notesBadge");
  const todoBadge = document.getElementById("todoBadge");
  
  notesBadge.textContent = AppState.notes.length;
  
  const activeTodos = AppState.todos.filter(t => !t.completed).length;
  todoBadge.textContent = activeTodos;
}

/* ========== UTILITIES ========== */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  
  toastMessage.textContent = message;
  toast.classList.remove("hidden");
  
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

/* ========== GLOBAL EXPORTS ========== */
// Make nextStep and prevStep available globally for onboarding
window.nextStep = nextStep;
window.prevStep = prevStep;
window.completeOnboarding = completeOnboarding;
