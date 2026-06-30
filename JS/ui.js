/* ==========================================================================
   TASKFLOW — UI PANEL & GRAPHICS REDIRECTS (ui.js)
   Sleek rendering layer for toast, stats metrics, modal states, and themes.
   ========================================================================== */

let dropPlaceholder = document.createElement("div");
dropPlaceholder.className = "drop-placeholder";

function showToast(msg, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) return;
  let toast = document.createElement("div");
  toast.className = "toast " + type;
  let icons = { success: "ph-check-circle", error: "ph-x-circle", warning: "ph-warning", info: "ph-info" };
  toast.innerHTML = '<i class="ph-fill ' + (icons[type] || "ph-info") + '"></i><span>' + escapeHTML(msg) + '</span>';
  container.appendChild(toast);
  setTimeout(function () {
    toast.classList.add("removing");
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
}

function updateDashboardStats() {
  let total = tasks.length, active = 0, done = 0;
  for (let i = 0; i < total; i++) {
    if (tasks[i].status === "inprogress") active++;
    if (tasks[i].status === "done") done++;
  }
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statInProgress").textContent = active;
  document.getElementById("statDone").textContent = done;
  let pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById("statPercent").textContent = pct + "%";
  let ring = document.getElementById("progressRingFill");
  if (ring) ring.style.strokeDashoffset = 213.6 - (pct / 100) * 213.6;
}

function renderBoard() {
  let lists = { todo: document.getElementById("list-todo"), inprogress: document.getElementById("list-inprogress"), review: document.getElementById("list-review"), done: document.getElementById("list-done") };
  for (let k in lists) if (lists[k]) lists[k].innerHTML = "";

  let filtered = [];
  for (let i = 0; i < tasks.length; i++) {
    let t = tasks[i];
    let sMatch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.desc && t.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.labels.some(function (l) { return l.toLowerCase().includes(searchTerm.toLowerCase()); });
    let pMatch = activePriorities.length === 0 || activePriorities.includes(t.priority);
    if (sMatch && pMatch) filtered.push(t);
  }

  let weights = { high: 3, medium: 2, low: 1 };
  filtered.sort(function (a, b) {
    if (sortMode === "priority") return weights[b.priority] - weights[a.priority];
    if (sortMode === "dueDate") return !a.dueDate ? 1 : !b.dueDate ? -1 : new Date(a.dueDate) - new Date(b.dueDate);
    if (sortMode === "title") return a.title.localeCompare(b.title);
    if (sortMode === "createdAt") return b.createdAt - a.createdAt;
    return a.order - b.order;
  });

  let counts = { todo: 0, inprogress: 0, review: 0, done: 0 };
  for (let i = 0; i < filtered.length; i++) {
    let t = filtered[i];
    if (lists[t.status]) {
      lists[t.status].appendChild(createTaskCardElement(t));
      counts[t.status]++;
    }
  }
  for (let k in counts) {
    let el = document.getElementById("count-" + k);
    if (el) el.textContent = counts[k];
  }
  updateDashboardStats();
  let undoBtn = document.getElementById("undoBtn");
  if (undoBtn) undoBtn.style.opacity = undoStack.length > 0 ? "1" : "0.4";
}

function createTaskCardElement(task) {
  let card = document.createElement("div");
  card.className = "task-card priority-" + task.priority;
  card.draggable = true;
  card.setAttribute("data-id", task.id);

  let overdue = isOverdue(task.dueDate, task.status);
  let labelsHTML = "";
  for (let i = 0; i < task.labels.length; i++) {
    labelsHTML += '<span class="task-label">' + escapeHTML(task.labels[i]) + '</span>';
  }
  if (labelsHTML) labelsHTML = '<div class="task-card-labels">' + labelsHTML + '</div>';

  card.innerHTML =
    '<div class="task-card-top"><span class="priority-badge ' + task.priority + '">' + task.priority + '</span>' +
    '<button class="task-card-menu-btn"><i class="ph ph-dots-three-vertical"></i></button></div>' +
    '<div class="task-card-title">' + escapeHTML(task.title) + '</div>' +
    (task.desc ? '<div class="task-card-desc">' + escapeHTML(task.desc) + '</div>' : '') + labelsHTML +
    '<div class="task-card-footer">' +
    (task.dueDate ? '<div class="task-due-date ' + (overdue ? 'overdue' : '') + '"><i class="ph ph-calendar"></i><span>' + formatDate(task.dueDate) + (overdue ? ' (Overdue)' : '') + '</span></div>' : '<div></div>') +
    '<div class="task-card-actions"><button class="edit-btn"><i class="ph ph-pencil-simple"></i></button><button class="delete-btn"><i class="ph ph-trash"></i></button></div></div>';

  card.addEventListener("dragstart", function (e) {
    draggedTaskId = task.id;
    card.classList.add("dragging");
    e.dataTransfer.setData("text/plain", task.id);
    setTimeout(function () { card.classList.add("drag-ghost"); }, 0);
  });
  card.addEventListener("dragend", function () {
    card.classList.remove("dragging", "drag-ghost");
    dropPlaceholder.remove();
    draggedTaskId = null;
  });
  card.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    openContextMenu(e, task.id);
  });
  return card;
}

function openTaskModal(task = null, defaultStatus = "todo") {
  let overlay = document.getElementById("taskModalOverlay");
  document.getElementById("taskForm").reset();
  if (task) {
    document.getElementById("modalTitle").textContent = "Edit Task";
    document.getElementById("taskId").value = task.id;
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.desc || "";
    document.getElementById("taskStatus").value = task.status;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskDueDate").value = task.dueDate || "";
    document.getElementById("taskLabels").value = task.labels.join(", ");
  } else {
    document.getElementById("modalTitle").textContent = "Add New Task";
    document.getElementById("taskId").value = "";
    document.getElementById("taskStatus").value = defaultStatus;
    document.getElementById("taskPriority").value = "medium";
  }
  overlay.classList.add("active");
  setTimeout(function () { document.getElementById("taskTitle").focus(); }, 100);
}

function closeTaskModal() { document.getElementById("taskModalOverlay").classList.remove("active"); }
function openShortcutsModal() { document.getElementById("shortcutsModalOverlay").classList.add("active"); }
function closeShortcutsModal() { document.getElementById("shortcutsModalOverlay").classList.remove("active"); }

function openContextMenu(e, taskId) {
  let menu = document.getElementById("contextMenu");
  if (!menu) return;
  contextMenuTaskId = taskId;
  menu.classList.add("active");
  let left = e.clientX, top = e.clientY;
  if (left + 180 > window.innerWidth) left = window.innerWidth - 192;
  if (top + 280 > window.innerHeight) top = window.innerHeight - 292;
  menu.style.left = left + "px";
  menu.style.top = top + "px";
}

function closeContextMenu() {
  let menu = document.getElementById("contextMenu");
  if (menu) menu.classList.remove("active");
  contextMenuTaskId = null;
}

function initTheme() {
  let saved = localStorage.getItem(THEME_KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(saved);
}

function setTheme(theme) {
  let toggle = document.getElementById("themeToggle");
  let icon = toggle ? toggle.querySelector("i") : null;
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.setAttribute("data-theme", "dark");
    localStorage.setItem(THEME_KEY, "dark");
    if (icon) icon.className = "ph ph-sun";
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
    localStorage.setItem(THEME_KEY, "light");
    if (icon) icon.className = "ph ph-moon";
  }
}

function toggleTheme() {
  let theme = localStorage.getItem(THEME_KEY) === "dark" ? "light" : "dark";
  setTheme(theme);
  showToast("Theme switched to " + theme + " mode", "info");
}
