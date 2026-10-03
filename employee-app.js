/**
 * WORKNEX Employee Portal Application Controller
 * Microsoft Global Hackathon Prototype
 * "Less status chasing. More progress."
 *
 * Exclusively implements the EMPLOYEE MODULE for Aadarsh.
 * Strict Employee-Scope:
 * - Separate Role-Based Authentication & Route Protection.
 * - Voluntary Empty Daily Update Form & Attendance History (Zero Surveillance).
 * - Prominent Top-Navigation Credit Badge (🏆 150 Credits) & Personal Credits Page.
 * - Two-Way Collaboration Hub (Aadarsh helps others & Others help Aadarsh).
 * - Exact My To-Do card visual structure with read-only task priority.
 * - Isolated Team Alpha Progress (strictly no access to other teams).
 * - Personal Blockers, Automatic Collaboration Meetings, Achievements, and Notifications.
 * - Shared Single Source of Truth updating Manager Portal in real time.
 */

class WorknexEmployeeApp {
  constructor(store) {
    this.store = store;
    this.currentRoute = "dashboard";
    this.dailyUpdateSubmitted = false;
    this.lastSubmittedData = null;
    this.taskFilter = "all";
    this.activeTaskModal = null;
    this.caseBRequested = false;

    this.init();
  }

