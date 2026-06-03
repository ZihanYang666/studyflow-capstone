const starterTasks = [
  {
    id: 1,
    title: "Review math quiz corrections",
    course: "Math",
    date: "",
    priority: "High",
    done: false,
  },
  {
    id: 2,
    title: "Finish English paragraph draft",
    course: "English",
    date: "",
    priority: "Medium",
    done: false,
  },
  {
    id: 3,
    title: "Prepare capstone presentation notes",
    course: "CLE",
    date: "",
    priority: "Low",
    done: true,
  },
];

const STORAGE_KEY = "studyflow-tasks";
let tasks = loadTasks();
let currentFilter = "all";

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const courseInput = document.querySelector("#task-course");
const dateInput = document.querySelector("#task-date");
const priorityInput = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const progressLabel = document.querySelector("#progress-label");
const progressPercent = document.querySelector("#progress-percent");
const progressFill = document.querySelector("#progress-fill");
const resetButton = document.querySelector("#reset-demo");
const filterButtons = document.querySelectorAll(".filter-button");

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  if (!savedTasks) return [...starterTasks];

  try {
    const parsedTasks = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [...starterTasks];
  } catch {
    return [...starterTasks];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateValue) {
  if (!dateValue) return "No date";
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function visibleTasks() {
  return tasks.filter((task) => {
    if (currentFilter === "open") return !task.done;
    if (currentFilter === "done") return task.done;
    if (currentFilter === "high") return task.priority === "High";
    return true;
  });
}

function updateProgress() {
  const total = tasks.length;
  const complete = tasks.filter((task) => task.done).length;
  const percent = total ? Math.round((complete / total) * 100) : 0;

  progressLabel.textContent = `${complete} of ${total} complete`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function renderTasks() {
  taskList.innerHTML = "";
  const filteredTasks = visibleTasks();

  if (!filteredTasks.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No tasks match this filter.";
    taskList.append(empty);
    updateProgress();
    return;
  }

  filteredTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-card ${task.priority.toLowerCase()}${task.done ? " done" : ""}`;

    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("span");
    meta.className = "task-meta";
    meta.textContent = `${task.course} | ${formatDate(task.date)} | ${task.priority} priority`;

    content.append(title, meta);

    const action = document.createElement("button");
    action.className = `task-action${task.done ? " done-action" : ""}`;
    action.type = "button";
    action.textContent = task.done ? "Completed" : "Mark done";
    action.addEventListener("click", () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    item.append(content, action);
    taskList.append(item);
  });

  updateProgress();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  tasks.unshift({
    id: Date.now(),
    title: titleInput.value.trim(),
    course: courseInput.value,
    date: dateInput.value,
    priority: priorityInput.value,
    done: false,
  });

  saveTasks();
  form.reset();
  priorityInput.value = "Medium";
  titleInput.focus();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

resetButton.addEventListener("click", () => {
  tasks = [...starterTasks];
  currentFilter = "all";
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === "all"));
  saveTasks();
  renderTasks();
});

renderTasks();
