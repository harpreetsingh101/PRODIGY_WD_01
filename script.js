/* =========================================
   PRODIGY HUB – FIXED & STABLE SCRIPT
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
  theme: "dark"
};

/* ========== LOAD APP ========== */
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
  if (saved) Object.assign(AppState, JSON.parse(saved));
}

/* ========== INIT ========== */
function initializeApp() {
  if (AppState.user.onboarded) {
    showApp();
  } else {
    showOnboarding();
  }

  initOnboarding();
  initNavigation();
  initTheme();
  initMobileSidebar();
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
  updateGreeting();
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
      alert("Please enter your name");
      return;
    }
    AppState.user.name = name;
  }

  document.querySelector(`[data-step="${currentStep}"]`).classList.remove("active");
  currentStep++;
  document.querySelector(`[data-step="${currentStep}"]`).classList.add("active");
  updateProgress();
}

function prevStep() {
  document.querySelector(`[data-step="${currentStep}"]`).classList.remove("active");
  currentStep--;
  document.querySelector(`[data-step="${currentStep}"]`).classList.add("active");
  updateProgress();
}

function updateProgress() {
  document.getElementById("progressFill").style.width = `${(currentStep / 3) * 100}%`;
}

function completeOnboarding() {
  if (!selectedGoal) {
    alert("Select a goal first");
    return;
  }

  AppState.user.goal = selectedGoal;
  AppState.user.onboarded = true;
  saveToStorage();
  showApp();
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
      document.getElementById(btn.dataset.view).classList.add("active");

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

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    AppState.theme = isLight ? "light" : "dark";
    icon.textContent = isLight ? "☀️" : "🌙";
    saveToStorage();
  });
}

/* ========== HEADER ========== */
function updateGreeting() {
  const greeting = document.getElementById("greetingText");
  const date = document.getElementById("dateText");
  const hour = new Date().getHours();

  greeting.textContent =
    (hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening") +
    ", " +
    AppState.user.name;

  date.textContent = new Date().toDateString();
}

/* ========== MOBILE SIDEBAR ========== */
function initMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("menuToggle");

  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.appendChild(overlay);

  toggle.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", closeMobileSidebar);

  function closeMobileSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }

  window.closeMobileSidebar = closeMobileSidebar;
}

/* ========== UTIL ========== */
function showToast(msg) {
  const toast = document.getElementById("toast");
  const text = document.getElementById("toastMessage");
  text.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}