  init() {
    this.store.subscribe(() => {
      if (this.isEmployeePortalActive()) {
        this.render();
      }
    });

    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("employee/") || hash === "employee" || hash === "employee-login") {
        const subRoute = hash.replace("employee/", "").replace("employee", "") || "dashboard";
        this.navigateTo(subRoute, false);
      }
    });
  }

  isEmployeePortalActive() {
    const hash = window.location.hash;
    const isEmployeePage = window.location.pathname.includes("employee.html");
    return isEmployeePage || hash.startsWith("#employee") || hash.startsWith("#emp") || this.store.activeRole === "employee";
  }

  navigateTo(route, updateHash = true) {
    this.currentRoute = route || "dashboard";
    if (updateHash) {
      const isStandalone = window.location.pathname.includes("employee.html");
      window.location.hash = isStandalone ? `#${this.currentRoute}` : `#employee/${this.currentRoute}`;
    }
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  render() {
    const root = document.getElementById("app-root");
    if (!root) return;

    // Check if Manager is logged in on employee.html
    if (this.store.activeRole === "manager") {
      root.innerHTML = `
        <div class="login-container">
          <div class="login-card" style="text-align:center;">
            <div style="font-size:36px; margin-bottom:12px;">👔</div>
            <h2 style="font-size:18px; font-weight:700; color:var(--primary-navy); margin-bottom:8px;">Signed in as Manager (Avni)</h2>
            <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:20px;">
              The Employee Portal is reserved for contributors. Return to your Manager Portal to view team telemetry.
            </p>
            <a href="index.html#dashboard" class="login-btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
              <span>Go to Manager Portal →</span>
            </a>
          </div>
        </div>
      `;
      return;
    }

    if (!this.store.isEmployeeAuthenticated) {
      root.innerHTML = this.renderLoginPage();
      this.bindLoginEvents();
      return;
    }

    root.innerHTML = `
      <div class="app-shell">
        ${this.renderSidebar()}
        <div class="app-main-wrapper">
          ${this.renderTopNav()}
          <main class="app-content-body">
            ${this.renderCurrentView()}
          </main>
        </div>
      </div>

      <!-- Task Status Update Modal -->
      ${this.renderTaskUpdateModal()}

      <!-- Toast Container -->
      <div id="toast-container"></div>
    `;

    this.bindViewEvents();
  }

  // ==========================================================================
  // 1. EMPLOYEE LOGIN PAGE (SEPARATE LOGIN EXPERIENCE - SPEC #1)
  // ==========================================================================
  renderLoginPage() {
    return `
      <div class="login-container">
        <div class="login-card">
          <div class="login-brand">
            <div class="brand-logo-icon" style="background:#0078D4;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4l5 16 4-10 4 10 5-16"/>
              </svg>
            </div>
            <h1 class="login-title">WORKNEX</h1>
            <p class="login-tagline">"Less status chasing. More progress."</p>
            <span class="portal-badge" style="background:#EFF6FC; color:#0078D4; border-color:#C7E0F4;">
              Employee Portal
            </span>
          </div>

          <div id="employee-login-error" class="login-error-alert" style="display:none;">
            Invalid credentials. Please try again.
          </div>

          <form id="employee-login-form" onsubmit="event.preventDefault(); window.worknexEmployeeApp.handleLogin();">
            <div class="login-form-group">
              <label class="login-label" for="emp-login-email">Email / Employee ID</label>
              <div class="login-input-wrapper">
                <input 
                  type="email" 
                  id="emp-login-email" 
                  class="login-input" 
                  placeholder="aadarsh@worknex.demo" 
                  value="aadarsh@worknex.demo" 
                  required 
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="login-form-group">
              <label class="login-label" for="emp-login-password">Password</label>
              <div class="login-input-wrapper">
                <input 
                  type="password" 
                  id="emp-login-password" 
                  class="login-input" 
                  placeholder="Enter password" 
                  value="Employee@123" 
                  required 
                  autocomplete="current-password"
                />
                <button type="button" class="password-toggle-btn" id="emp-pwd-toggle-btn" title="Toggle password visibility">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div class="login-footer-actions" style="margin-bottom: 20px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary); cursor:pointer;">
                <input type="checkbox" id="emp-remember-me" checked style="accent-color:var(--ms-blue);">
                Remember Employee session
              </label>
            </div>

            <button type="submit" class="login-btn-primary">
              Sign In to Employee Portal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </form>

          <div class="login-demo-helper" style="border-left-color:var(--ms-blue);">
            <strong>Employee Demo Credentials:</strong><br>
            Name: <code style="color:var(--ms-blue); font-weight:700;">Aadarsh</code><br>
            Email: <code style="color:var(--ms-blue); font-weight:600;">aadarsh@worknex.demo</code><br>
            Password: <code style="color:var(--ms-blue); font-weight:600;">Employee@123</code>
          </div>

          <div style="margin-top:16px; padding-top:14px; border-top:1px solid #E2E8F0; text-align:center;">
            <a href="index.html#start" style="display:inline-flex; align-items:center; gap:6px; color:var(--text-muted); font-size:13px; text-decoration:none;">
              ← Back to Portal Selection
            </a>
          </div>
        </div>
      </div>
    `;
  }

  bindLoginEvents() {
    const toggleBtn = document.getElementById("emp-pwd-toggle-btn");
    const pwdInput = document.getElementById("emp-login-password");
    if (toggleBtn && pwdInput) {
      toggleBtn.addEventListener("click", () => {
        const isPwd = pwdInput.type === "password";
        pwdInput.type = isPwd ? "text" : "password";
        toggleBtn.innerHTML = isPwd
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }
  }

  handleLogin() {
    const email = document.getElementById("emp-login-email").value;
    const password = document.getElementById("emp-login-password").value;
    const errBox = document.getElementById("employee-login-error");

    const result = this.store.loginEmployee(email, password);
    if (result.success) {
      if (errBox) errBox.style.display = "none";
      this.showToast("Welcome back, Aadarsh. Employee Portal loaded.", "success");
      this.navigateTo("dashboard");
    } else {
      if (errBox) {
        errBox.textContent = result.message || "Invalid credentials. Please try again.";
        errBox.style.display = "block";
      }
    }
  }

  handleLogout() {
    this.store.logoutEmployee();
    window.location.hash = "#start";
    this.showToast("Signed out of Employee Portal.", "info");
    if (window.worknexApp) {
      window.worknexApp.render();
    } else {
      this.render();
    }
  }

  // ==========================================================================
  // 2. EMPLOYEE SIDEBAR
  // ==========================================================================
  renderSidebar() {
    const state = this.store.getState();
    const myTasks = state.tasks.filter(t => t.employee === "Aadarsh");
    const myBlockers = state.blockers.filter(b => b.assignedEmployee === "Aadarsh" && b.status !== "Resolved");
    const myUnreadNotifs = state.notifications.filter(n => n.unread && (!n.forEmployee || n.forEmployee === "Aadarsh")).length;

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>` },
      { id: "daily-update", label: "Daily Update", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>` },
      { id: "tasks", label: "My Tasks", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`, badge: myTasks.length },
      { id: "my-team", label: "My Team", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>` },
      { id: "blockers", label: "My Blockers", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`, badge: myBlockers.length > 0 ? myBlockers.length : null, isDanger: myBlockers.length > 0 },
      { id: "collaboration", label: "Collaboration Hub", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>` },
      { id: "credits", label: "My Credits", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>` },
      { id: "achievements", label: "My Achievements", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>` },
      { id: "notifications", label: "Notifications", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`, badge: myUnreadNotifs > 0 ? myUnreadNotifs : null }
    ];

    return `
      <aside class="app-sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo-icon" style="width:34px; height:34px; border-radius:8px; margin-bottom:0; background:var(--ms-blue);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4l5 16 4-10 4 10 5-16"/>
            </svg>
          </div>
          <div class="brand-text-block">
            <span class="brand-name">WORKNEX</span>
            <span class="brand-tagline-mini">Employee Portal • Team Alpha</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <a 
              href="#employee/${item.id}" 
              class="sidebar-nav-item ${this.currentRoute === item.id ? 'active' : ''}"
              onclick="event.preventDefault(); window.worknexEmployeeApp.navigateTo('${item.id}');"
            >
              <div class="nav-item-left">
                <span class="nav-item-icon">${item.icon}</span>
                <span>${item.label}</span>
              </div>
              ${item.badge !== undefined && item.badge !== null ? `
                <span class="nav-badge ${item.isDanger ? 'danger' : ''}">${item.badge}</span>
              ` : ''}
            </a>
          `).join("")}
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <div class="user-pill-info">
              <div class="user-avatar" style="background:#0078D4; border:1px solid #60A5FA;">AP</div>
              <div class="user-details-text">
                <span class="user-name-label">Aadarsh</span>
                <span class="user-role-label">Software Engineer</span>
              </div>
            </div>
            <button class="btn-signout-icon" onclick="window.worknexEmployeeApp.handleLogout()" title="Sign Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  // ==========================================================================
  // 3. EMPLOYEE TOP NAV (SPEC #4: PROMINENT CREDITS VISIBLE AT THE TOP)
  // ==========================================================================
  renderTopNav() {
    const routeTitles = {
      "dashboard": "Employee Dashboard",
      "daily-update": "Daily Work Update",
      "tasks": "My Tasks",
      "my-team": "My Team (Team Alpha)",
      "blockers": "My Blockers",
      "collaboration": "Collaboration Hub",
      "credits": "My Collaboration Credits",
      "achievements": "My Achievements",
      "notifications": "Notifications"
    };

    const title = routeTitles[this.currentRoute] || "Employee Portal";
    const state = this.store.getState();
    const aadarshEmp = state.employees.find(e => e.name === "Aadarsh") || { credits: 150 };
    const myUnreadNotifs = state.notifications.filter(n => n.unread && (!n.forEmployee || n.forEmployee === "Aadarsh")).length;

    return `
      <header class="app-top-nav">
        <div class="top-nav-left">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:16px; font-weight:700; color:var(--primary-navy); letter-spacing:-0.2px;">
              ${title}
            </span>
            <span class="badge badge-info" style="font-size:11px;">Team Alpha</span>
          </div>
        </div>

        <div class="top-nav-right">
          <!-- SPEC #4: PERSONAL CREDIT PROMINENTLY VISIBLE AT THE TOP -->
          <div 
            class="top-nav-credit-chip" 
            onclick="window.worknexEmployeeApp.navigateTo('credits')" 
            title="View My Collaboration Credits"
          >
            <span style="font-size:16px;">🏆</span>
            <span>${aadarshEmp.credits || 150} Credits</span>
          </div>

          <!-- Notification Shortcut Button -->
          <button 
            class="btn btn-xs btn-outline" 
            onclick="window.worknexEmployeeApp.navigateTo('notifications')"
            style="position:relative; padding:6px 10px; border-color:#CBD5E1; color:var(--primary-navy);"
            title="Notifications"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            ${myUnreadNotifs > 0 ? `
              <span style="position:absolute; top:-4px; right:-4px; width:8px; height:8px; background:var(--status-danger); border-radius:50%;"></span>
            ` : ''}
          </button>

          <div style="display:flex; align-items:center; gap:8px; padding-left:8px; border-left:1px solid #E2E8F0;">
            <div class="user-avatar" style="width:30px; height:30px; font-size:11px; background:#0078D4; color:#FFFFFF;">AP</div>
            <span style="font-size:13px; font-weight:600; color:var(--primary-navy);">Aadarsh</span>
          </div>
        </div>
      </header>
    `;
  }

  // ==========================================================================
  // 4. VIEW ROUTER
  // ==========================================================================
  renderCurrentView() {
    switch (this.currentRoute) {
      case "dashboard":
        return this.renderDashboardView();
      case "daily-update":
        return this.renderDailyUpdateView();
      case "tasks":
        return this.renderTasksView();
      case "my-team":
        return this.renderTeamView();
      case "blockers":
        return this.renderBlockersView();
      case "collaboration":
        return this.renderCollaborationView();
      case "credits":
        return this.renderCreditsView();
      case "achievements":
        return this.renderAchievementsView();
      case "notifications":
        return this.renderNotificationsView();
      default:
        return this.renderDashboardView();
    }
  }

  // ==========================================================================
  // 5. EMPLOYEE DASHBOARD (SPEC #7: MY TO-DO EXACT VISUAL STRUCTURE)
  // ==========================================================================
  renderDashboardView() {
    const state = this.store.getState();
    const myTasks = state.tasks.filter(t => t.employee === "Aadarsh");
    const myPendingTasks = myTasks.filter(t => t.status !== "Completed");
    const completedTasks = myTasks.filter(t => t.status === "Completed");
    const myBlocker = state.blockers.find(b => b.assignedEmployee === "Aadarsh" && b.status !== "Resolved");
    const aadarshEmp = state.employees.find(e => e.name === "Aadarsh") || { credits: 150 };
    const teamAlpha = state.teams.find(t => t.id === "team-alpha") || state.teams[0];
    const suggestedMeeting = state.suggestedMeetings && state.suggestedMeetings.length > 0 ? state.suggestedMeetings[0] : null;

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Good day, Aadarsh</h1>
          <p class="page-subtitle">Software Engineer • Team Alpha (Core Platform & UI/UX)</p>
        </div>
        <div>
          <button class="btn btn-sm btn-primary" onclick="window.worknexEmployeeApp.navigateTo('daily-update')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Submit Daily Update
          </button>
        </div>
      </div>

      <!-- 4 KPI SUMMARY CARDS -->
      <div class="kpi-grid-6" style="grid-template-columns: repeat(4, 1fr); margin-bottom:28px;">
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">My Pending Tasks</span>
            <div class="kpi-icon-pill" style="background:#EFF6FC; color:var(--ms-blue);">⏳</div>
          </div>
          <div class="kpi-value-number">${myPendingTasks.length}</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-neutral">${myPendingTasks.length > 0 ? 'Assigned' : 'All Clear'}</span>
            <span>active sprint</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Completed Deliverables</span>
            <div class="kpi-icon-pill" style="background:#ECFDF5; color:var(--status-success);">✓</div>
          </div>
          <div class="kpi-value-number" style="color:var(--status-success);">${completedTasks.length}</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-up">Validated</span>
            <span>milestones</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Active Blockers</span>
            <div class="kpi-icon-pill" style="background:${myBlocker ? '#FEF2F2' : '#ECFDF5'}; color:${myBlocker ? 'var(--status-danger)' : 'var(--status-success)'};">
              ${myBlocker ? '⚠️' : '✓'}
            </div>
          </div>
          <div class="kpi-value-number" style="color:${myBlocker ? 'var(--status-danger)' : 'var(--status-success)'};">
            ${myBlocker ? 1 : 0}
          </div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge ${myBlocker ? 'trend-down' : 'trend-up'}">
              ${myBlocker ? myBlocker.title : 'No blockers'}
            </span>
            <span>current status</span>
          </div>
        </div>

        <div class="kpi-card" onclick="window.worknexEmployeeApp.navigateTo('credits')" style="cursor:pointer;">
          <div class="kpi-top-row">
            <span class="kpi-label">My Credits</span>
            <div class="kpi-icon-pill" style="background:#FEF3C7; color:#92400E;">🏆</div>
          </div>
          <div class="kpi-value-number" style="color:#92400E;">${aadarshEmp.credits || 150}</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-up">Verified</span>
            <span>peer collaboration</span>
          </div>
        </div>
      </div>

      <!-- SPEC #7: MY TO-DO (EXACT VISUAL STRUCTURE) -->
      <div class="card-section" style="margin-bottom:28px;">
        <div class="card-section-header">
          <div>
            <h2 class="card-section-title" style="letter-spacing:0.5px;">MY TO-DO</h2>
            <p style="font-size:12.5px; color:var(--text-muted); margin-top:2px;">
              Your assigned pending and incomplete engineering tasks. Priority is determined by team workflow.
            </p>
          </div>
          <button class="btn btn-xs btn-outline" onclick="window.worknexEmployeeApp.navigateTo('tasks')">View All Tasks →</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
          ${myPendingTasks.length > 0 ? myPendingTasks.map(task => `
            <div class="todo-card-exact ${task.blocker && task.blocker !== 'None' ? 'blocked-task' : ''}">
              <div class="todo-field-group">
                <div class="todo-label-field">TASK</div>
                <div class="todo-value-field">${task.workArea}</div>
              </div>

              <div class="todo-field-group">
                <div class="todo-label-field">DEADLINE</div>
                <div class="todo-value-field" style="color:var(--text-secondary); font-size:13.5px; font-weight:600;">
                  ${task.deadline}
                </div>
              </div>

              <div class="todo-field-group">
                <div class="todo-label-field">STATUS</div>
                <div class="todo-value-field">
                  <span class="badge ${task.status === 'Completed' ? 'badge-success' : (task.status === 'Incomplete' || task.status === 'Blocked' ? 'badge-danger' : 'badge-warning')}">
                    ${task.status}
                  </span>
                </div>
              </div>

              <div class="todo-field-group">
                <div class="todo-label-field">PRIORITY</div>
                <div class="todo-value-field">
                  <span class="badge ${task.priority === 'High' ? 'badge-danger' : (task.priority === 'Medium' ? 'badge-info' : 'badge-neutral')}">
                    ${task.priority || 'Medium'}
                  </span>
                  <span style="font-size:11px; color:var(--text-muted); font-weight:normal; margin-left:6px;" title="Priority assigned by Manager / Team Lead (Read-Only)">🔒 Assigned</span>
                </div>
              </div>

              <div class="todo-field-group">
                <div class="todo-label-field">PROGRESS</div>
                <div class="todo-value-field">${task.progress}%</div>
                <div class="progress-bar-track" style="height:6px; margin-top:6px;">
                  <div class="progress-bar-fill" style="width:${task.progress}%; background:${task.status === 'Completed' ? 'var(--status-success)' : (task.blocker && task.blocker !== 'None' ? 'var(--status-danger)' : 'var(--ms-blue)')};"></div>
                </div>
              </div>

              <div class="todo-field-group">
                <div class="todo-label-field">BLOCKER</div>
                <div class="todo-value-field" style="color:${task.blocker && task.blocker !== 'None' ? 'var(--status-danger)' : 'var(--status-success)'}; font-size:13.5px;">
                  ${task.blocker || 'None'}
                </div>
              </div>

              <div class="todo-card-actions">
                <button class="btn btn-xs btn-outline" onclick="window.worknexEmployeeApp.openTaskUpdateModal('${task.id}')">
                  UPDATE STATUS
                </button>
                <button class="btn btn-xs btn-ai" onclick="window.worknexEmployeeApp.navigateTo('collaboration')">
                  REQUEST HELP
                </button>
              </div>
            </div>
          `).join("") : `
            <div style="text-align:center; padding:32px; background:#F8FAFC; border-radius:var(--radius-md); color:var(--text-muted); grid-column:1/-1;">
              <div style="font-size:24px; margin-bottom:6px;">✓</div>
              <div style="font-weight:700; color:var(--primary-navy);">All pending tasks completed!</div>
              <div style="font-size:13px;">You have no active pending deliverables assigned.</div>
            </div>
          `}
        </div>
      </div>

      <!-- TWO-COLUMN LAYOUT: MY TEAM & COLLABORATION MEETING -->
      <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:24px; margin-bottom:28px;">
        
        <!-- SPEC #10: MY TEAM (TEAM ALPHA ONLY) -->
        <div class="card-section" style="margin-bottom:0;">
          <div class="card-section-header">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h2 class="card-section-title">TEAM ALPHA</h2>
                <span class="badge badge-info">${teamAlpha.progress || 82}% Progress</span>
              </div>
              <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                Lead: ${teamAlpha.lead} • Isolated aggregate view of your team only.
              </p>
            </div>
          </div>

          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:700;">
              <span>Sprint Progress</span>
              <span style="color:var(--ms-blue);">${teamAlpha.progress || 82}% Progress</span>
            </div>
            <div class="progress-bar-track" style="height:10px; margin-bottom:14px;">
              <div class="progress-bar-fill" style="width:${teamAlpha.progress || 82}%; background:var(--ms-blue);"></div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; text-align:center;">
              <div style="background:#FFFFFF; padding:10px; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
                <div style="font-size:18px; font-weight:800; color:var(--status-success);">18</div>
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Completed: 18</div>
              </div>
              <div style="background:#FFFFFF; padding:10px; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
                <div style="font-size:18px; font-weight:800; color:var(--ms-blue);">4</div>
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Pending: 4</div>
              </div>
              <div style="background:#FFFFFF; padding:10px; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
                <div style="font-size:18px; font-weight:800; color:var(--status-danger);">2</div>
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Blockers: 2</div>
              </div>
            </div>
          </div>

          <!-- Weekly Progress -->
          <div>
            <span style="font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block;">
              Weekly Progress:
            </span>
            <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:6px; text-align:center; font-size:12px;">
              <div style="background:#EFF6FC; padding:8px 4px; border-radius:var(--radius-sm);">
                <div style="font-weight:700; color:var(--ms-blue);">65%</div>
                <div style="color:var(--text-muted); font-size:11px;">Mon</div>
              </div>
              <div style="background:#EFF6FC; padding:8px 4px; border-radius:var(--radius-sm);">
                <div style="font-weight:700; color:var(--ms-blue);">70%</div>
                <div style="color:var(--text-muted); font-size:11px;">Tue</div>
              </div>
              <div style="background:#EFF6FC; padding:8px 4px; border-radius:var(--radius-sm);">
                <div style="font-weight:700; color:var(--ms-blue);">74%</div>
                <div style="color:var(--text-muted); font-size:11px;">Wed</div>
              </div>
              <div style="background:#EFF6FC; padding:8px 4px; border-radius:var(--radius-sm);">
                <div style="font-weight:700; color:var(--ms-blue);">78%</div>
                <div style="color:var(--text-muted); font-size:11px;">Thu</div>
              </div>
              <div style="background:#0078D4; color:#FFFFFF; padding:8px 4px; border-radius:var(--radius-sm);">
                <div style="font-weight:800; color:#FFFFFF;">82%</div>
                <div style="color:#BFDBFE; font-size:11px;">Fri</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SPEC #12: AUTOMATIC COLLABORATION MEETING -->
        <div class="card-section" style="margin-bottom:0;">
          <div class="card-section-header">
            <div>
              <span class="badge badge-ai" style="margin-bottom:4px; display:inline-block;">Cross-Team Resolution</span>
              <h2 class="card-section-title">COLLABORATION MEETING</h2>
            </div>
          </div>

          ${suggestedMeeting ? `
            <div style="background:#F5F3FF; border:1px solid #DDD6FE; border-radius:var(--radius-md); padding:16px;">
              <div style="font-size:13.5px; margin-bottom:8px;">
                <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:#6D28D9; display:block;">Issue:</span>
                <strong style="color:var(--primary-navy); font-size:15px;">${suggestedMeeting.issue}</strong>
              </div>

              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; font-size:12.5px; margin-bottom:12px;">
                <div>
                  <span style="color:var(--text-muted); display:block; font-size:11px; text-transform:uppercase;">Affected Members:</span>
                  <strong style="color:var(--primary-navy); font-size:14px;">${suggestedMeeting.affectedMembersCount || 4}</strong>
                </div>
                <div>
                  <span style="color:var(--text-muted); display:block; font-size:11px; text-transform:uppercase;">Affected Teams:</span>
                  <strong style="color:var(--primary-navy);">${suggestedMeeting.affectedTeams.join(", ")}</strong>
                </div>
              </div>

              <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px; border-top:1px dashed #DDD6FE; padding-top:10px;">
                <span style="font-weight:700; display:block; margin-bottom:2px; color:#6D28D9;">Suggested Participants:</span>
                ${suggestedMeeting.suggestedParticipants}
              </div>

              <a 
                href="${suggestedMeeting.teamsLink || '#'}" 
                target="_blank" 
                class="btn btn-sm btn-ai" 
                style="width:100%; text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:6px;"
              >
                <span>Join Collaboration Sync (Teams)</span>
              </a>
            </div>
          ` : `
            <div style="text-align:center; padding:32px; color:var(--text-muted); font-size:13px;">
              No cross-team blockers requiring an automatic meeting at this time.
            </div>
          `}
        </div>

      </div>
    `;
  }

  // ==========================================================================
  // 6. DAILY UPDATE FORM (SPEC #2 & #17: MUST BE AN EMPTY FORM)
  // ==========================================================================
  renderDailyUpdateView() {
    const state = this.store.getState();
    const attendanceHistory = state.aadarshAttendanceHistory || [
      { date: "1 Oct", status: "Present" },
      { date: "2 Oct", status: "Present" },
      { date: "3 Oct", status: "On Leave" },
      { date: "4 Oct", status: "Present" }
    ];

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">DAILY UPDATE</h1>
          <p class="page-subtitle">Submit your voluntary asynchronous update. All fields start empty for contributor input.</p>
        </div>
      </div>

      <div style="max-width: 820px;">
        ${this.dailyUpdateSubmitted ? `
          <div class="alert-banner" style="background:#ECFDF5; border-color:#A7F3D0; margin-bottom:24px;">
            <div class="alert-banner-left">
              <div class="alert-icon-box" style="background:#D1FAE5; color:#065F46;">✓</div>
              <div>
                <div class="alert-title-main" style="color:#065F46;">
                  Daily Update Submitted Successfully
                </div>
                <div class="alert-desc-text" style="color:#047857;">
                  Saved to shared Worknex state. Synchronized in real time with Avni's Manager Portal and the Collaboration Hub.
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="card-section">
          <form id="daily-update-form" onsubmit="event.preventDefault(); window.worknexEmployeeApp.handleDailyUpdateSubmit();">
            
            <!-- 1. What did you work on today? (EMPTY TEXTAREA) -->
            <div style="margin-bottom:20px;">
              <label class="login-label" style="font-weight:700; margin-bottom:6px; display:block; color:var(--primary-navy);">
                What did you work on today?
              </label>
              <textarea 
                id="update-worked-on" 
                class="login-input" 
                rows="3" 
                style="height:auto; padding:10px 14px; font-family:var(--font-sans); resize:vertical;" 
                placeholder="Enter your update..."
                required
              ></textarea>
            </div>

            <!-- 2. What did you complete? (EMPTY TEXTAREA) -->
            <div style="margin-bottom:20px;">
              <label class="login-label" style="font-weight:700; margin-bottom:6px; display:block; color:var(--primary-navy);">
                What did you complete?
              </label>
              <textarea 
                id="update-completed" 
                class="login-input" 
                rows="2" 
                style="height:auto; padding:10px 14px; font-family:var(--font-sans); resize:vertical;" 
                placeholder="Enter completed work..."
              ></textarea>
            </div>

            <!-- 3. What is still pending? (EMPTY TEXTAREA) -->
            <div style="margin-bottom:20px;">
              <label class="login-label" style="font-weight:700; margin-bottom:6px; display:block; color:var(--primary-navy);">
                What is still pending?
              </label>
              <textarea 
                id="update-pending" 
                class="login-input" 
                rows="2" 
                style="height:auto; padding:10px 14px; font-family:var(--font-sans); resize:vertical;" 
                placeholder="Enter pending deliverables..."
              ></textarea>
            </div>

            <!-- 4. Are you facing a blocker? [ Yes / No ] -->
            <div style="margin-bottom:20px; background:#F8FAFC; padding:16px; border-radius:var(--radius-md); border:1px solid #E2E8F0;">
              <label class="login-label" style="font-weight:700; margin-bottom:8px; display:block; color:var(--primary-navy);">
                Are you facing a blocker?
              </label>
              <div style="display:flex; gap:24px; margin-bottom:12px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; font-weight:600;">
                  <input type="radio" name="isBlocked" value="yes" onchange="window.worknexEmployeeApp.toggleBlockerInput(true)" style="accent-color:var(--status-danger);">
                  <span style="color:var(--status-danger);">Yes</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; font-weight:600;">
                  <input type="radio" name="isBlocked" value="no" checked onchange="window.worknexEmployeeApp.toggleBlockerInput(false)" style="accent-color:var(--status-success);">
                  <span style="color:var(--status-success);">No</span>
                </label>
              </div>

              <!-- Blocker conditional fields (EMPTY TEXTAREAS) -->
              <div id="blocker-reason-container" style="display:none; border-top:1px solid #E2E8F0; padding-top:14px; margin-top:8px;">
                <div style="margin-bottom:14px;">
                  <label class="login-label" style="font-weight:600; margin-bottom:6px; display:block; color:var(--status-danger-text);">
                    What is blocking you?
                  </label>
                  <textarea 
                    id="update-blocker" 
                    class="login-input" 
                    rows="2" 
                    style="height:auto; padding:10px 14px; font-family:var(--font-sans); resize:vertical;" 
                    placeholder="Describe what is blocking you..."
                  ></textarea>
                </div>

                <div>
                  <label class="login-label" style="font-weight:600; margin-bottom:6px; display:block; color:var(--status-danger-text);">
                    Any challenge?
                  </label>
                  <textarea 
                    id="update-challenge" 
                    class="login-input" 
                    rows="2" 
                    style="height:auto; padding:10px 14px; font-family:var(--font-sans); resize:vertical;" 
                    placeholder="Describe any technical challenge..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 5. ATTENDANCE (SPEC #3: Present / On Leave) -->
            <div style="margin-bottom:24px; background:#F8FAFC; padding:16px; border-radius:var(--radius-md); border:1px solid #E2E8F0;">
              <label class="login-label" style="font-weight:700; margin-bottom:8px; display:block; color:var(--primary-navy);">
                ATTENDANCE
              </label>
              <div style="display:flex; gap:24px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; font-weight:600;">
                  <input type="radio" name="attendance" value="Present" checked style="accent-color:var(--ms-blue);">
                  <span style="color:var(--status-success);">○ Present</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; font-weight:600;">
                  <input type="radio" name="attendance" value="On Leave" style="accent-color:var(--status-warning);">
                  <span style="color:var(--status-warning);">○ On Leave</span>
                </label>
              </div>
              <span style="font-size:11.5px; color:var(--text-muted); display:block; margin-top:8px;">
                Voluntary attendance selection. No background employee tracking or surveillance.
              </span>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:12px 28px; font-size:14.5px; font-weight:700;">
              SUBMIT DAILY UPDATE
            </button>
          </form>
        </div>

        <!-- SPEC #3: ATTENDANCE HISTORY -->
        <div class="card-section" style="margin-top:24px;">
          <div class="card-section-header">
            <div>
              <h2 class="card-section-title">ATTENDANCE HISTORY</h2>
              <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                Voluntary attendance records logged with your daily updates.
              </p>
            </div>
          </div>

          <table class="attendance-table-wrap">
            <thead>
              <tr>
                <th style="width:50%;">DATE</th>
                <th>ATTENDANCE</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceHistory.map(item => `
                <tr>
                  <td><strong>${item.date}</strong></td>
                  <td>
                    <span class="badge ${item.status === 'Present' ? 'badge-success' : 'badge-warning'}">
                      ${item.status}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

      </div>
    `;
  }

  toggleBlockerInput(isBlocked) {
    const box = document.getElementById("blocker-reason-container");
    if (box) {
      box.style.display = isBlocked ? "block" : "none";
    }
  }

  handleDailyUpdateSubmit() {
    const workedOn = (document.getElementById("update-worked-on").value || "").trim();
    const completed = (document.getElementById("update-completed").value || "").trim();
    const pending = (document.getElementById("update-pending").value || "").trim();
    const isBlocked = document.querySelector('input[name="isBlocked"]:checked').value === "yes";
    const blockerReason = isBlocked ? (document.getElementById("update-blocker").value || "API Access").trim() : "None";
    const challenge = isBlocked ? (document.getElementById("update-challenge").value || "").trim() : "None";
    const attendance = document.querySelector('input[name="attendance"]:checked').value;

    const result = this.store.submitDailyUpdate("Aadarsh", {
      whatWorkedOn: workedOn,
      whatCompleted: completed,
      whatPending: pending,
      isBlocked: isBlocked,
      blockerReason: blockerReason,
      challenge: challenge,
      attendance: attendance,
      workArea: "Software Integration",
      date: "4 Oct 2026"
    });

    this.dailyUpdateSubmitted = true;
    this.lastSubmittedData = {
      workArea: "Software Integration",
      status: isBlocked ? "Pending" : "Completed",
      blocker: blockerReason,
      attendance: attendance
    };

    this.showToast("Daily update saved to shared Worknex state.", "success");
    this.render();
  }

  // ==========================================================================
  // 7. MY TASKS VIEW (SPEC #8 & #9: BADGES, PRIORITY VIEW-ONLY, STATUS UPDATES)
  // ==========================================================================
  renderTasksView() {
    const state = this.store.getState();
    const myTasks = state.tasks.filter(t => t.employee === "Aadarsh");
    const filteredTasks = myTasks.filter(t => {
      if (this.taskFilter === "pending") return t.status !== "Completed";
      if (this.taskFilter === "completed") return t.status === "Completed";
      if (this.taskFilter === "blocked") return t.blocker && t.blocker !== "None";
      return true;
    });

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">MY TASKS</h1>
          <p class="page-subtitle">Personal assigned deliverables. Contributor status updates are supported; top-down task priorities are assigned by team lead / manager.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-xs ${this.taskFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="window.worknexEmployeeApp.setTaskFilter('all')">All (${myTasks.length})</button>
          <button class="btn btn-xs ${this.taskFilter === 'pending' ? 'btn-primary' : 'btn-outline'}" onclick="window.worknexEmployeeApp.setTaskFilter('pending')">Pending</button>
          <button class="btn btn-xs ${this.taskFilter === 'blocked' ? 'btn-primary' : 'btn-outline'}" onclick="window.worknexEmployeeApp.setTaskFilter('blocked')">Blocked</button>
          <button class="btn btn-xs ${this.taskFilter === 'completed' ? 'btn-primary' : 'btn-outline'}" onclick="window.worknexEmployeeApp.setTaskFilter('completed')">Completed</button>
        </div>
      </div>

      <div class="card-section" style="padding:0; overflow:hidden;">
        <table class="data-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:12px 16px;">TASK</th>
              <th>STATUS</th>
              <th>PRIORITY</th>
              <th>DEADLINE</th>
              <th>PROGRESS</th>
              <th>BLOCKER</th>
              <th style="text-align:right; padding-right:16px;">ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTasks.map(task => `
              <tr>
                <td style="padding:14px 16px;">
                  <strong style="color:var(--primary-navy); font-size:14px;">${task.workArea}</strong>
                  <span style="font-size:11.5px; color:var(--text-muted); display:block;">Team Alpha • Aadarsh</span>
                </td>
                <td>
                  <span class="badge ${this.getStatusBadgeClass(task.status)}">
                    ${task.status}
                  </span>
                </td>
                <td>
                  <span class="badge ${task.priority === 'High' ? 'badge-danger' : (task.priority === 'Medium' ? 'badge-info' : 'badge-neutral')}">
                    ${task.priority || 'Medium'}
                  </span>
                </td>
                <td style="font-size:13px; color:var(--text-secondary);">${task.deadline}</td>
                <td style="min-width:120px;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
                    <span>${task.progress}%</span>
                  </div>
                  <div class="progress-bar-track" style="height:6px;">
                    <div class="progress-bar-fill" style="width:${task.progress}%; background:${task.status === 'Completed' ? 'var(--status-success)' : (task.blocker && task.blocker !== 'None' ? 'var(--status-danger)' : 'var(--ms-blue)')};"></div>
                  </div>
                </td>
                <td>
                  <span style="font-size:13px; font-weight:600; color:${task.blocker && task.blocker !== 'None' ? 'var(--status-danger)' : 'var(--status-success)'};">
                    ${task.blocker || 'None'}
                  </span>
                </td>
                <td style="text-align:right; padding-right:16px;">
                  <button class="btn btn-xs btn-outline" onclick="window.worknexEmployeeApp.openTaskUpdateModal('${task.id}')">
                    Update Status
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case "Completed": return "badge-success";
      case "In Progress": return "badge-info";
      case "Pending": return "badge-warning";
      case "Overdue": return "badge-overdue";
      case "Blocked":
      case "Incomplete":
        return "badge-danger";
      default: return "badge-neutral";
    }
  }

  setTaskFilter(filter) {
    this.taskFilter = filter;
    this.render();
  }

  // ==========================================================================
  // 8. MY TEAM VIEW (SPEC #10: TEAM ALPHA ONLY - STRICT ISOLATION)
  // ==========================================================================
  renderTeamView() {
    const state = this.store.getState();
    const teamAlpha = state.teams.find(t => t.id === "team-alpha") || state.teams[0];

    return `
      <div class="page-header-block">
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <h1 class="page-title">TEAM ALPHA</h1>
            <span class="badge badge-info">Core Platform & UI/UX</span>
          </div>
          <p class="page-subtitle">Team Lead: ${teamAlpha.lead} • Strictly isolated view of your assigned engineering unit.</p>
        </div>
        <div style="font-size:12px; color:var(--text-muted); background:#F1F5F9; padding:6px 12px; border-radius:var(--radius-sm); border:1px solid #CBD5E1;">
          🔒 Anti-Surveillance Scope • Other teams are not accessible
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px; max-width:1000px;">
        <div class="card-section" style="margin-bottom:0;">
          <h2 class="card-section-title" style="margin-bottom:14px;">Sprint Health & Velocity</h2>
          
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px; font-weight:700;">
            <span>Team Progress</span>
            <span style="color:var(--ms-blue); font-size:16px;">82% Progress</span>
          </div>
          <div class="progress-bar-track" style="height:12px; margin-bottom:20px;">
            <div class="progress-bar-fill" style="width:82%; background:var(--ms-blue);"></div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; text-align:center; margin-bottom:24px;">
            <div style="background:#F0FDF4; border:1px solid #BBF7D0; padding:16px; border-radius:var(--radius-md);">
              <div style="font-size:24px; font-weight:800; color:var(--status-success);">18</div>
              <div style="font-size:12px; font-weight:700; color:#065F46; text-transform:uppercase;">Completed Tasks</div>
            </div>
            <div style="background:#EFF6FC; border:1px solid #C7E0F4; padding:16px; border-radius:var(--radius-md);">
              <div style="font-size:24px; font-weight:800; color:var(--ms-blue);">4</div>
              <div style="font-size:12px; font-weight:700; color:#0078D4; text-transform:uppercase;">Pending Tasks</div>
            </div>
            <div style="background:#FEF2F2; border:1px solid #FECACA; padding:16px; border-radius:var(--radius-md);">
              <div style="font-size:24px; font-weight:800; color:var(--status-danger);">2</div>
              <div style="font-size:12px; font-weight:700; color:#991B1B; text-transform:uppercase;">Active Blockers</div>
            </div>
          </div>

          <div>
            <h3 style="font-size:13px; font-weight:700; color:var(--text-secondary); margin-bottom:10px;">
              Weekly Progress:
            </h3>
            <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; text-align:center;">
              <div style="background:#EFF6FC; padding:10px; border-radius:var(--radius-sm); border:1px solid #C7E0F4;">
                <div style="font-weight:700; color:var(--ms-blue); font-size:14px;">65%</div>
                <div style="color:var(--text-muted); font-size:12px; margin-top:2px;">Mon</div>
              </div>
              <div style="background:#EFF6FC; padding:10px; border-radius:var(--radius-sm); border:1px solid #C7E0F4;">
                <div style="font-weight:700; color:var(--ms-blue); font-size:14px;">70%</div>
                <div style="color:var(--text-muted); font-size:12px; margin-top:2px;">Tue</div>
              </div>
              <div style="background:#EFF6FC; padding:10px; border-radius:var(--radius-sm); border:1px solid #C7E0F4;">
                <div style="font-weight:700; color:var(--ms-blue); font-size:14px;">74%</div>
                <div style="color:var(--text-muted); font-size:12px; margin-top:2px;">Wed</div>
              </div>
              <div style="background:#EFF6FC; padding:10px; border-radius:var(--radius-sm); border:1px solid #C7E0F4;">
                <div style="font-weight:700; color:var(--ms-blue); font-size:14px;">78%</div>
                <div style="color:var(--text-muted); font-size:12px; margin-top:2px;">Thu</div>
              </div>
              <div style="background:#0078D4; color:#FFFFFF; padding:10px; border-radius:var(--radius-sm);">
                <div style="font-weight:800; color:#FFFFFF; font-size:14px;">82%</div>
                <div style="color:#BFDBFE; font-size:12px; margin-top:2px;">Fri</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section" style="margin-bottom:0;">
          <h2 class="card-section-title" style="margin-bottom:14px;">Team Alpha Members</h2>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:#F8FAFC; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
              <div class="user-avatar" style="background:#0284C7; color:#FFFFFF; width:32px; height:32px; font-size:12px;">ER</div>
              <div>
                <strong style="font-size:13.5px; color:var(--primary-navy);">Elena Rostova</strong>
                <span style="font-size:11.5px; color:var(--text-muted); display:block;">Team Lead & Principal Architect</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:#EFF6FC; border-radius:var(--radius-sm); border:1px solid #C7E0F4;">
              <div class="user-avatar" style="background:#0078D4; color:#FFFFFF; width:32px; height:32px; font-size:12px;">AP</div>
              <div>
                <strong style="font-size:13.5px; color:var(--primary-navy);">Aadarsh (You)</strong>
                <span style="font-size:11.5px; color:var(--ms-blue); display:block; font-weight:600;">Software Engineer</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:#F8FAFC; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
              <div class="user-avatar" style="background:#0F172A; color:#FFFFFF; width:32px; height:32px; font-size:12px;">AV</div>
              <div>
                <strong style="font-size:13.5px; color:var(--primary-navy);">Avni</strong>
                <span style="font-size:11.5px; color:var(--text-muted); display:block;">Manager & UI/UX Oversight</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:#F8FAFC; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
              <div class="user-avatar" style="background:#475569; color:#FFFFFF; width:32px; height:32px; font-size:12px;">DC</div>
              <div>
                <strong style="font-size:13.5px; color:var(--primary-navy);">Daniel Craig</strong>
                <span style="font-size:11.5px; color:var(--text-muted); display:block;">Senior UI Dev</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 9. MY BLOCKERS VIEW (SPEC #11)
  // ==========================================================================
  renderBlockersView() {
    const state = this.store.getState();
    const myBlockers = state.blockers.filter(b => b.assignedEmployee === "Aadarsh");

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">MY BLOCKERS</h1>
          <p class="page-subtitle">Track impediments blocking your deliverables and resolve them with peer assistance.</p>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px; max-width:860px;">
        ${myBlockers.length > 0 ? myBlockers.map(b => `
          <div class="card-section" style="margin-bottom:0; border-left:4px solid ${b.status === 'Resolved' ? 'var(--status-success)' : 'var(--status-danger)'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
              <div>
                <span class="badge ${b.severity === 'High' ? 'badge-danger' : 'badge-warning'}" style="margin-bottom:6px; display:inline-block;">
                  ${b.severity || 'High'} Severity
                </span>
                <h2 style="font-size:18px; font-weight:800; color:var(--primary-navy); margin:0;">
                  ${b.title}
                </h2>
              </div>
              <span class="badge ${b.status === 'Resolved' ? 'badge-success' : 'badge-danger'}">
                ${b.status}
              </span>
            </div>

            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; font-size:13px; background:#F8FAFC; padding:12px 16px; border-radius:var(--radius-sm); margin-bottom:14px; border:1px solid #E2E8F0;">
              <div>
                <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700; display:block;">Task:</span>
                <strong style="color:var(--primary-navy); font-size:14px;">${b.affectedWorkArea || 'Software Integration'}</strong>
              </div>
              <div>
                <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700; display:block;">Status:</span>
                <strong style="color:${b.status === 'Resolved' ? 'var(--status-success)' : 'var(--status-danger)'}; font-size:14px;">${b.status}</strong>
              </div>
              <div>
                <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700; display:block;">Days Active:</span>
                <strong style="color:var(--primary-navy); font-size:14px;">${b.daysActive || 2}</strong>
              </div>
            </div>

            ${b.status !== 'Resolved' ? `
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #F1F5F9; padding-top:12px;">
                <span style="font-size:12.5px; color:var(--text-secondary);">
                  💡 Potential peer assistance available in Collaboration Hub.
                </span>
                <button class="btn btn-sm btn-ai" onclick="window.worknexEmployeeApp.navigateTo('collaboration')">
                  [ REQUEST HELP ]
                </button>
              </div>
            ` : `
              <div style="font-size:12.5px; color:var(--status-success-text); font-weight:600; padding-top:8px;">
                ✓ Blocker resolved through peer collaboration with ${b.resolvedBy || 'Rishabh'}.
              </div>
            `}
          </div>
        `).join("") : `
          <div class="card-section" style="text-align:center; padding:40px;">
            <div style="font-size:28px; margin-bottom:8px;">✓</div>
            <h3 style="font-size:16px; font-weight:700; color:var(--primary-navy); margin-bottom:4px;">No active blockers!</h3>
            <p style="font-size:13px; color:var(--text-muted);">You are unblocked and progressing smoothly.</p>
          </div>
        `}
      </div>
    `;
  }

  // ==========================================================================
  // 10. COLLABORATION HUB (SPEC #5 & #6: MUST WORK BOTH WAYS)
  // ==========================================================================
  renderCollaborationView() {
    const state = this.store.getState();
    const rishabhEmp = state.employees.find(e => e.name === "Rishabh") || { credits: 50 };
    const aadarshEmp = state.employees.find(e => e.name === "Aadarsh") || { credits: 150 };

    // Case A: Another employee has blocked task that Aadarsh can help with
    const rishabhBlocker = state.blockers.find(b => (b.assignedEmployee === "Rishabh" || b.id === "blocker-rishabh-api"));
    const caseACompleted = !rishabhBlocker || rishabhBlocker.status === "Resolved";

    // Case B: Aadarsh has blocked task that someone else can help with
    const aadarshBlocker = state.blockers.find(b => b.assignedEmployee === "Aadarsh");
    const caseBCompleted = !aadarshBlocker || aadarshBlocker.status === "Resolved";

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">COLLABORATION HUB</h1>
          <p class="page-subtitle">Two-way peer assistance matching: Aadarsh can help others, and others can help Aadarsh. Verified credits (+30 pts) are shared with Manager Portal.</p>
        </div>
        <div>
          <button class="btn btn-xs btn-outline" onclick="window.worknexEmployeeApp.resetCollaborationScenario()">
            Reset Live Demo Scenarios
          </button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
        
        <!-- ============================================================== -->
        <!-- CASE A — AADARSH HELPS SOMEONE -->
        <!-- ============================================================== -->
        <div class="card-section" style="border-top:4px solid var(--ai-indigo);">
          <div class="card-section-header" style="margin-bottom:12px;">
            <div>
              <span class="badge badge-ai" style="margin-bottom:4px; display:inline-block;">Case A: You Help Others</span>
              <h2 class="card-section-title">HELP OPPORTUNITY</h2>
            </div>
          </div>

          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Employee:</span>
              <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                <div class="user-avatar" style="width:26px; height:26px; font-size:11px; background:#6366F1; color:#FFFFFF;">RV</div>
                <strong style="color:var(--primary-navy); font-size:15px;">Rishabh</strong>
                <span style="font-size:11.5px; color:var(--text-muted);">Senior Backend Engineer • Team Beta</span>
              </div>
            </div>

            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Task:</span>
              <strong style="color:var(--primary-navy); font-size:14.5px;">API Integration</strong>
            </div>

            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Status:</span>
              <span class="badge ${caseACompleted ? 'badge-success' : 'badge-danger'}">
                ${caseACompleted ? 'Resolved' : 'Blocked'}
              </span>
            </div>

            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Blocker:</span>
              <span style="color:${caseACompleted ? 'var(--status-success)' : 'var(--status-danger)'}; font-weight:700;">
                API Access
              </span>
            </div>

            <div style="border-top:1px dashed #CBD5E1; padding-top:10px; margin-top:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:#6D28D9; display:block;">Why you are seeing this:</span>
              <p style="font-size:13px; color:var(--text-secondary); margin:4px 0 0 0;">
                You have completed similar work (Offline Persistence & State Store Synchronization).
              </p>
            </div>
          </div>

          ${!caseACompleted ? `
            <button 
              class="btn btn-ai" 
              style="width:100%; padding:12px; font-weight:700; font-size:14px;" 
              onclick="window.worknexEmployeeApp.executeOfferHelp()"
            >
              [ OFFER HELP ]
            </button>
          ` : `
            <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:var(--radius-md); padding:14px; text-align:center;">
              <div style="color:#065F46; font-weight:700; font-size:14px; margin-bottom:4px;">
                🎉 Collaboration Completed! (+30 Credits Awarded)
              </div>
              <div style="font-size:12.5px; color:#047857;">
                Reason: <em>"Helped Rishabh resolve API Integration blocker."</em><br>
                Aadarsh credits: <strong>${aadarshEmp.credits || 180} Credits</strong>
              </div>
            </div>
          `}
        </div>

        <!-- ============================================================== -->
        <!-- CASE B — SOMEONE HELPS AADARSH -->
        <!-- ============================================================== -->
        <div class="card-section" style="border-top:4px solid var(--ms-blue);">
          <div class="card-section-header" style="margin-bottom:12px;">
            <div>
              <span class="badge badge-info" style="margin-bottom:4px; display:inline-block;">Case B: Others Help You</span>
              <h2 class="card-section-title">HELP AVAILABLE</h2>
            </div>
          </div>

          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Your task:</span>
              <strong style="color:var(--primary-navy); font-size:14.5px;">Software Integration</strong>
            </div>

            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Your blocker:</span>
              <span style="color:${caseBCompleted ? 'var(--status-success)' : 'var(--status-danger)'}; font-weight:700;">
                API Access
              </span>
            </div>

            <div style="margin-bottom:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); display:block;">Potential helper:</span>
              <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                <div class="user-avatar" style="width:26px; height:26px; font-size:11px; background:#6366F1; color:#FFFFFF;">RV</div>
                <strong style="color:var(--primary-navy); font-size:15px;">Rishabh</strong>
                <span style="font-size:11.5px; color:var(--text-muted);">Team Beta</span>
              </div>
            </div>

            <div style="border-top:1px dashed #CBD5E1; padding-top:10px; margin-top:10px;">
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:#0078D4; display:block;">Rishabh has completed:</span>
              <p style="font-size:13px; color:var(--text-secondary); margin:4px 0 0 0;">
                Software Integration (Token Exchange Bridge in Team Beta).
              </p>
            </div>
          </div>

          ${!caseBCompleted ? `
            ${!this.caseBRequested ? `
              <button 
                class="btn btn-primary" 
                style="width:100%; padding:12px; font-weight:700; font-size:14px;" 
                onclick="window.worknexEmployeeApp.executeRequestHelp()"
              >
                [ REQUEST HELP ]
              </button>
            ` : `
              <div style="display:flex; flex-direction:column; gap:10px;">
                <div style="background:#EFF6FC; border:1px solid #C7E0F4; border-radius:var(--radius-md); padding:10px; font-size:12.5px; color:#0078D4; text-align:center;">
                  ✓ Help request dispatched to Rishabh's Employee Portal.
                </div>
                <button 
                  class="btn btn-success" 
                  style="width:100%; padding:12px; font-weight:700; font-size:14px;" 
                  onclick="window.worknexEmployeeApp.executeRishabhAcceptsHelp()"
                >
                  🤝 Rishabh Accepts & Helps Resolve Blocker (+30 to Rishabh)
                </button>
              </div>
            `}
          ` : `
            <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:var(--radius-md); padding:14px; text-align:center;">
              <div style="color:#065F46; font-weight:700; font-size:14px; margin-bottom:4px;">
                ✓ Blocker Marked Resolved via Rishabh's Help
              </div>
              <div style="font-size:12.5px; color:#047857;">
                Rishabh awarded: <strong>+30 Credits</strong> (Total: <strong>${rishabhEmp.credits || 80} Credits</strong>)<br>
                Reason: <em>"+30 — Helped Aadarsh resolve Software Integration blocker"</em>.<br>
                <strong>Avni's Manager Portal reflects this exact credit in real time.</strong>
              </div>
            </div>
          `}
        </div>

      </div>
    `;
  }

  // Action for Case A
  executeOfferHelp() {
    const result = this.store.aadarshHelpsRishabh("API Integration", "API Access", 30);
    this.showToast(`🎉 Awarded +30 Credits! Helped Rishabh resolve API Integration blocker.`, "success");
    this.render();
  }

  // Action for Case B (Requesting help)
  executeRequestHelp() {
    this.caseBRequested = true;
    this.showToast("Help request sent to Rishabh. Awaiting peer response.", "info");
    this.render();
  }

  // Action for Case B (Rishabh completes assistance)
  executeRishabhAcceptsHelp() {
    const result = this.store.rishabhHelpsAadarsh("Software Integration", "API Access", 30);
    this.caseBRequested = false;
    this.showToast("Blocker resolved! Rishabh received +30 Credits in shared Worknex state.", "success");
    this.render();
  }

  resetCollaborationScenario() {
    this.store.resetCollaborationDemo();
    this.caseBRequested = false;
    this.showToast("Reset collaboration scenario for demo.", "info");
    this.render();
  }

  // ==========================================================================
  // 11. MY CREDITS VIEW (SPEC #4 & #6: SHARED SINGLE SOURCE OF TRUTH)
  // ==========================================================================
  renderCreditsView() {
    const state = this.store.getState();
    const aadarshEmp = state.employees.find(e => e.name === "Aadarsh") || { credits: 150 };
    // STRICT REQUIREMENT 4: Aadarsh can see ONLY his own credits!
    const myCredits = state.employeeCredits.filter(c => c.employee === "Aadarsh");

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">MY CREDITS</h1>
          <p class="page-subtitle">Personal verified peer collaboration records. Credits are non-competitive, transparent, and verified across both portals.</p>
        </div>
      </div>

      <div style="max-width:860px;">
        <!-- Total Credits Card -->
        <div class="card-section" style="background:linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border:1px solid #F59E0B; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:12px; font-weight:800; text-transform:uppercase; color:#92400E; letter-spacing:0.5px;">Total Credits</span>
              <div style="font-size:36px; font-weight:800; color:#78350F; line-height:1.2; margin-top:2px;">
                🏆 ${aadarshEmp.credits || 150}
              </div>
              <span style="font-size:12.5px; color:#92400E;">Validated peer assistance rewards</span>
            </div>
            <div style="font-size:42px;">💎</div>
          </div>
        </div>

        <!-- Credit History -->
        <div class="card-section">
          <h2 class="card-section-title" style="margin-bottom:16px;">Credit History</h2>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${myCredits.map(item => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:var(--radius-md);">
                <div style="display:flex; align-items:center; gap:14px;">
                  <span class="badge badge-ai" style="font-size:14px; font-weight:800; padding:6px 12px;">
                    ${item.change || '+30'}
                  </span>
                  <div>
                    <strong style="color:var(--primary-navy); font-size:14px; display:block;">
                      ${item.reason}
                    </strong>
                    <span style="font-size:11.5px; color:var(--text-muted);">${item.date || '29 Sept 2026'} • Verified Activity</span>
                  </div>
                </div>
                <span class="badge badge-success" style="font-size:11px;">Validated</span>
              </div>
            `).join("")}
          </div>
        </div>

      </div>
    `;
  }

  // ==========================================================================
  // 12. MY ACHIEVEMENTS VIEW (SPEC #13: PROFESSIONAL CARDS)
  // ==========================================================================
  renderAchievementsView() {
    const state = this.store.getState();
    const myAchievements = state.employeeAchievements ? state.employeeAchievements.filter(a => a.employee === "Aadarsh") : [];

    const defaultAchievements = [
      {
        achievement: "Backend Milestone Completed",
        project: "Microsoft Hackathon",
        date: "20 September 2026",
        description: "Delivered high-throughput asynchronous payload pipeline on schedule with zero breaking API changes."
      },
      {
        achievement: "Collaboration Achievement",
        project: "Cross-Team Unblocking",
        date: "18 September 2026",
        description: "Helped resolve API Integration blocker for peer backend engineer."
      }
    ];

    const displayAchievements = myAchievements.length > 0 ? myAchievements : defaultAchievements;

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">MY ACHIEVEMENTS</h1>
          <p class="page-subtitle">Historical engineering accomplishments and validated deliverables.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:20px; max-width:900px;">
        ${displayAchievements.map(ach => `
          <div class="card-section" style="margin-bottom:0; border-top:3px solid var(--status-success);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <span class="badge badge-success">✓ Milestone</span>
              <span style="font-size:12px; color:var(--text-muted);">${ach.date}</span>
            </div>

            <h3 style="font-size:16px; font-weight:700; color:var(--primary-navy); margin-bottom:6px;">
              ✓ ${ach.achievement || ach.title}
            </h3>

            <div style="font-size:12.5px; color:var(--text-secondary); margin-bottom:10px;">
              <strong>Project:</strong> ${ach.project}
            </div>

            <p style="font-size:13px; color:var(--text-muted); margin:0;">
              ${ach.description || 'Deliverable validated and verified.'}
            </p>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 13. NOTIFICATIONS VIEW (SPEC #14: STRICTLY EMPLOYEE-RELEVANT CATEGORIES)
  // ==========================================================================
  renderNotificationsView() {
    const employeeNotifications = [
      {
        id: "notif-1",
        title: "Daily update reminder",
        message: "Please remember to submit your voluntary asynchronous daily update before end of sprint day.",
        timestamp: "Today, 09:00 AM",
        badge: "Reminder",
        badgeColor: "#0078D4"
      },
      {
        id: "notif-2",
        title: "Task deadline reminder",
        message: "Task 'Fix API' has a scheduled delivery milestone on 20 September 2026.",
        timestamp: "Today, 10:30 AM",
        badge: "Deadline",
        badgeColor: "#F59E0B"
      },
      {
        id: "notif-3",
        title: "Overdue task reminder",
        message: "Deliverable 'Fix API' is currently marked Incomplete and requires status update.",
        timestamp: "Yesterday, 04:15 PM",
        badge: "Overdue",
        badgeColor: "#EF4444"
      },
      {
        id: "notif-4",
        title: "Someone requesting his help",
        message: "Rishabh (Team Beta) has an active blocker on API Integration and could benefit from your expertise.",
        timestamp: "Today, 11:00 AM",
        badge: "Help Request",
        badgeColor: "#8B5CF6"
      },
      {
        id: "notif-5",
        title: "Someone offering help",
        message: "Rishabh is available in Collaboration Hub to help resolve your 'API Access' blocker.",
        timestamp: "Today, 11:30 AM",
        badge: "Help Available",
        badgeColor: "#6366F1"
      },
      {
        id: "notif-6",
        title: "Credits earned",
        message: "You have verified collaboration credits recorded in your profile. Current total: 150 Credits.",
        timestamp: "18 Sept 2026",
        badge: "Credits",
        badgeColor: "#10B981"
      },
      {
        id: "notif-7",
        title: "Meeting invitation",
        message: "Automatic Collaboration Meeting scheduled for 'API Access' with Team Alpha and Team Gamma.",
        timestamp: "Today, 02:00 PM",
        badge: "Meeting",
        badgeColor: "#0284C7"
      },
      {
        id: "notif-8",
        title: "Blocker resolution notification",
        message: "Peer collaboration unblocking flow is active. Resolve blockers together.",
        timestamp: "Yesterday",
        badge: "Resolution",
        badgeColor: "#10B981"
      }
    ];

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">NOTIFICATIONS</h1>
          <p class="page-subtitle">Your personal notifications, reminders, peer help requests, and meeting invites.</p>
        </div>
      </div>

      <div style="max-width:820px; display:flex; flex-direction:column; gap:12px;">
        ${employeeNotifications.map(n => `
          <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:var(--radius-md); padding:16px; display:flex; justify-content:space-between; align-items:flex-start; box-shadow:var(--shadow-sm);">
            <div style="display:flex; gap:14px; align-items:flex-start;">
              <span class="badge" style="background:${n.badgeColor}15; color:${n.badgeColor}; border:1px solid ${n.badgeColor}40; margin-top:2px;">
                ${n.badge}
              </span>
              <div>
                <strong style="color:var(--primary-navy); font-size:14.5px; display:block; margin-bottom:2px;">
                  ${n.title}
                </strong>
                <p style="font-size:13px; color:var(--text-secondary); margin:0;">
                  ${n.message}
                </p>
              </div>
            </div>
            <span style="font-size:11.5px; color:var(--text-muted); white-space:nowrap; margin-left:12px;">
              ${n.timestamp}
            </span>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 14. TASK UPDATE MODAL (SPEC #8: PRIORITY IS STRICTLY READ-ONLY)
  // ==========================================================================
  renderTaskUpdateModal() {
    if (!this.activeTaskModal) return "";
    const task = this.store.getState().tasks.find(t => t.id === this.activeTaskModal);
    if (!task) return "";

    return `
      <div class="modal-backdrop" onclick="window.worknexEmployeeApp.closeTaskModal()">
        <div class="modal-card" style="max-width:500px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">UPDATE TASK STATUS</h2>
              <p class="modal-subtitle">${task.workArea} • Assigned to Aadarsh</p>
            </div>
            <button class="modal-close-btn" onclick="window.worknexEmployeeApp.closeTaskModal()">✕</button>
          </div>

          <form onsubmit="event.preventDefault(); window.worknexEmployeeApp.saveTaskModal('${task.id}')">
            
            <!-- SPEC #8: READ-ONLY PRIORITY -->
            <div class="login-form-group" style="margin-bottom:16px;">
              <label class="login-label">PRIORITY (READ-ONLY)</label>
              <div style="display:flex; align-items:center; gap:8px; padding:10px 14px; background:#F1F5F9; border-radius:var(--radius-md); border:1px solid #E2E8F0;">
                <span class="badge ${task.priority === 'High' ? 'badge-danger' : (task.priority === 'Medium' ? 'badge-info' : 'badge-neutral')}">
                  ${task.priority || 'High'}
                </span>
                <span style="font-size:12px; color:var(--text-muted);">
                  🔒 Priority is assigned by Manager / Team Lead workflow and cannot be modified.
                </span>
              </div>
            </div>

            <div class="login-form-group" style="margin-bottom:16px;">
              <label class="login-label" for="task-modal-status">STATUS</label>
              <select id="task-modal-status" class="login-input" style="padding:10px 14px;">
                <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Blocked" ${task.status === 'Blocked' ? 'selected' : ''}>Blocked</option>
                <option value="Incomplete" ${task.status === 'Incomplete' ? 'selected' : ''}>Incomplete</option>
              </select>
            </div>

            <div class="login-form-group" style="margin-bottom:16px;">
              <label class="login-label" for="task-modal-progress">PROGRESS (${task.progress}%)</label>
              <input 
                type="range" 
                id="task-modal-progress" 
                min="0" 
                max="100" 
                value="${task.progress}" 
                style="width:100%; accent-color:var(--ms-blue);" 
                oninput="document.getElementById('task-modal-progress-val').textContent = this.value + '%'"
              />
              <span id="task-modal-progress-val" style="font-size:13px; font-weight:700; color:var(--ms-blue); display:block; text-align:right;">
                ${task.progress}%
              </span>
            </div>

            <div class="login-form-group" style="margin-bottom:24px;">
              <label class="login-label" for="task-modal-blocker">BLOCKER</label>
              <input 
                type="text" 
                id="task-modal-blocker" 
                class="login-input" 
                value="${task.blocker && task.blocker !== 'None' ? task.blocker : ''}" 
                placeholder="Enter blocker (e.g. API Access) or leave blank if none"
              />
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button type="button" class="btn btn-sm btn-outline" onclick="window.worknexEmployeeApp.closeTaskModal()">Cancel</button>
              <button type="submit" class="btn btn-sm btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  openTaskUpdateModal(taskId) {
    this.activeTaskModal = taskId;
    this.render();
  }

  closeTaskModal() {
    this.activeTaskModal = null;
    this.render();
  }

  saveTaskModal(taskId) {
    const status = document.getElementById("task-modal-status").value;
    const progress = document.getElementById("task-modal-progress").value;
    const blockerVal = (document.getElementById("task-modal-blocker").value || "").trim();
    const blocker = blockerVal.length > 0 ? blockerVal : "None";

    this.store.updateTaskStatus(taskId, status, progress, blocker);
    this.activeTaskModal = null;
    this.showToast("Task status updated.", "success");
    this.render();
  }

  // ==========================================================================
  // 15. TOAST NOTIFICATIONS
  // ==========================================================================
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:16px;">${type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️')}</span>
        <span style="font-size:13.5px; font-weight:600; color:var(--primary-navy);">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  bindViewEvents() {
    // DOM binding helpers
  }
}

// Global employee app instance
window.worknexEmployeeApp = new WorknexEmployeeApp(window.worknexStore);
