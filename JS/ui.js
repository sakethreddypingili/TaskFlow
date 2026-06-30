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
