# TaskFlow Developer Documentation

TaskFlow is a premium Kanban-style project management and task tracking application. Designed as a high-performance client-side dashboard, it features state management patterns, LocalStorage persistence, multi-column drag-and-drop mechanics, interactive task creation forms, filters, and priority systems.

---

## Directory Structure

This repository contains the following structural layout:
* index.html - Defines the dashboard skeleton, Kanban columns, input modals, and layout containers.
* CSS/style.css - Sets theme variables, layout rules, card priorities, and responsive layouts.
* JS/app.js - Configures the application entry point, lifecycle hooks, and drag-and-drop listener registrations.
* JS/state.js - Represents the core data/state management layer, coordinating CRUD operations and local storage syncing.
* JS/ui.js - Updates column counts, builds task cards, and renders form states in the DOM.

---

## Architectural Flow & Communication Diagram

```
[ User Interaction ] ──► [ JS/app.js ] ──► [ JS/state.js ] ──(Serialize)──► [ LocalStorage ]
                             │                  │
                             ▼                  ▼
                         [ JS/ui.js ] ◄───── (Data Update Event)
                         (Re-render Cards & Columns)
```

---

## Module Specifications

### 1. Application Entry & Drag Engine (JS/app.js)
Coordinates visual and interactive states during drag operations. Implements native HTML5 drag event APIs (dragstart, dragover, drop, dragend). Translates drag destinations into index mutations and tells the state manager to execute data re-ordering.

### 2. State & Storage Engine (JS/state.js)
Maintains task lists in memory. Details include:
* CRUD Operations: Methods to create, edit, remove, or swap columns for task items.
* Persistence: Direct serialization of task array models into browser localStorage on every mutation event.
* ID Generation: Cryptographically secure or sequential unique identifiers for each task.

### 3. Rendering Engine (JS/ui.js)
Builds and modifies structural layout fragments:
* Generates task card elements with correct priority labels, tag classes, and due dates.
* Recalculates column counters on updates.
* Controls form overlays, checking fields before triggering creation.

---

## Technical Features & Implementation Details

* Drag and Drop Integration: Uses custom data transfer parameters (`event.dataTransfer.setData`) to move task payloads between columns safely.
* LocalStorage Architecture: Implements error-handling blocks to prevent database corruptions when retrieving serialized objects.
* Responsive Styling: Leverages container queries and CSS Grid columns to scale down to smaller devices.

---

## Local Development & Setup

### Prerequisites
A modern browser and a command-line interface.

### Running Locally
1. Navigate to the project root directory:
   ```bash
   cd "Kanban Board"
   ```
2. Start a simple web server:
   ```bash
   python -m http.server 8000
   ```
3. Open a browser and navigate to `http://localhost:8000`.
