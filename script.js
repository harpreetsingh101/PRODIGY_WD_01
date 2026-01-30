// ================= ELEMENTS =================
const entry = document.getElementById("entry");
const app = document.getElementById("app");
const startBtn = document.getElementById("startApp");

const navBtns = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

const counters = document.querySelectorAll(".counter");

const noteBox = document.getElementById("noteBox");
const saveNoteBtn = document.getElementById("saveNote");
const noteStatus = document.getElementById("noteStatus");

const themeToggle = document.getElementById("themeToggle");

const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");

// ================= ENTRY → APP =================
startBtn.addEventListener("click", () => {
  entry.classList.add("hidden");
  app.classList.remove("hidden");
  runCounters();
});

// ================= NAVIGATION (VIEW SWITCHING) =================
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Active button
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const viewId = btn.dataset.view;

    // Show correct view
    views.forEach(view => {
      view.classList.remove("active");
      if (view.id === viewId) {
        view.classList.add("active");
      }
    });

    // Re-run counters if dashboard opened
    if (viewId === "dashboard") {
      runCounters();
    }
  });
});

// ================= COUNTER ANIMATION =================
function runCounters() {
  counters.forEach(counter => {
    counter.innerText = "0";
    const target = +counter.dataset.target;
    let current = 0;
    const increment = target / 40;

    const update = () => {
      current += increment;
      if (current < target) {
        counter.innerText = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        counter.innerText = target;
      }
    };

    update();
  });
}

// ================= NOTES (LOCAL STORAGE) =================
noteBox.value = localStorage.getItem("userNote") || "";

saveNoteBtn.addEventListener("click", () => {
  localStorage.setItem("userNote", noteBox.value);
  noteStatus.innerText = "Note saved ✔";

  setTimeout(() => {
    noteStatus.innerText = "";
  }, 2000);
});

// ================= THEME TOGGLE (PERSISTENT) =================
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

// ================= MODAL (SMOOTH) =================
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
// ================= TO-DO TOOL =================
const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodo");
const todoList = document.getElementById("todoList");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${todo}</span>
      <button onclick="deleteTodo(${index})">X</button>
    `;
    todoList.appendChild(li);
  });
}

addTodoBtn.addEventListener("click", () => {
  const task = todoInput.value.trim();
  if (task === "") return;

  todos.push(task);
  localStorage.setItem("todos", JSON.stringify(todos));
  todoInput.value = "";
  renderTodos();
});

function deleteTodo(index) {
  todos.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

// Load existing todos
renderTodos();
