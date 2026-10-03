# WORKNEX — Enterprise Asynchronous Team Progress Platform

> **"Less status chasing. More progress."**  
> *Built for Microsoft Global Hackathon — Manager Portal (Avni)*

---

## 1. Executive Summary & Vision

**WORKNEX** is an AI-powered asynchronous team progress management and decision-support platform designed specifically for distributed engineering organizations.

### The Core Problem
Daily stand-ups, recurring status meetings, and manual status chasing consume thousands of engineering hours each quarter. In distributed teams across time zones, these synchronous interruptions slow down velocity without providing leaders with actionable clarity on actual project roadblocks, recurring blockers, or silent delivery stalls.

### The WORKNEX Solution
Employees submit short, asynchronous work updates. WORKNEX processes these updates into structured, zero-hallucination project intelligence. 

At this stage, WORKNEX delivers the **Manager Module** tailored for engineering leadership (**Avni**):
* **Overall Project Progress** & sprint health telemetry
* **Team Progress** across 6 distributed teams (Alpha, Beta, Gamma, Delta, Epsilon, Zeta)
* **Completed, Pending, and Overdue Work**
* **Active Blockers & Impediments**
* **🔴 3-Day Recurring Blocker Detection** (Critical Red Flag alert)
* **⏳ Silent Delay Detection** (Pending ≥ 7 days alert)
* **🤝 Automatic Multi-Team Collaboration Meeting Suggestion**
* **👤 Leave & Work Reassignment Assistance**
* **✨ FlowAI Decision Support Assistant** (Structured cards, tables, metrics, and bullets)
* **💎 Employee Collaboration Credits & Achievements** (Verified peer assistance, read-only)
* **📊 Weekly Velocity Reports** (5 interactive native Canvas charts)
* **🔒 Privacy & Anti-Surveillance Guarantee** (SOC-2 / Azure Zero Trust aligned)

---

## 2. Manager-Scope Guardrails & Ethical Boundaries

WORKNEX strictly preserves engineering autonomy and psychological safety:

| Boundary | Enforcement in WORKNEX Manager Portal |
| :--- | :--- |
| **No Employee Daily Update Input** | ❌ The Manager **never** fills employee daily updates. Read-only intelligence. |
| **No Task Assignment Controls** | ❌ The Manager does not micromanage or assign individual tasks. |
| **No Priority Manipulation** | ❌ Top-down priority tampering is restricted to prevent status chasing. |
| **No Employee Surveillance** | ❌ **WORKNEX DOES NOT** track online/offline presence, log keystrokes, monitor chats, or create secret productivity scores. |
| **Explicit Consent & Traceability** | ✓ Every extracted blocker and status is permanently traceable to the original update via **[View Source]**. |

---

## 3. Demo Credentials & Hackathon Quick Start

### Manager Login Credentials
* **Portal URL**: `http://localhost:8000`
* **Email / Manager ID**: `avni@worknex.demo`
* **Password**: `Manager@123` (Visibility toggle supported)

### How to Run Locally

#### Option A: Built-in Python Server (Recommended)
From PowerShell or Command Prompt in the repository folder:
```powershell
python server.py
```
This runs the zero-dependency Python 3 HTTP server at `http://localhost:8000` with automated REST health checks (`/api/health`).

#### Option B: Direct Browser Launch
Open `index.html` directly in Microsoft Edge, Google Chrome, or any modern web browser. The entire application runs client-side with native Canvas rendering and offline state persistence.

---

## 4. Key Architectural Capabilities

### 1. 🔴 3-Day Recurring Blocker Alert (Red Flag)
When the same blocker appears for 3 consecutive days (e.g. *API Access* in Team Alpha), WORKNEX flags a critical Red Flag notification across the Dashboard, Blocker Center, and Notification Center with instant `[View Blocker]` and `[View Source]` actions.

### 2. ⏳ Silent Delay Detection
If a team or work area remains in `Pending` state for approximately 1 week (7 days) without an active blocker (e.g. *Backend Integration* in Team Beta), WORKNEX flags a **SILENT DELAY** warning, highlighting duration and date of last recorded update.

### 3. 🤝 Automatic Collaboration Meeting Generator
When a common technical blocker affects multiple members across teams (e.g. *API Access* affecting Team Alpha and Team Gamma), FlowAI detects the pattern and generates a 25-minute focused Microsoft Teams sync recommendation.

### 4. 👤 Leave & Work Reassignment
When an engineer is marked *On Leave* (e.g. Rishabh on leave due to hardware issue), WORKNEX analyzes available team capacity and suggests work reassignment to an available peer (e.g. Elena Rostova).

### 5. 💎 Verified Employee Collaboration Credits
Displays read-only verified credits awarded when engineers assist peers across teams. Free from toxic leaderboards or arbitrary performance scores.

### 6. ✨ FlowAI Decision Intelligence Assistant
Floating AI drawer providing rapid, formatted executive answers for queries such as:
* *"Which blockers are unresolved this week?"*
* *"Which teams have pending work?"*
* *"Which blockers are recurring?"*
* *"Which work areas have remained pending?"*
* *"Which teams are experiencing silent delays?"*
* *"Which employees have earned collaboration credits and why?"*
* *"Show me this week's project progress."*
* *"Which issues affect multiple teams?"*

---

## 5. Directory Structure

```text
hackathon microsoft/
├── index.html              # Modern HTML5 application shell & view mounts
├── server.py               # Zero-dependency Python 3 server & REST API
├── README.md               # Comprehensive hackathon documentation
├── css/
│   └── styles.css          # Microsoft Fluent 2 & Azure Enterprise design system
└── js/
    ├── data.js             # Realistic mock telemetry: 6 teams, 24 members, 54 tasks
    ├── charts.js           # High-DPI native Canvas renderers (5 interactive charts)
    ├── ai-engine.js        # FlowAI zero-hallucination decision query engine
    ├── state.js            # Manager state store, mock auth & reactive bus
    ├── demo-controller.js  # Hackathon simulation shortcuts & evaluation controls
    └── app.js              # Manager portal controller, routing, search & modals
```

---

*WORKNEX — Built for the Microsoft Global Hackathon. Empowering distributed teams with asynchronous clarity.*
