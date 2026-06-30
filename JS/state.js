/* ==========================================================================
   TASKFLOW — STORAGE & STATE MANAGEMENT (state.js)
   Minimal storage engine and helpers for simple presentation.
   ========================================================================== */

let STORAGE_KEY = "taskflow_board_data_v1";
let THEME_KEY = "taskflow_theme_pref";

// Flat global variables
let tasks = [];
let searchTerm = "";
let activePriorities = [];
let sortMode = "default";
let undoStack = [];
let draggedTaskId = null;
let contextMenuTaskId = null;
let STATUS_LIST = ["todo", "inprogress", "review", "done"];

function generateId() {
  return "task_" + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  let parts = dateStr.split("-");
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return parts.length === 3 ? parts[2] + " " + months[parseInt(parts[1]) - 1] : dateStr;
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate + "T00:00:00") < new Date().setHours(0, 0, 0, 0);
}

function escapeHTML(str) {
