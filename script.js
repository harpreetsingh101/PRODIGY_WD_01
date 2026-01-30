document.addEventListener("DOMContentLoaded", () => {

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

  const todoInput = document.getElementById("todoInput");
  const addTodoBtn = document.getElementById("addTodo");
  const todoList = document.getElementById("todoList");

  // ENTRY → APP
  startBtn.addEventListener("click", () => {
    entry.classList.add("hidden");
    app.classList.remove("hidden");
    runCounters();
  });

  // NAVIGATION
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const viewId = btn.dataset.view;
      views.forEach(v => v.classList.remove("active"));
      document.getElementById(viewId).classList.add("active");

      if (viewId === "dashboard") runCounters();
    });
  });

  // COUNTERS
  function runCounters() {
    counters.forEach(counter => {
      let target = +counter.dataset.target;
      let current = 0;
      const step = target / 40;

      function update() {
        current += step;
        if (current < target) {
          counter.innerText = Math.floor(current);
          requestAnimationFrame(update);
        } else {
          counter.innerText = target;
        }
      }
      update();
    });
  }

  // NOTES
  noteBox.value = localStorage.getItem("note") || "";
  saveNoteBtn.addEventListener("click", () => {
    localStorage.setItem("note", noteBox.value);
    noteStatus.innerText = "Saved ✔";
    setTimeout(() => noteStatus.innerText = "", 2000);
  });

  // THEME
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme",
      document.body.classList.contains("light") ? "light" : "dark"
    );
  });

  // MODAL
  openModalBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // TODO TOOL
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  function renderTodos() {
    todoList.innerHTML = "";
    todos.forEach((t, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${t}</span><button onclick="deleteTodo(${i})">X</button>`;
      todoList.appendChild(li);
    });
  }

  addTodoBtn.addEventListener("click", () => {
    if (todoInput.value.trim() === "") return;
    todos.push(todoInput.value);
    localStorage.setItem("todos", JSON.stringify(todos));
    todoInput.value = "";
    renderTodos();
  });

  window.deleteTodo = (i) => {
    todos.splice(i, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
  };

  renderTodos();
});
