/**
 * WORKNEX Enterprise Application Controller
 * Microsoft Global Hackathon Prototype
 * "Less status chasing. More progress."
 *
 * Exclusively implements the MANAGER MODULE for Avni.
 * Strict Manager-Scope: View-only telemetry, decisions, alerts.
 * No employee forms, no task creation/assignment, no collaboration hub.
 */

class WorknexApp {
  constructor(store, charts, demoController, aiEngine) {
    this.store = store;
    this.charts = charts;
    this.demoController = demoController;
    this.aiEngine = aiEngine;

    this.currentRoute = "dashboard";
    this.searchQuery = "";
    this.taskFilterTeam = "all";
    this.taskFilterStatus = "all";
    this.taskFilterBlocker = "all";
    this.taskSort = "deadline";
    this.blockerFilterSeverity = "all";
    this.blockerFilterTeam = "all";
    this.notifFilterTab = "all";

    this.flowAiMessages = [];

    this.init();
  }

  init() {
    // Initial subscriber
    this.store.subscribe(() => {
      this.render();
    });

    // Hash routing
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "") || "dashboard";

      // Role-based protection: if authenticated as Employee, block all Manager routes
      if (this.store.activeRole === "employee") {
        if (!hash.startsWith("employee") && !hash.startsWith("emp") && hash !== "start") {
          this.showToast("Access Denied: Aadarsh is not authorized to access Manager Portal.", "error");
          window.location.hash = "#employee/dashboard";
          return;
        }
        if (window.worknexEmployeeApp) {
          const subRoute = hash.replace("employee/", "").replace("employee", "") || "dashboard";
          window.worknexEmployeeApp.navigateTo(subRoute, false);
          return;
        }
      }

      // If authenticated as Manager, keep in Manager Portal
      if (this.store.activeRole === "manager") {
        if (hash.startsWith("employee") || hash.startsWith("emp")) {
          this.showToast("You are signed in as Manager (Avni).", "info");
          window.location.hash = "#dashboard";
          return;
        }
      }

      // If unauthenticated, allow routing between start, manager-login, and employee-login
      if (!this.store.isManagerAuthenticated && !this.store.isEmployeeAuthenticated) {
        this.render();
        return;
      }

      this.navigateTo(hash, false);
    });

    // Keyboard shortcuts: Ctrl+K for search, Escape to close modals
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.openGlobalSearch();
      }
      if (e.key === "Escape") {
        this.closeAllModals();
        this.closeFlowAIDrawer();
        this.closeDemoDrawer();
      }
    });

    // Initial render check
    const initialHash = window.location.hash.replace("#", "");
    if (this.store.activeRole === "employee") {
      if (window.worknexEmployeeApp) {
        const subRoute = initialHash.replace("employee/", "").replace("employee", "") || "dashboard";
        window.worknexEmployeeApp.navigateTo(subRoute, false);
        return;
      }
    } else if (initialHash && !initialHash.startsWith("employee")) {
      this.currentRoute = initialHash;
    }
    this.render();
  }

  navigateTo(route, updateHash = true) {
    if (this.store.activeRole === "employee") {
      if (window.worknexEmployeeApp) {
        const subRoute = route.replace("employee/", "").replace("employee", "") || "dashboard";
        window.worknexEmployeeApp.navigateTo(subRoute, updateHash);
      }
      return;
    }

    if (route.startsWith("employee") || route.startsWith("emp")) {
      if (this.store.activeRole === "manager") {
        this.showToast("You are signed in as Manager (Avni).", "info");
        window.location.hash = "#dashboard";
        return;
      }
    }

    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = `#${route}`;
    }
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // If navigated to reports, render charts after DOM paint
    if (route === "reports") {
      setTimeout(() => this.renderAllCharts(), 60);
    }
  }

  render() {
    const root = document.getElementById("app-root");
    if (!root) return;

    // Role Route Protection: Employee Portal
    if (this.store.activeRole === "employee") {
      const hash = window.location.hash.replace("#", "");
      if (hash && !hash.startsWith("employee") && !hash.startsWith("emp") && hash !== "start") {
        this.showToast("Access Denied: Aadarsh is not authorized to access Manager Portal.", "error");
        window.location.hash = "#employee/dashboard";
      }
      if (window.worknexEmployeeApp) {
        window.worknexEmployeeApp.render();
        return;
      }
    }

    // Unauthenticated: Start Page or Separate Login Pages
    if (!this.store.isManagerAuthenticated) {
      const hash = window.location.hash.replace("#", "");
      if (hash === "manager-login") {
        root.innerHTML = this.renderManagerLoginPage();
        this.bindLoginEvents();
        return;
      } else if (hash === "employee-login") {
        if (window.worknexEmployeeApp) {
          root.innerHTML = window.worknexEmployeeApp.renderLoginPage();
          window.worknexEmployeeApp.bindLoginEvents();
          return;
        }
      }
      root.innerHTML = this.renderStartPage();
      return;
    }

    // Manager Portal Mount
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

      <!-- Modals -->
      ${this.renderModals()}

      <!-- FlowAI Assistant Drawer & Floating Button -->
      ${this.renderFlowAIComponents()}

      <!-- Demo Mode Quick Drawer -->
      ${this.renderDemoDrawer()}

      <!-- Toast Container -->
      <div id="toast-container"></div>
    `;

    this.bindGlobalEvents();

    // After DOM rendered, if in dashboard or reports, trigger canvas charts
    if (this.currentRoute === "dashboard") {
      setTimeout(() => {
        const state = this.store.getState();
        this.charts.renderProjectHealthDonut("dashboard-health-canvas", state.weeklyReports.taskHealthDistribution);
      }, 50);
    } else if (this.currentRoute === "reports") {
      setTimeout(() => this.renderAllCharts(), 50);
    }
  }

  // ==========================================================================
  // START PAGE (SPEC #1: TWO COMPLETELY SEPARATE LOGIN EXPERIENCES)
  // ==========================================================================
  renderStartPage() {
    return `
      <div class="start-page-container">
        <div class="start-page-hero">
          <div class="brand-logo-icon" style="width:52px; height:52px; background:#0078D4; margin:0 auto 16px; border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(0,120,212,0.35);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4l5 16 4-10 4 10 5-16"/>
            </svg>
          </div>
          <h1 style="font-size:32px; font-weight:800; color:#FFFFFF; margin-bottom:8px; letter-spacing:-0.5px;">WORKNEX</h1>
          <p style="font-size:16px; color:#94A3B8; margin-bottom:12px; font-style:italic;">"Less status chasing. More progress."</p>
          <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); padding:6px 16px; border-radius:999px; font-size:12.5px; color:#E2E8F0; margin-bottom:32px;">
            <span>🏆 Microsoft Global Hackathon</span>
            <span style="opacity:0.4;">•</span>
            <span>Role-Based Progress Intelligence</span>
          </div>
        </div>

        <div class="start-portals-grid">
          <!-- MANAGER LOGIN OPTION -->
          <div class="portal-choice-card">
            <div class="portal-choice-header">
              <span class="portal-choice-badge" style="background:#EFF6FC; color:#0078D4; border-color:#C7E0F4;">
                Management & Oversight
              </span>
              <div class="portal-choice-icon" style="background:#0F172A; color:#60A5FA;">
                👔
              </div>
            </div>
            <h2 class="portal-choice-title">MANAGER LOGIN</h2>
            <p class="portal-choice-desc">
              Sprint health telemetry, recurring blocker triage, leave coverage planning, and FlowAI zero-hallucination source attribution.
            </p>
            <div class="portal-choice-demo">
              <span class="portal-demo-label">Manager Demo Persona:</span>
              <div class="portal-demo-user">
                <div class="user-avatar" style="width:28px; height:28px; font-size:11px; background:#0F172A; color:#FFFFFF;">AV</div>
                <div>
                  <strong>Name: Avni</strong>
                  <span style="display:block; font-size:11.5px; color:#64748B;">avni@worknex.demo • Manager@123</span>
                </div>
              </div>
            </div>
            <a href="#manager-login" class="login-btn-primary" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:auto;">
              <span>Sign In as Manager</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>

          <!-- EMPLOYEE LOGIN OPTION -->
          <div class="portal-choice-card">
            <div class="portal-choice-header">
              <span class="portal-choice-badge" style="background:#F5F3FF; color:#7C3AED; border-color:#DDD6FE;">
                Contributor & Peer Hub
              </span>
              <div class="portal-choice-icon" style="background:#1E293B; color:#A78BFA;">
                💻
              </div>
            </div>
            <h2 class="portal-choice-title">EMPLOYEE LOGIN</h2>
            <p class="portal-choice-desc">
              Voluntary daily update forms, personal to-do list, Team Alpha progress, two-way collaboration hub, and non-competitive credits.
            </p>
            <div class="portal-choice-demo">
              <span class="portal-demo-label">Employee Demo Persona:</span>
              <div class="portal-demo-user">
                <div class="user-avatar" style="width:28px; height:28px; font-size:11px; background:#0078D4; color:#FFFFFF;">AP</div>
                <div>
                  <strong>Name: Aadarsh</strong>
                  <span style="display:block; font-size:11.5px; color:#64748B;">aadarsh@worknex.demo • Employee@123</span>
                </div>
              </div>
            </div>
            <a href="#employee-login" class="login-btn-primary" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:auto; background:linear-gradient(135deg, #0078D4 0%, #2563EB 100%);">
              <span>Sign In as Employee</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // MANAGER LOGIN PAGE (SEPARATE LOGIN EXPERIENCE)
  // ==========================================================================
  renderManagerLoginPage() {
    return `
      <div class="login-container">
        <div class="login-card">
          <div class="login-brand">
            <div class="brand-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4l5 16 4-10 4 10 5-16"/>
              </svg>
            </div>
            <h1 class="login-title">WORKNEX</h1>
            <p class="login-tagline">"Less status chasing. More progress."</p>
            <span class="portal-badge">Manager Portal</span>
          </div>

          <div id="login-error" class="login-error-alert">
            Invalid credentials. Please try again.
          </div>

          <form id="manager-login-form" onsubmit="event.preventDefault(); window.worknexApp.handleLogin();">
            <div class="login-form-group">
              <label class="login-label" for="login-email">Email / Manager ID</label>
              <div class="login-input-wrapper">
                <input 
                  type="email" 
                  id="login-email" 
                  class="login-input" 
                  placeholder="avni@worknex.demo" 
                  value="avni@worknex.demo" 
                  required 
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="login-form-group">
              <label class="login-label" for="login-password">Password</label>
              <div class="login-input-wrapper">
                <input 
                  type="password" 
                  id="login-password" 
                  class="login-input" 
                  placeholder="Enter password" 
                  value="Manager@123" 
                  required 
                  autocomplete="current-password"
                />
                <button type="button" class="password-toggle-btn" id="pwd-toggle-btn" title="Toggle password visibility">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div class="login-footer-actions" style="margin-bottom: 20px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary); cursor:pointer;">
                <input type="checkbox" id="remember-me" checked style="accent-color:var(--ms-blue);">
                Remember Manager session
              </label>
            </div>

            <button type="submit" class="login-btn-primary">
              Sign In to Manager Portal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </form>

          <div class="login-demo-helper">
            <strong>Manager Demo Credentials:</strong><br>
            Name: <code style="color:var(--ms-blue); font-weight:700;">Avni</code><br>
            Email: <code style="color:var(--ms-blue); font-weight:600;">avni@worknex.demo</code><br>
            Password: <code style="color:var(--ms-blue); font-weight:600;">Manager@123</code>
          </div>

          <div style="margin-top:16px; padding-top:14px; border-top:1px solid #E2E8F0; text-align:center;">
            <a href="#start" style="display:inline-flex; align-items:center; gap:6px; color:var(--text-muted); font-size:13px; text-decoration:none;">
              ← Back to Portal Selection
            </a>
          </div>
        </div>
      </div>
    `;
  }

  bindLoginEvents() {
    const toggleBtn = document.getElementById("pwd-toggle-btn");
    const pwdInput = document.getElementById("login-password");
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
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errBox = document.getElementById("login-error");

    const result = this.store.loginManager(email, password);
    if (result.success) {
      if (errBox) errBox.style.display = "none";
      this.showToast("Welcome back, Avni. Manager Portal initialized.", "success");
      this.navigateTo("dashboard");
    } else {
      if (errBox) {
        errBox.textContent = result.message || "Invalid credentials. Please try again.";
        errBox.style.display = "block";
      }
    }
  }

  showForgotPassword() {
    alert("WORKNEX Hackathon Demo:\n\nUse demo manager credentials:\nEmail: avni@worknex.demo\nPassword: Manager@123\n\nClick 'Sign In to Manager Portal' to proceed.");
  }

  // ==========================================================================
  // 2. SIDEBAR
  // ==========================================================================
  renderSidebar() {
    const state = this.store.getState();
    const activeBlockersCount = state.blockers.filter(b => b.status === "Unresolved").length;
    const unreadNotifs = state.notifications.filter(n => n.unread).length;

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>` },
      { id: "teams", label: "Teams", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`, badge: state.teams.length },
      { id: "projects", label: "Projects", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`, badge: state.projects.length },
      { id: "tasks", label: "Tasks", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`, badge: state.tasks.length },
      { id: "blockers", label: "Blockers", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`, badge: activeBlockersCount, isDanger: true },
      { id: "reports", label: "Reports", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>` },
      { id: "achievements", label: "Achievements", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>` },
      { id: "credits", label: "Employee Credits", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>` },
      { id: "notifications", label: "Notifications", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`, badge: unreadNotifs > 0 ? unreadNotifs : null },
      { id: "activity", label: "Activity Log", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` },
      { id: "settings", label: "Settings", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>` }
    ];

    return `
      <aside class="app-sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo-icon" style="width:34px; height:34px; border-radius:8px; margin-bottom:0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4l5 16 4-10 4 10 5-16"/>
            </svg>
          </div>
          <div class="brand-text-block">
            <span class="brand-name">WORKNEX</span>
            <span class="brand-tagline-mini">Less status chasing. More progress.</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <a 
              href="#${item.id}" 
              class="sidebar-nav-item ${this.currentRoute === item.id ? 'active' : ''}"
              onclick="event.preventDefault(); window.worknexApp.navigateTo('${item.id}');"
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

          <div style="margin-top: auto; padding-top: 12px;">
            <a 
              href="#privacy" 
              class="sidebar-nav-item ${this.currentRoute === 'privacy' ? 'active' : ''}"
              onclick="event.preventDefault(); window.worknexApp.navigateTo('privacy');"
              style="font-size: 12.5px; opacity: 0.85;"
            >
              <div class="nav-item-left">
                <span class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </span>
                <span>Privacy & Boundaries</span>
              </div>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user-pill">
            <div class="user-pill-info">
              <div class="user-avatar" style="background:#0F172A; border:1px solid #334155;">AV</div>
              <div class="user-details-text">
                <span class="user-name-label">Avni</span>
                <span class="user-role-label">Manager</span>
              </div>
            </div>
            <button class="btn-signout-icon" onclick="window.worknexApp.handleLogout()" title="Sign Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  // ==========================================================================
  // 3. TOP NAVIGATION
  // ==========================================================================
  renderTopNav() {
    const state = this.store.getState();
    const selectedProject = state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0];
    const unreadCount = state.notifications.filter(n => n.unread).length;

    return `
      <header class="app-top-nav">
        <div class="top-nav-left">
          <!-- Global Search Trigger -->
          <div class="top-search-bar" onclick="window.worknexApp.openGlobalSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" color="#64748B">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="top-search-input" placeholder="Search projects, teams, blockers, credits..." readonly />
            <kbd class="search-shortcut-kbd">Ctrl K</kbd>
          </div>

          <!-- Project Selector -->
          <div class="project-selector-wrapper">
            <select class="filter-select" onchange="window.worknexApp.handleProjectChange(this.value)" style="font-weight:600; color:var(--primary-navy); border-color:#CBD5E1;">
              ${state.projects.map(p => `
                <option value="${p.id}" ${p.id === selectedProject.id ? 'selected' : ''}>
                  📁 ${p.name}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="top-nav-right">
          <!-- Switch to Employee Portal Button -->
          <button 
            class="btn btn-xs btn-outline" 
            onclick="window.worknexApp.switchToEmployee()"
            style="display:flex; align-items:center; gap:6px; font-weight:600; color:var(--primary-navy); border-color:#CBD5E1; margin-right:8px;"
            title="Open Employee Portal for Aadarsh"
          >
            <span>Switch to Employee Portal (Aadarsh)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          <!-- Hackathon Demo Mode Launcher -->
          <button class="demo-mode-trigger-btn" onclick="window.worknexApp.toggleDemoDrawer()" title="Hackathon Simulation Controls">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <span>Demo Mode</span>
          </button>

          <!-- Notification Bell -->
          <button class="icon-btn-badge" onclick="window.worknexApp.navigateTo('notifications')" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            ${unreadCount > 0 ? `<span class="badge-dot"></span>` : ''}
          </button>

          <!-- Avni Profile -->
          <div class="top-user-menu" onclick="window.worknexApp.navigateTo('settings')">
            <div class="top-user-avatar">AV</div>
            <span class="top-user-name">Avni</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" color="#64748B"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </header>
    `;
  }

  handleProjectChange(projectId) {
    this.store.selectProject(projectId);
    this.showToast(`Switched active view to ${projectId}`, "info");
  }

  handleLogout() {
    this.store.logoutManager();
    window.location.hash = "#start";
    this.showToast("Signed out of Manager Portal.", "info");
    this.render();
  }

  // ==========================================================================
  // 4. CURRENT VIEW ROUTER
  // ==========================================================================
  renderCurrentView() {
    switch (this.currentRoute) {
      case "dashboard":
        return this.renderDashboardView();
      case "teams":
        return this.renderTeamsView();
      case "projects":
        return this.renderProjectsView();
      case "tasks":
        return this.renderTasksView();
      case "blockers":
        return this.renderBlockersView();
      case "reports":
        return this.renderReportsView();
      case "achievements":
        return this.renderAchievementsView();
      case "credits":
        return this.renderCreditsView();
      case "notifications":
        return this.renderNotificationsView();
      case "activity":
        return this.renderActivityView();
      case "settings":
        return this.renderSettingsView();
      case "privacy":
        return this.renderPrivacyView();
      default:
        return this.renderDashboardView();
    }
  }

  // ==========================================================================
  // 5. MANAGER DASHBOARD VIEW
  // ==========================================================================
  renderDashboardView() {
    const state = this.store.getState();
    const recurringBlocker = state.blockers.find(b => b.isRecurring && !b.dismissedAlert);
    const silentDelay = state.silentDelays[0];
    const suggestedMeeting = state.suggestedMeetings.find(m => m.status === "Suggested" || m.status === "Created");
    const leaveReassign = state.leaveReassignments.find(r => r.statusState === "Pending Approval");

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Good morning, Avni</h1>
          <p class="page-subtitle">Here's your project overview for today.</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <span style="font-size:12.5px; color:var(--text-muted); font-weight:500;">Active Sprint:</span>
          <span class="badge badge-info">Microsoft Hackathon • Sprint W4</span>
        </div>
      </div>

      <!-- CRITICAL RECURRING BLOCKER RED FLAG ALERT (SPEC #10) -->
      ${recurringBlocker ? `
        <div class="alert-banner critical-red">
          <div class="alert-banner-left">
            <div class="alert-icon-box">🔴</div>
            <div>
              <div class="alert-title-main" style="color:var(--status-danger-text);">
                RED FLAG: Recurring Blocker Detected
                <span class="badge badge-danger">3 Consecutive Days</span>
              </div>
              <div class="alert-desc-text">
                <strong>Blocker:</strong> ${recurringBlocker.title} &nbsp;•&nbsp; 
                <strong>Affected Team:</strong> ${recurringBlocker.team} &nbsp;•&nbsp; 
                <strong>Work Area:</strong> ${recurringBlocker.affectedWorkArea}
              </div>
            </div>
          </div>
          <div class="alert-actions-group">
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.openSourceModal('${recurringBlocker.sourceUpdateId || "digest-2"}')">View Source</button>
            <button class="btn btn-sm btn-danger" onclick="window.worknexApp.navigateTo('blockers')">View Blocker</button>
          </div>
        </div>
      ` : ''}

      <!-- SILENT DELAY ALERT (SPEC #11) -->
      ${silentDelay ? `
        <div class="alert-banner warning-orange">
          <div class="alert-banner-left">
            <div class="alert-icon-box">⏳</div>
            <div>
              <div class="alert-title-main" style="color:var(--status-warning-text);">
                SILENT DELAY DETECTED
                <span class="badge badge-warning">Duration: ${silentDelay.durationDays} Days</span>
              </div>
              <div class="alert-desc-text">
                <strong>Team:</strong> ${silentDelay.team} &nbsp;•&nbsp; 
                <strong>Work Area:</strong> ${silentDelay.workArea} &nbsp;•&nbsp; 
                <strong>Status:</strong> ${silentDelay.status} &nbsp;•&nbsp; 
                <strong>Last Update:</strong> ${silentDelay.lastUpdateDate}
              </div>
            </div>
          </div>
          <div class="alert-actions-group">
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.openSilentDelayModal()">Review</button>
          </div>
        </div>
      ` : ''}

      <!-- COLLABORATION MEETING SUGGESTED ALERT (SPEC #14) -->
      ${suggestedMeeting ? `
        <div class="alert-banner ai-purple">
          <div class="alert-banner-left">
            <div class="alert-icon-box">🤝</div>
            <div>
              <div class="alert-title-main" style="color:#6D28D9;">
                ${suggestedMeeting.status === 'Created' ? 'COLLABORATION MEETING SCHEDULED' : 'COLLABORATION MEETING SUGGESTED'}
                <span class="badge badge-ai">${suggestedMeeting.status === 'Created' ? 'Teams Sync Active' : 'Cross-Team Blocker'}</span>
              </div>
              <div class="alert-desc-text">
                <strong>Issue:</strong> ${suggestedMeeting.issue} &nbsp;•&nbsp; 
                <strong>Affected Members:</strong> ${suggestedMeeting.affectedMembersCount} &nbsp;•&nbsp; 
                <strong>Affected Teams:</strong> ${suggestedMeeting.affectedTeams.join(", ")}
              </div>
            </div>
          </div>
          <div class="alert-actions-group">
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.store.dismissMeeting('${suggestedMeeting.id}')">Dismiss</button>
            ${suggestedMeeting.status === 'Created' ? `
              <button class="btn btn-sm btn-outline" style="background:#FFFFFF; color:#6D28D9; border-color:#DDD6FE;" onclick="window.worknexApp.openMeetingModal()">View Meeting</button>
              <button class="btn btn-sm btn-ai" id="btn-generate-meeting" onclick="window.worknexApp.resetMeetingAndOpen()">Generate Meeting</button>
            ` : `
              <button class="btn btn-sm btn-ai" id="btn-generate-meeting" onclick="window.worknexApp.openMeetingModal()">Generate Meeting</button>
            `}
          </div>
        </div>
      ` : ''}

      <!-- LEAVE & WORK REASSIGNMENT ALERT (SPEC #15) -->
      ${leaveReassign ? `
        <div class="alert-banner warning-orange" style="background:#FFFDF5; border-color:#CBD5E1;">
          <div class="alert-banner-left">
            <div class="alert-icon-box" style="background:#E2E8F0; color:#475569;">👤</div>
            <div>
              <div class="alert-title-main" style="color:var(--primary-navy);">
                Employee On Leave — Reassignment Suggested
              </div>
              <div class="alert-desc-text">
                <strong>Employee:</strong> ${leaveReassign.employee} (Status: On Leave) &nbsp;•&nbsp; 
                <strong>Affected Work:</strong> ${leaveReassign.affectedWork} &nbsp;•&nbsp; 
                <strong>Suggested:</strong> Reassign to ${leaveReassign.suggestedAssignee}
              </div>
            </div>
          </div>
          <div class="alert-actions-group">
            <button class="btn btn-sm btn-primary" onclick="window.worknexApp.openReassignModal()">Review Reassignment</button>
          </div>
        </div>
      ` : ''}

      <!-- 6 KPI CARDS (SPEC #5) -->
      <div class="kpi-grid-6">
        <!-- 1. Overall Progress -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Overall Progress</span>
            <div class="kpi-icon-pill" style="background:#EFF6FC; color:var(--ms-blue);">📈</div>
          </div>
          <div class="kpi-value-number">78%</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-up">↑ +4%</span>
            <span>vs last week</span>
          </div>
        </div>

        <!-- 2. Completed Work -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Completed Work</span>
            <div class="kpi-icon-pill" style="background:#ECFDF5; color:var(--status-success);">✓</div>
          </div>
          <div class="kpi-value-number">42</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-up">↑ +8</span>
            <span>items completed</span>
          </div>
        </div>

        <!-- 3. Pending Work -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Pending Work</span>
            <div class="kpi-icon-pill" style="background:#EFF6FC; color:var(--accent-blue);">⏳</div>
          </div>
          <div class="kpi-value-number">11</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-neutral">In review</span>
            <span>work items</span>
          </div>
        </div>

        <!-- 4. Active Blockers -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Active Blockers</span>
            <div class="kpi-icon-pill" style="background:#FEF2F2; color:var(--status-danger);">⚠️</div>
          </div>
          <div class="kpi-value-number" style="color:var(--status-danger);">4</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-down">1 Recurring</span>
            <span>needs attention</span>
          </div>
        </div>

        <!-- 5. Overdue Work -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Overdue Work</span>
            <div class="kpi-icon-pill" style="background:#FFFBEB; color:var(--status-warning);">⏰</div>
          </div>
          <div class="kpi-value-number">3</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-neutral">-1</span>
            <span>from yesterday</span>
          </div>
        </div>

        <!-- 6. Teams -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">Teams</span>
            <div class="kpi-icon-pill" style="background:#F5F3FF; color:var(--ai-purple);">👥</div>
          </div>
          <div class="kpi-value-number">6</div>
          <div class="kpi-trend-row">
            <span class="kpi-trend-badge trend-neutral">24 members</span>
            <span>distributed</span>
          </div>
        </div>
      </div>

      <!-- MIDDLE ROW: TEAM PROGRESS + PROJECT HEALTH -->
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom:28px;">
        <!-- TEAM PROGRESS (SPEC #6) -->
        <div class="card-section" style="margin-bottom:0;">
          <div class="card-section-header">
            <div>
              <h2 class="card-section-title">Team Progress</h2>
              <p style="font-size:12.5px; color:var(--text-muted); margin-top:2px;">
                Real-time velocity aggregated from asynchronous check-ins. Click any team for detail.
              </p>
            </div>
            <button class="btn btn-xs btn-outline" onclick="window.worknexApp.navigateTo('teams')">View All Teams →</button>
          </div>

          <div class="team-progress-grid">
            ${state.teams.map(team => `
              <div class="team-progress-card" onclick="window.worknexApp.openTeamDetailModal('${team.id}')">
                <div class="team-progress-top">
                  <span class="team-name-title">${team.name}</span>
                  <span class="team-pct-badge" style="color:${team.color || 'var(--ms-blue)'};">${team.progress}%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width:${team.progress}%; background:${team.color || 'var(--ms-blue)'};"></div>
                </div>
                <div class="team-meta-row">
                  <span>${team.workArea}</span>
                  <span>${team.activeBlockers > 0 ? `<span style="color:var(--status-danger); font-weight:600;">⚠️ ${team.activeBlockers} blocker</span>` : '✓ 0 blockers'}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- PROJECT HEALTH (SPEC #17) -->
        <div class="card-section" style="margin-bottom:0; display:flex; flex-direction:column;">
          <div class="card-section-header">
            <div>
              <h2 class="card-section-title">Project Health</h2>
              <p style="font-size:12.5px; color:var(--text-muted);">Current sprint delivery distribution</p>
            </div>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <canvas id="dashboard-health-canvas" class="chart-canvas" style="height:170px; max-width:240px;"></canvas>
            <div style="width:100%; display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:14px; font-size:12px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:10px; height:10px; border-radius:2px; background:var(--status-success);"></span>
                <span>Completed: <strong>60%</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:10px; height:10px; border-radius:2px; background:var(--ms-blue);"></span>
                <span>In Progress: <strong>25%</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:10px; height:10px; border-radius:2px; background:var(--status-warning);"></span>
                <span>Pending: <strong>10%</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:10px; height:10px; border-radius:2px; background:var(--status-danger);"></span>
                <span>Blocked: <strong>5%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI DAILY DIGEST (SPEC #7) -->
      <div class="card-section">
        <div class="card-section-header">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h2 class="card-section-title">AI Daily Digest</h2>
              <span class="badge badge-ai">Processed Intelligence • Read-Only</span>
            </div>
            <p style="font-size:12.5px; color:var(--text-muted); margin-top:4px;">
              Extracted asynchronously from voluntary employee check-ins. Manager decision visibility.
            </p>
          </div>
          <span style="font-size:12.5px; color:var(--text-muted);">29 September 2026</span>
        </div>

        <div class="table-responsive">
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>WORK AREA</th>
                <th>STATUS</th>
                <th>BLOCKER</th>
                <th>ATTENDANCE</th>
                <th>CHALLENGE</th>
                <th style="text-align:right;">SOURCE TRACEABILITY</th>
              </tr>
            </thead>
            <tbody>
              ${state.dailyDigest.map(row => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div class="user-avatar" style="width:28px; height:28px; font-size:11px; background:${this.getAvatarColor(row.employeeName)};">
                        ${this.getInitials(row.employeeName)}
                      </div>
                      <strong style="color:var(--primary-navy);">${row.employeeName}</strong>
                    </div>
                  </td>
                  <td>${row.workArea}</td>
                  <td>
                    <span class="badge ${this.getStatusBadgeClass(row.status)}">
                      ${row.status}
                    </span>
                  </td>
                  <td>
                    ${row.blocker !== "None" ? `
                      <span class="badge badge-danger">
                        🔴 ${row.blocker} ${row.consecutiveDays ? `(${row.consecutiveDays}d)` : ''}
                      </span>
                    ` : `
                      <span style="color:var(--text-muted);">None</span>
                    `}
                  </td>
                  <td>
                    <span class="badge ${row.attendance === 'On Leave' ? 'badge-warning' : 'badge-neutral'}">
                      ${row.attendance}
                    </span>
                  </td>
                  <td>
                    ${row.challenge !== "None" ? `
                      <span style="color:var(--text-secondary); font-size:12.5px;">${row.challenge}</span>
                    ` : `
                      <span style="color:var(--text-muted);">None</span>
                    `}
                  </td>
                  <td style="text-align:right;">
                    ${row.blocker !== "None" ? `
                      <button class="btn btn-xs btn-outline" onclick="window.worknexApp.openSourceModal('${row.id}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        View Source
                      </button>
                    ` : row.attendance === "On Leave" ? `
                      <button class="btn btn-xs btn-outline" onclick="window.worknexApp.openReassignModal()">
                        Review Reassignment
                      </button>
                    ` : `
                      <button class="btn btn-xs btn-outline" style="opacity:0.75;" onclick="window.worknexApp.openSourceModal('${row.id}')">
                        View Source
                      </button>
                    `}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 6. TEAMS VIEW
  // ==========================================================================
  renderTeamsView() {
    const state = this.store.getState();

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Teams</h1>
          <p class="page-subtitle">Organizational distribution across 6 engineering teams.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:28px;">
        ${state.teams.map(t => `
          <div class="card-section" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="window.worknexApp.openTeamDetailModal('${t.id}')">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div>
                  <h3 style="font-size:16px; font-weight:700; color:var(--primary-navy);">${t.name}</h3>
                  <div style="font-size:12.5px; color:var(--text-muted);">${t.workArea}</div>
                </div>
                <span class="team-pct-badge" style="color:${t.color}; font-size:16px;">${t.progress}%</span>
              </div>

              <div class="progress-bar-track" style="margin-bottom:14px;">
                <div class="progress-bar-fill" style="width:${t.progress}%; background:${t.color};"></div>
              </div>

              <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
                <strong>Lead:</strong> ${t.lead}
              </div>

              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;">
                ${t.members.map(m => `
                  <span class="badge badge-neutral" style="font-size:11px;">
                    ${m.name} ${m.status === 'On Leave' ? '(On Leave)' : ''}
                  </span>
                `).join("")}
              </div>
            </div>

            <div style="border-top:1px solid var(--border-light); padding-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-muted);">
              <span>✓ ${t.completedWork} completed</span>
              <span>⏳ ${t.pendingWork} pending</span>
              ${t.activeBlockers > 0 ? `<span style="color:var(--status-danger); font-weight:600;">⚠️ ${t.activeBlockers} blocker</span>` : `<span style="color:var(--status-success);">✓ 0 blockers</span>`}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 7. PROJECTS VIEW
  // ==========================================================================
  renderProjectsView() {
    const state = this.store.getState();

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">Strategic initiatives overview and milestone telemetry.</p>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px;">
        ${state.projects.map(p => `
          <div class="card-section" style="margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <h2 style="font-size:18px; font-weight:700; color:var(--primary-navy);">${p.name}</h2>
                  <span class="badge badge-neutral">${p.code}</span>
                  <span class="badge badge-success">${p.status}</span>
                </div>
                <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">${p.description}</p>
              </div>
              <div style="text-align:right;">
                <span style="font-size:24px; font-weight:700; color:var(--ms-blue);">${p.progress}%</span>
                <div style="font-size:11.5px; color:var(--text-muted);">Target: ${p.targetDate}</div>
              </div>
            </div>

            <div class="progress-bar-track" style="margin-bottom:20px; height:10px;">
              <div class="progress-bar-fill" style="width:${p.progress}%; background:var(--ms-blue);"></div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:12px; margin-bottom:20px; background:#F8FAFC; padding:12px 16px; border-radius:var(--radius-md);">
              <div><span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Teams</span><div style="font-size:16px; font-weight:700;">${p.teamsCount}</div></div>
              <div><span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Work Items</span><div style="font-size:16px; font-weight:700;">${p.totalWorkItems}</div></div>
              <div><span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Completed</span><div style="font-size:16px; font-weight:700; color:var(--status-success);">${p.completedWorkItems}</div></div>
              <div><span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Pending</span><div style="font-size:16px; font-weight:700; color:var(--ms-blue);">${p.pendingWorkItems}</div></div>
              <div><span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Blocked</span><div style="font-size:16px; font-weight:700; color:var(--status-danger);">${p.blockedWorkItems}</div></div>
            </div>

            <div>
              <h4 style="font-size:13px; font-weight:700; color:var(--primary-navy); margin-bottom:8px;">Milestones</h4>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${p.milestones.map(m => `
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:12.5px; padding:6px 10px; background:#FFFFFF; border:1px solid var(--border-light); border-radius:var(--radius-sm);">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="width:8px; height:8px; border-radius:50%; background:${m.status === 'Completed' ? 'var(--status-success)' : m.status === 'In Progress' ? 'var(--ms-blue)' : '#CBD5E1'};"></span>
                      <span>${m.name}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                      <span class="badge ${this.getStatusBadgeClass(m.status)}">${m.status}</span>
                      <span style="color:var(--text-muted);">${m.date}</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 8. TASKS VIEW (SPEC #8) - READ-ONLY VISIBILITY
  // ==========================================================================
  renderTasksView() {
    const state = this.store.getState();

    // Filter tasks
    let filteredTasks = state.tasks.filter(t => {
      const matchTeam = this.taskFilterTeam === "all" || t.team.toLowerCase().includes(this.taskFilterTeam.toLowerCase());
      const matchStatus = this.taskFilterStatus === "all" || t.status.toLowerCase() === this.taskFilterStatus.toLowerCase();
      const matchBlocker = this.taskFilterBlocker === "all" || (this.taskFilterBlocker === "blocked" ? t.blocker !== "None" : t.blocker === "None");
      const matchSearch = !this.searchQuery || t.workArea.toLowerCase().includes(this.searchQuery.toLowerCase()) || t.employee.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchTeam && matchStatus && matchBlocker && matchSearch;
    });

    // Sort tasks
    if (this.taskSort === "deadline") {
      filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (this.taskSort === "progress") {
      filteredTasks.sort((a, b) => b.progress - a.progress);
    } else if (this.taskSort === "status") {
      filteredTasks.sort((a, b) => a.status.localeCompare(b.status));
    }

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Manager visibility across all 54 active and historical workstreams.</p>
        </div>
        <div style="font-size:12px; color:var(--text-muted); background:#F1F5F9; padding:6px 12px; border-radius:var(--radius-sm); border:1px solid #CBD5E1;">
          🔒 View-Only Mode &nbsp;•&nbsp; Task manipulation restricted to distributed team autonomy
        </div>
      </div>

      <!-- Filters & Sorting Toolbar -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <input 
            type="text" 
            class="filter-search-box" 
            placeholder="Search work area or employee..." 
            value="${this.searchQuery}" 
            oninput="window.worknexApp.searchQuery = this.value; window.worknexApp.render();"
          />

          <!-- Team Filter -->
          <select class="filter-select" onchange="window.worknexApp.taskFilterTeam = this.value; window.worknexApp.render();">
            <option value="all" ${this.taskFilterTeam === 'all' ? 'selected' : ''}>All Teams</option>
            <option value="alpha" ${this.taskFilterTeam === 'alpha' ? 'selected' : ''}>Team Alpha</option>
            <option value="beta" ${this.taskFilterTeam === 'beta' ? 'selected' : ''}>Team Beta</option>
            <option value="gamma" ${this.taskFilterTeam === 'gamma' ? 'selected' : ''}>Team Gamma</option>
            <option value="delta" ${this.taskFilterTeam === 'delta' ? 'selected' : ''}>Team Delta</option>
            <option value="epsilon" ${this.taskFilterTeam === 'epsilon' ? 'selected' : ''}>Team Epsilon</option>
            <option value="zeta" ${this.taskFilterTeam === 'zeta' ? 'selected' : ''}>Team Zeta</option>
          </select>

          <!-- Status Filter -->
          <select class="filter-select" onchange="window.worknexApp.taskFilterStatus = this.value; window.worknexApp.render();">
            <option value="all" ${this.taskFilterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="completed" ${this.taskFilterStatus === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="in progress" ${this.taskFilterStatus === 'in progress' ? 'selected' : ''}>In Progress</option>
            <option value="pending" ${this.taskFilterStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="blocked" ${this.taskFilterStatus === 'blocked' ? 'selected' : ''}>Blocked</option>
            <option value="overdue" ${this.taskFilterStatus === 'overdue' ? 'selected' : ''}>Overdue</option>
          </select>

          <!-- Blocker Filter -->
          <select class="filter-select" onchange="window.worknexApp.taskFilterBlocker = this.value; window.worknexApp.render();">
            <option value="all" ${this.taskFilterBlocker === 'all' ? 'selected' : ''}>All Blocker States</option>
            <option value="blocked" ${this.taskFilterBlocker === 'blocked' ? 'selected' : ''}>Has Blocker</option>
            <option value="unblocked" ${this.taskFilterBlocker === 'unblocked' ? 'selected' : ''}>No Blocker</option>
          </select>
        </div>

        <div class="toolbar-right">
          <span style="font-size:12.5px; color:var(--text-muted);">Sort by:</span>
          <select class="filter-select" onchange="window.worknexApp.taskSort = this.value; window.worknexApp.render();">
            <option value="deadline" ${this.taskSort === 'deadline' ? 'selected' : ''}>Deadline (Ascending)</option>
            <option value="progress" ${this.taskSort === 'progress' ? 'selected' : ''}>Progress (High to Low)</option>
            <option value="status" ${this.taskSort === 'status' ? 'selected' : ''}>Status (Alphabetical)</option>
          </select>
          <span class="badge badge-neutral">${filteredTasks.length} items</span>
        </div>
      </div>

      <!-- Tasks Table (SPEC #8) -->
      <div class="table-responsive">
        <table class="enterprise-table">
          <thead>
            <tr>
              <th>WORK AREA</th>
              <th>ASSIGNED EMPLOYEE</th>
              <th>TEAM</th>
              <th>STATUS</th>
              <th>DEADLINE</th>
              <th>PROGRESS</th>
              <th>BLOCKER</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTasks.map(t => `
              <tr>
                <td><strong>${t.workArea}</strong></td>
                <td>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div class="user-avatar" style="width:24px; height:24px; font-size:10px; background:${this.getAvatarColor(t.employee)};">
                      ${this.getInitials(t.employee)}
                    </div>
                    <span>${t.employee}</span>
                  </div>
                </td>
                <td><span class="badge badge-neutral">${t.team}</span></td>
                <td><span class="badge ${this.getStatusBadgeClass(t.status)}">${t.status}</span></td>
                <td style="font-size:12.5px; color:var(--text-secondary);">${t.deadline}</td>
                <td style="min-width:120px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div class="progress-bar-track" style="margin-bottom:0; height:6px;">
                      <div class="progress-bar-fill" style="width:${t.progress}%; background:${t.status === 'Completed' ? 'var(--status-success)' : t.status === 'Blocked' ? 'var(--status-danger)' : 'var(--ms-blue)'};"></div>
                    </div>
                    <span style="font-size:12px; font-weight:600; width:30px;">${t.progress}%</span>
                  </div>
                </td>
                <td>
                  ${t.blocker !== "None" ? `
                    <span class="badge badge-danger">🔴 ${t.blocker}</span>
                  ` : `
                    <span style="color:var(--text-muted); font-size:12.5px;">None</span>
                  `}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // 9. BLOCKER CENTER VIEW (SPEC #9 & #10)
  // ==========================================================================
  renderBlockersView() {
    const state = this.store.getState();

    let filtered = state.blockers.filter(b => {
      const matchTeam = this.blockerFilterTeam === "all" || b.teamId === this.blockerFilterTeam;
      const matchSeverity = this.blockerFilterSeverity === "all" || b.severity.toLowerCase() === this.blockerFilterSeverity.toLowerCase();
      return matchTeam && matchSeverity;
    });

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Blocker Center</h1>
          <p class="page-subtitle">Impediment triage, multi-day recurring flags, and root cause traceability.</p>
        </div>
      </div>

      <!-- Blocker Filters -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <select class="filter-select" onchange="window.worknexApp.blockerFilterTeam = this.value; window.worknexApp.render();">
            <option value="all">All Teams</option>
            <option value="team-alpha">Team Alpha</option>
            <option value="team-beta">Team Beta</option>
            <option value="team-gamma">Team Gamma</option>
            <option value="team-delta">Team Delta</option>
          </select>

          <select class="filter-select" onchange="window.worknexApp.blockerFilterSeverity = this.value; window.worknexApp.render();">
            <option value="all">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>
      </div>

      <!-- Blocker Table (SPEC #9) -->
      <div class="table-responsive">
        <table class="enterprise-table">
          <thead>
            <tr>
              <th>BLOCKER</th>
              <th>TEAM</th>
              <th>AFFECTED WORK AREA</th>
              <th>DAYS ACTIVE</th>
              <th>SEVERITY</th>
              <th>STATUS</th>
              <th style="text-align:right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(b => `
              <tr style="${b.isRecurring ? 'background:#FEF2F2;' : ''}">
                <td>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <strong style="color:${b.isRecurring ? 'var(--status-danger)' : 'var(--primary-navy)'};">${b.title}</strong>
                    ${b.isRecurring ? `<span class="badge badge-danger">🔴 3 Consecutive Days</span>` : ''}
                  </div>
                </td>
                <td>${b.team}</td>
                <td>${b.affectedWorkArea}</td>
                <td>
                  <span style="font-weight:600; color:${b.daysActive >= 3 ? 'var(--status-danger)' : 'inherit'};">
                    ${b.daysActive} days
                  </span>
                </td>
                <td>
                  <span class="badge ${b.severity === 'High' ? 'badge-danger' : b.severity === 'Medium' ? 'badge-warning' : 'badge-neutral'}">
                    ${b.severity}
                  </span>
                </td>
                <td>
                  <span class="badge ${b.status === 'Unresolved' ? 'badge-danger' : 'badge-info'}">
                    ${b.status}
                  </span>
                </td>
                <td style="text-align:right;">
                  <div style="display:flex; justify-content:flex-end; gap:6px;">
                    <button class="btn btn-xs btn-outline" onclick="window.worknexApp.openSourceModal('${b.sourceUpdateId || 'digest-2'}')">View Source</button>
                    <button class="btn btn-xs btn-primary" onclick="window.worknexApp.openReviewBlockerModal('${b.id}')">Review Blocker</button>
                    <button class="btn btn-xs btn-outline" onclick="window.worknexApp.store.dismissBlockerAlert('${b.id}')">Dismiss Alert</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // 10. WEEKLY REPORTS VIEW (SPEC #16) - 5 CHARTS
  // ==========================================================================
  renderReportsView() {
    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Weekly Reports</h1>
          <p class="page-subtitle">Comprehensive velocity metrics, multi-chart trajectory, and blocker resolutions.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-sm btn-outline" onclick="window.print()">Export Report</button>
          <button class="btn btn-sm btn-primary" onclick="window.worknexApp.demoController.generateWeeklyReport()">Refresh Velocity</button>
        </div>
      </div>

      <!-- KPI Summary Header (SPEC #16) -->
      <div class="kpi-grid-6" style="margin-bottom:24px;">
        <div class="kpi-card">
          <span class="kpi-label">Overall Progress</span>
          <div class="kpi-value-number">78%</div>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Completed Work</span>
          <div class="kpi-value-number" style="color:var(--status-success);">42</div>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Pending Work</span>
          <div class="kpi-value-number" style="color:var(--ms-blue);">11</div>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Overdue Work</span>
          <div class="kpi-value-number" style="color:var(--status-warning);">3</div>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Unresolved Blockers</span>
          <div class="kpi-value-number" style="color:var(--status-danger);">4</div>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Sprint Week</span>
          <div class="kpi-value-number">W4</div>
        </div>
      </div>

      <!-- 5 Interactive Charts Grid -->
      <div class="charts-grid-2">
        <!-- 1. Weekly Overall Progress Line Chart -->
        <div class="chart-card-box">
          <div class="chart-card-header">
            <span class="chart-card-title">1. Weekly Overall Progress (Mon - Fri)</span>
            <span class="badge badge-info">+16% Velocity Gain</span>
          </div>
          <canvas id="chart-weekly-progress" class="chart-canvas"></canvas>
        </div>

        <!-- 2. Completed vs Pending vs Overdue Bar Chart -->
        <div class="chart-card-box">
          <div class="chart-card-header">
            <span class="chart-card-title">2. Completed vs Pending vs Overdue</span>
            <span class="badge badge-neutral">54 Work Items Total</span>
          </div>
          <canvas id="chart-task-status" class="chart-canvas"></canvas>
        </div>

        <!-- 3. Team Progress Comparison -->
        <div class="chart-card-box">
          <div class="chart-card-header">
            <span class="chart-card-title">3. Team Progress Comparison</span>
            <span class="badge badge-ai">6 Distributed Teams</span>
          </div>
          <canvas id="chart-team-comparison" class="chart-canvas"></canvas>
        </div>

        <!-- 4. Blocker Trend -->
        <div class="chart-card-box">
          <div class="chart-card-header">
            <span class="chart-card-title">4. Blocker Trend (Past 7 Days)</span>
            <span class="badge badge-danger">4 Active Unresolved</span>
          </div>
          <canvas id="chart-blocker-trend" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 5. Work Completion Velocity Trend (Full Width) -->
      <div class="chart-card-box" style="margin-bottom:28px;">
        <div class="chart-card-header">
          <span class="chart-card-title">5. Work Completion Velocity Trend (Cumulative Delivered)</span>
          <span class="badge badge-success">Target: 50 items</span>
        </div>
        <canvas id="chart-completion-velocity" class="chart-canvas" style="height:220px;"></canvas>
      </div>

      <!-- AI Synthesized Executive Summary -->
      <div class="card-section">
        <h3 style="font-size:15px; font-weight:700; color:var(--primary-navy); margin-bottom:12px;">Executive AI Synthesis</h3>
        <ul style="font-size:13.5px; color:var(--text-secondary); line-height:1.7; padding-left:20px; margin:0;">
          <li><strong>Sprint Velocity:</strong> Progress accelerated smoothly from 62% on Monday to 78% on Friday with zero team disruption.</li>
          <li><strong>Critical Bottleneck:</strong> API Access blocker in Team Alpha has persisted across 3 consecutive days, preventing full microservice integration. Cross-team collaboration meeting suggested with Team Gamma.</li>
          <li><strong>Silent Delay Flag:</strong> Team Beta's Backend Integration has remained in pending status for 7 days. Suggested reassignment to Elena Rostova is ready for approval.</li>
        </ul>
      </div>
    `;
  }

  renderAllCharts() {
    const state = this.store.getState();
    const reports = state.weeklyReports;

    this.charts.renderWeeklyOverallProgress("chart-weekly-progress", reports.dailyVelocity);
    this.charts.renderTaskStatusComparison("chart-task-status", reports);
    this.charts.renderTeamProgressComparison("chart-team-comparison", state.teams);
    this.charts.renderBlockerTrend("chart-blocker-trend", reports.blockerTrend);
    this.charts.renderWorkCompletionTrend("chart-completion-velocity", reports.velocityCumulative);
  }

  // ==========================================================================
  // 11. EMPLOYEE CREDITS VIEW (SPEC #12) - READ-ONLY TABLE
  // ==========================================================================
  renderCreditsView() {
    const state = this.store.getState();

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Employee Credits</h1>
          <p class="page-subtitle">Recognizing verified cross-team collaboration and unblocking contributions.</p>
        </div>
        <div style="font-size:12px; color:var(--text-muted); background:#F1F5F9; padding:6px 12px; border-radius:var(--radius-sm); border:1px solid #CBD5E1;">
          🔒 Read-Only Visibility &nbsp;•&nbsp; Non-competitive, anti-surveillance peer assistance
        </div>
      </div>

      <div class="table-responsive">
        <table class="enterprise-table">
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>CREDITS</th>
              <th>REASON (VERIFIED COLLABORATION ACTIVITY)</th>
            </tr>
          </thead>
          <tbody>
            ${state.employeeCredits.map(c => `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div class="user-avatar" style="width:30px; height:30px; font-size:12px; background:${this.getAvatarColor(c.employee)};">
                      ${this.getInitials(c.employee)}
                    </div>
                    <strong style="color:var(--primary-navy);">${c.employee}</strong>
                  </div>
                </td>
                <td>
                  <span class="badge badge-ai" style="font-size:13px; font-weight:700;">
                    +${c.credits} pts
                  </span>
                </td>
                <td style="color:var(--text-secondary); font-size:13.5px;">
                  ${c.reason}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // 12. EMPLOYEE ACHIEVEMENTS VIEW (SPEC #13)
  // ==========================================================================
  renderAchievementsView() {
    const state = this.store.getState();

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Employee Achievements</h1>
          <p class="page-subtitle">Historical engineering accomplishments and validated deliverables.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:20px;">
        ${state.employeeAchievements.map(ach => `
          <div class="card-section" style="margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="user-avatar" style="width:34px; height:34px; font-size:13px; background:${this.getAvatarColor(ach.employee)};">
                  ${this.getInitials(ach.employee)}
                </div>
                <div>
                  <h3 style="font-size:15px; font-weight:700; color:var(--primary-navy);">${ach.employee}</h3>
                  <div style="font-size:12px; color:var(--text-muted);">${ach.project} • ${ach.date}</div>
                </div>
              </div>
              <span class="badge badge-success">Milestone</span>
            </div>

            <div style="font-size:14px; font-weight:600; color:var(--primary-navy); margin-bottom:6px;">
              ${ach.achievement}
            </div>

            <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">
              ${ach.description}
            </p>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 13. NOTIFICATION CENTER (SPEC #19)
  // ==========================================================================
  renderNotificationsView() {
    const state = this.store.getState();

    let notifs = state.notifications;
    if (this.notifFilterTab === "critical") {
      notifs = notifs.filter(n => n.severity === "critical");
    } else if (this.notifFilterTab === "warning") {
      notifs = notifs.filter(n => n.severity === "warning");
    }

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Notification Center</h1>
          <p class="page-subtitle">Real-time alerts for recurring blockers, silent delays, challenges, and completions.</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <button class="btn btn-sm ${this.notifFilterTab === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="window.worknexApp.notifFilterTab = 'all'; window.worknexApp.render();">All Notifications</button>
        <button class="btn btn-sm ${this.notifFilterTab === 'critical' ? 'btn-danger' : 'btn-outline'}" onclick="window.worknexApp.notifFilterTab = 'critical'; window.worknexApp.render();">Critical (Red Flag)</button>
        <button class="btn btn-sm ${this.notifFilterTab === 'warning' ? 'btn-primary' : 'btn-outline'}" onclick="window.worknexApp.notifFilterTab = 'warning'; window.worknexApp.render();">Warnings (Silent Delay)</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        ${notifs.map(n => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:#FFFFFF; border:1px solid var(--border-light); border-left:4px solid ${n.badgeColor || '#0078D4'}; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${n.badgeColor}15; color:${n.badgeColor}; font-size:16px;">
                ${n.severity === 'critical' ? '🔴' : n.severity === 'warning' ? '⏳' : n.severity === 'ai' ? '🤝' : '✓'}
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="font-size:14px; color:var(--primary-navy);">${n.title}</strong>
                  ${n.unread ? `<span class="badge badge-danger" style="font-size:10px; padding:1px 6px;">NEW</span>` : ''}
                </div>
                <div style="font-size:13px; color:var(--text-secondary); margin-top:2px;">
                  ${n.message}
                </div>
                <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px;">
                  ${n.relatedTeam} • ${n.relatedWork} • ${n.timestamp}
                </div>
              </div>
            </div>
            <div>
              <button class="btn btn-sm btn-outline" onclick="window.worknexApp.navigateTo('${n.actionRoute || 'dashboard'}')">
                ${n.actionLabel || 'View'}
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 14. ACTIVITY LOG (SPEC #20)
  // ==========================================================================
  renderActivityView() {
    const state = this.store.getState();

    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Activity Log</h1>
          <p class="page-subtitle">Immutable audit trail of AI extractions, manager inspections, and flags.</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="enterprise-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>TIME</th>
              <th>ACTION</th>
              <th>ACTOR</th>
              <th>RELATED PROJECT / WORK</th>
            </tr>
          </thead>
          <tbody>
            ${state.activityLogs.map(a => `
              <tr>
                <td style="font-weight:600; color:var(--primary-navy);">${a.date}</td>
                <td style="color:var(--text-muted); font-size:12.5px;">${a.time}</td>
                <td>
                  <span class="badge badge-neutral" style="font-size:12px;">
                    ${a.action}
                  </span>
                </td>
                <td><strong>${a.actor}</strong></td>
                <td style="color:var(--text-secondary);">${a.related}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // 15. SETTINGS (SPEC #23)
  // ==========================================================================
  renderSettingsView() {
    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Manager Settings</h1>
          <p class="page-subtitle">Profile preferences, security parameters, and data governance boundaries.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 2fr; gap:24px;">
        <!-- Profile summary card -->
        <div class="card-section">
          <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid var(--border-light); margin-bottom:16px;">
            <div class="user-avatar" style="width:64px; height:64px; font-size:24px; margin:0 auto 12px; background:var(--primary-navy);">AV</div>
            <h2 style="font-size:18px; font-weight:700; color:var(--primary-navy);">Avni</h2>
            <p style="font-size:13px; color:var(--text-muted);">Manager Portal • Hackathon Lead</p>
          </div>
          <div style="font-size:13px; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px;">
            <div><strong>Email:</strong> avni@worknex.demo</div>
            <div><strong>Department:</strong> Cloud Systems & Architecture</div>
            <div><strong>Role:</strong> Engineering Manager (Read/Review Scope)</div>
          </div>
          <div style="margin-top:20px;">
            <button class="btn btn-sm btn-outline" style="width:100%;" onclick="window.worknexApp.handleLogout()">Sign Out</button>
          </div>
        </div>

        <!-- Preferences Form -->
        <div class="card-section">
          <h3 style="font-size:16px; font-weight:700; color:var(--primary-navy); margin-bottom:18px;">Preferences</h3>

          <div style="margin-bottom:20px;">
            <label style="display:block; font-weight:600; font-size:13.5px; margin-bottom:8px;">Notification Thresholds</label>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <label style="display:flex; align-items:center; gap:10px; font-size:13px;">
                <input type="checkbox" checked style="accent-color:var(--status-danger);">
                Generate RED FLAG alert for Recurring Blockers (3 consecutive days)
              </label>
              <label style="display:flex; align-items:center; gap:10px; font-size:13px;">
                <input type="checkbox" checked style="accent-color:var(--status-warning);">
                Generate ORANGE ALERT for Silent Delays (Pending ≥ 7 days)
              </label>
              <label style="display:flex; align-items:center; gap:10px; font-size:13px;">
                <input type="checkbox" checked style="accent-color:var(--ai-indigo);">
                Suggest Collaboration Meetings when blocker impacts multiple teams
              </label>
            </div>
          </div>

          <div style="margin-bottom:20px; border-top:1px solid var(--border-light); padding-top:16px;">
            <label style="display:block; font-weight:600; font-size:13.5px; margin-bottom:8px;">Security</label>
            <button class="btn btn-sm btn-outline" onclick="alert('Demo Mode: Password reset simulation. Demo password remains Manager@123')">Change Password</button>
          </div>

          <div style="border-top:1px solid var(--border-light); padding-top:16px;">
            <label style="display:block; font-weight:600; font-size:13.5px; margin-bottom:8px;">Data & Privacy</label>
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.navigateTo('privacy')">Review Privacy & Data Boundaries →</button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 16. PRIVACY & DATA BOUNDARIES (SPEC #24)
  // ==========================================================================
  renderPrivacyView() {
    return `
      <div class="page-header-block">
        <div>
          <h1 class="page-title">Privacy & Data Boundaries</h1>
          <p class="page-subtitle">Enterprise anti-surveillance guarantee and explicit consent boundaries.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:28px;">
        <!-- WORKNEX DOES NOT -->
        <div class="card-section" style="border-top: 4px solid var(--status-danger);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
            <span style="font-size:20px;">🚫</span>
            <h2 style="font-size:16px; font-weight:700; color:var(--status-danger);">WORKNEX DOES NOT:</h2>
          </div>
          <ul style="font-size:13.5px; color:var(--text-secondary); line-height:1.8; padding-left:20px; margin:0;">
            <li><strong>Track online/offline employee presence</strong> or idle status.</li>
            <li><strong>Monitor private direct messages</strong> or team chat channels.</li>
            <li><strong>Secretly collect keystrokes</strong>, screen recordings, or location.</li>
            <li><strong>Read unrelated personal files</strong>, emails, or calendar entries.</li>
            <li><strong>Generate covert productivity scores</strong> or invasive employee ratings.</li>
          </ul>
        </div>

        <!-- WORKNEX PROCESSES -->
        <div class="card-section" style="border-top: 4px solid var(--status-success);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
            <span style="font-size:20px;">✓</span>
            <h2 style="font-size:16px; font-weight:700; color:var(--status-success);">WORKNEX PROCESSES:</h2>
          </div>
          <ul style="font-size:13.5px; color:var(--text-secondary); line-height:1.8; padding-left:20px; margin:0;">
            <li><strong>Voluntarily submitted sprint updates</strong> provided directly by engineers.</li>
            <li><strong>Authorized project workstream items</strong> and dependency declarations.</li>
            <li><strong>Explicit technical blockers and challenges</strong> impacting delivery.</li>
            <li><strong>Traceable, immutable source messages</strong> accessible for inspection.</li>
            <li><strong>Verified peer-help contributions</strong> for non-competitive recognition.</li>
          </ul>
        </div>
      </div>

      <div class="card-section" style="background:#F8FAFC;">
        <h3 style="font-size:14.5px; font-weight:700; color:var(--primary-navy); margin-bottom:8px;">Microsoft Azure Enterprise Trust Framework</h3>
        <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin:0;">
          WORKNEX adheres strictly to Microsoft enterprise data boundaries and GDPR/SOC-2 privacy standards. 
          The Manager Portal provides decision telemetry and bottleneck resolution assistance without eroding engineering trust or psychological safety.
        </p>
      </div>
    `;
  }

  // ==========================================================================
  // MODALS (View Source, Team Detail, Meeting, Reassignment, etc.)
  // ==========================================================================
  renderModals() {
    return `
      <!-- 1. VIEW SOURCE TRACEABILITY MODAL (SPEC #7) -->
      <div id="modal-view-source" class="modal-overlay" onclick="if(event.target === this) window.worknexApp.closeAllModals();">
        <div class="modal-dialog">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">📄</span>
              <h3 class="modal-title">Source Traceability</h3>
            </div>
            <button class="modal-close-btn" onclick="window.worknexApp.closeAllModals()">✕</button>
          </div>
          <div id="source-modal-content" class="modal-body">
            <!-- Dynamic content injected -->
          </div>
          <div class="modal-footer">
            <span style="font-size:12px; color:var(--text-muted); margin-right:auto;">
              🔒 Authorized Source • Immutable
            </span>
            <button class="btn btn-sm btn-primary" onclick="window.worknexApp.closeAllModals()">Close</button>
          </div>
        </div>
      </div>

      <!-- 2. TEAM DETAIL MODAL (SPEC #6) -->
      <div id="modal-team-detail" class="modal-overlay" onclick="if(event.target === this) window.worknexApp.closeAllModals();">
        <div class="modal-dialog" style="max-width:680px;">
          <div class="modal-header">
            <h3 id="team-modal-title" class="modal-title">Team Detail</h3>
            <button class="modal-close-btn" onclick="window.worknexApp.closeAllModals()">✕</button>
          </div>
          <div id="team-modal-content" class="modal-body">
            <!-- Dynamic content injected -->
          </div>
          <div class="modal-footer">
            <span style="font-size:12px; color:var(--text-muted); margin-right:auto;">
              🔒 Task assignment and priority controls restricted to Team Lead
            </span>
            <button class="btn btn-sm btn-primary" onclick="window.worknexApp.closeAllModals()">Close</button>
          </div>
        </div>
      </div>

      <!-- 3. COLLABORATION MEETING MODAL (SPEC #14) -->
      <div id="modal-collab-meeting" class="modal-overlay" onclick="if(event.target === this) window.worknexApp.closeAllModals();">
        <div class="modal-dialog">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">🤝</span>
              <h3 class="modal-title">Collaboration Meeting Generated</h3>
            </div>
            <button class="modal-close-btn" onclick="window.worknexApp.closeAllModals()">✕</button>
          </div>
          <div class="modal-body">
            <div class="flowai-alert-card ai-purple" style="margin-bottom:16px;">
              <div style="font-weight:700; color:#7C3AED; margin-bottom:4px;">Cross-Team Resolution Sync</div>
              <div style="font-size:13px; color:#1E293B;">
                <strong>Common Blocker:</strong> API Access (Azure KeyVault Handshake)<br>
                <strong>Affected Teams:</strong> Team Alpha & Team Gamma<br>
                <strong>Affected Members:</strong> 4 Engineers
              </div>
            </div>

            <div style="font-size:13.5px; color:var(--text-secondary); margin-bottom:16px;">
              <p><strong>Suggested Participants:</strong></p>
              <p style="background:#F8FAFC; padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-light); font-size:12.5px;">
                Elena Rostova (Lead Alpha), Chen Wei (Lead Gamma), Aadarsh, Lucas Silva, Chloe Adams
              </p>
            </div>

            <div style="background:#EEF2FF; border:1px dashed #C7D2FE; padding:12px; border-radius:var(--radius-md); font-size:13px; color:var(--ai-indigo);">
              <strong>Microsoft Teams Meeting Scheduled:</strong><br>
              <a href="https://teams.microsoft.com" target="_blank" style="color:var(--ms-blue); font-weight:600;">
                Join Microsoft Teams Sync (25 mins) →
              </a>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.closeAllModals()">Dismiss</button>
            <button class="btn btn-sm btn-primary" id="btn-modal-generate-meeting" onclick="window.worknexApp.confirmMeetingCreated()">Generate Meeting</button>
          </div>
        </div>
      </div>

      <!-- 4. LEAVE & WORK REASSIGNMENT MODAL (SPEC #15) -->
      <div id="modal-reassign" class="modal-overlay" onclick="if(event.target === this) window.worknexApp.closeAllModals();">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Review Work Reassignment</h3>
            <button class="modal-close-btn" onclick="window.worknexApp.closeAllModals()">✕</button>
          </div>
          <div class="modal-body">
            <div style="background:#FFFBEB; border:1px solid #FDE68A; padding:14px; border-radius:var(--radius-md); margin-bottom:16px;">
              <div style="font-weight:700; color:#D97706; margin-bottom:4px;">Employee On Leave</div>
              <div style="font-size:13px; color:#475569;">
                <strong>Employee:</strong> Rishabh<br>
                <strong>Status:</strong> On Leave (Hardware Malfunction)<br>
                <strong>Affected Work:</strong> Backend Integration (Silent delay: 7 days pending)
              </div>
            </div>

            <div style="font-size:13.5px; color:var(--text-secondary); margin-bottom:14px;">
              <p><strong>FlowAI Suggested Assignee:</strong></p>
              <div style="display:flex; align-items:center; gap:12px; background:#F8FAFC; border:1px solid var(--border-light); padding:10px 14px; border-radius:var(--radius-md); margin-top:6px;">
                <div class="user-avatar" style="background:#0284C7;">ER</div>
                <div>
                  <strong style="color:var(--primary-navy);">Elena Rostova</strong>
                  <div style="font-size:12px; color:var(--text-muted);">Principal Architect (Team Alpha) • Available capacity 40%</div>
                </div>
              </div>
            </div>

            <p style="font-size:12.5px; color:var(--text-muted); line-height:1.5;">
              Elena Rostova has completed her primary deliverables for this sprint and possesses verified expertise in distributed backend contracts.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.closeAllModals()">Dismiss</button>
            <button class="btn btn-sm btn-primary" onclick="window.worknexApp.approveReassignment()">Approve System Reassignment</button>
          </div>
        </div>
      </div>

      <!-- 5. GLOBAL SEARCH MODAL -->
      <div id="modal-global-search" class="modal-overlay" onclick="if(event.target === this) window.worknexApp.closeAllModals();">
        <div class="modal-dialog" style="max-width:600px;">
          <div style="padding:16px 20px; border-bottom:1px solid var(--border-light); display:flex; align-items:center; gap:12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" color="#64748B"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              id="global-search-input" 
              placeholder="Search projects, teams, employees, blockers, credits, reports..." 
              style="width:100%; border:none; outline:none; font-size:15px; font-family:inherit;"
              oninput="window.worknexApp.handleGlobalSearchInput(this.value)"
            />
            <button class="modal-close-btn" onclick="window.worknexApp.closeAllModals()">✕</button>
          </div>
          <div id="global-search-results" class="modal-body" style="max-height:380px;">
            <div style="font-size:13px; color:var(--text-muted); text-align:center; padding:20px;">
              Type to search across projects, teams, tasks, blockers, achievements, and credits...
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW SOURCE MODAL SPECIFIC (SPEC #7)
  // ==========================================================================
  openSourceModal(digestId) {
    const state = this.store.getState();
    const digest = state.dailyDigest.find(d => d.id === digestId) || state.dailyDigest[1]; // Aadarsh default
    if (!digest) return;

    this.store.logActivity("Avni (Manager)", "Viewed Source", `${digest.employeeName}'s daily update`);

    const modalBody = document.getElementById("source-modal-content");
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="source-provenance-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:11px; font-weight:700; color:var(--ai-indigo); text-transform:uppercase;">
              FlowAI Traceability Log • Zero Hallucination Guarantee
            </span>
            <span class="badge badge-ai">Confidence: ${Math.round((digest.extractedInfo.confidence || 0.98) * 100)}%</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:13px; margin-bottom:12px;">
            <div><strong>Source:</strong> Employee Daily Update</div>
            <div><strong>Date:</strong> ${digest.date}</div>
            <div><strong>Employee:</strong> ${digest.employeeName}</div>
            <div><strong>Verified:</strong> True (Azure Cryptographic Hash)</div>
          </div>

          <div style="margin-top:10px;">
            <span style="font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Original Update:</span>
            <div class="original-quote-box">
              "${digest.sourceMessage}"
            </div>
          </div>
        </div>

        <div style="background:#FFFFFF; border:1px solid var(--border-light); border-radius:var(--radius-md); padding:16px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--primary-navy); margin-bottom:10px;">
            AI Extracted Information:
          </h4>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; font-size:13px;">
            <div style="background:#F8FAFC; padding:10px; border-radius:var(--radius-sm);">
              <span style="font-size:11px; color:var(--text-muted); display:block;">Work Area</span>
              <strong>${digest.extractedInfo.workArea}</strong>
            </div>
            <div style="background:#F8FAFC; padding:10px; border-radius:var(--radius-sm);">
              <span style="font-size:11px; color:var(--text-muted); display:block;">Status</span>
              <strong style="color:${digest.extractedInfo.status === 'Completed' ? 'var(--status-success)' : digest.extractedInfo.status === 'Blocked' ? 'var(--status-danger)' : 'var(--ms-blue)'};">${digest.extractedInfo.status}</strong>
            </div>
            <div style="background:#F8FAFC; padding:10px; border-radius:var(--radius-sm);">
              <span style="font-size:11px; color:var(--text-muted); display:block;">Blocker</span>
              <strong style="color:${digest.extractedInfo.blocker !== 'None' ? 'var(--status-danger)' : 'var(--status-success)'};">${digest.extractedInfo.blocker}</strong>
            </div>
          </div>
          <div style="margin-top:12px; font-size:12px; color:var(--text-muted);">
            * The Manager has full viewing access to verified sources, but cannot modify the employee's original update.
          </div>
        </div>
      `;
    }

    this.openModal("modal-view-source");
  }

  // ==========================================================================
  // TEAM DETAIL MODAL (SPEC #6)
  // ==========================================================================
  openTeamDetailModal(teamId) {
    const state = this.store.getState();
    const team = state.teams.find(t => t.id === teamId) || state.teams[0];
    if (!team) return;

    const titleEl = document.getElementById("team-modal-title");
    if (titleEl) titleEl.textContent = `${team.name} — Detail View`;

    const bodyEl = document.getElementById("team-modal-content");
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <h4 style="font-size:15px; font-weight:700; color:var(--primary-navy);">${team.workArea}</h4>
            <div style="font-size:12.5px; color:var(--text-muted);">Lead: ${team.lead}</div>
          </div>
          <span style="font-size:22px; font-weight:700; color:${team.color};">${team.progress}%</span>
        </div>

        <div class="progress-bar-track" style="margin-bottom:18px;">
          <div class="progress-bar-fill" style="width:${team.progress}%; background:${team.color};"></div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:18px; background:#F8FAFC; padding:12px; border-radius:var(--radius-md);">
          <div><span style="font-size:11px; color:var(--text-muted);">Completed</span><div style="font-size:15px; font-weight:700; color:var(--status-success);">${team.completedWork}</div></div>
          <div><span style="font-size:11px; color:var(--text-muted);">Pending</span><div style="font-size:15px; font-weight:700; color:var(--ms-blue);">${team.pendingWork}</div></div>
          <div><span style="font-size:11px; color:var(--text-muted);">Blockers</span><div style="font-size:15px; font-weight:700; color:var(--status-danger);">${team.activeBlockers}</div></div>
          <div><span style="font-size:11px; color:var(--text-muted);">Present</span><div style="font-size:15px; font-weight:700;">${team.attendanceSummary.present} / ${team.attendanceSummary.total}</div></div>
        </div>

        <div style="margin-bottom:16px;">
          <h5 style="font-size:13px; font-weight:700; color:var(--primary-navy); margin-bottom:8px;">Team Members</h5>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${team.members.map(m => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#FFFFFF; border:1px solid var(--border-light); border-radius:var(--radius-sm); font-size:13px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div class="user-avatar" style="width:24px; height:24px; font-size:10px; background:${this.getAvatarColor(m.name)};">${m.avatar}</div>
                  <strong>${m.name}</strong>
                  <span style="font-size:12px; color:var(--text-muted);">• ${m.role}</span>
                </div>
                <span class="badge ${m.status === 'On Leave' ? 'badge-warning' : 'badge-neutral'}">${m.status}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <h5 style="font-size:13px; font-weight:700; color:var(--primary-navy); margin-bottom:6px;">Active Challenges</h5>
          <div style="padding:10px 12px; background:#FEF3C7; border:1px solid #FDE68A; border-radius:var(--radius-sm); font-size:13px; color:#92400E;">
            ${team.challenges}
          </div>
        </div>

        <div>
          <h5 style="font-size:13px; font-weight:700; color:var(--primary-navy); margin-bottom:6px;">Weekly Progress Velocity</h5>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); background:#F8FAFC; padding:8px 12px; border-radius:var(--radius-sm);">
            ${team.weeklyTrend.map(w => `
              <span>${w.day}: <strong>${w.progress}%</strong></span>
            `).join("")}
          </div>
        </div>
      `;
    }

    this.openModal("modal-team-detail");
  }

  openMeetingModal() {
    this.openModal("modal-collab-meeting");
  }

  resetMeetingAndOpen() {
    this.store.clearMeetingData();
    this.openModal("modal-collab-meeting");
  }

  confirmMeetingCreated() {
    this.store.createMeeting();
    this.closeAllModals();
    this.showToast("Microsoft Teams Sync scheduled for cross-team unblocking!", "success");
    this.render();
  }

  openReassignModal() {
    this.openModal("modal-reassign");
  }

  approveReassignment() {
    this.store.approveReassignment();
    this.closeAllModals();
    this.showToast("Approved system reassignment: Backend Integration assigned to Elena Rostova.", "success");
    this.render();
  }

  openSilentDelayModal() {
    alert("Silent Delay Review:\n\nTeam Beta's Backend Integration has remained PENDING for 7 consecutive days without completion or active blocker flag.\n\nRecommended Action: Review work reassignment as assigned engineer (Rishabh) is currently marked On Leave.");
    this.openReassignModal();
  }

  openReviewBlockerModal(blockerId) {
    const blocker = this.store.reviewBlocker(blockerId);
    if (blocker) {
      this.showToast(`Blocker '${blocker.title}' marked as Under Review.`, "info");
      this.render();
    }
  }

  // ==========================================================================
  // FLOWAI ASSISTANT (SPEC #21)
  // ==========================================================================
  renderFlowAIComponents() {
    return `
      <!-- Floating Trigger Button -->
      <button class="flowai-floating-btn" onclick="window.worknexApp.toggleFlowAIDrawer()" title="FlowAI Executive Decision Assistant">
        <span class="flowai-sparkle">✨</span>
        <span style="font-weight:600; font-size:13.5px;">FlowAI Assistant</span>
      </button>

      <!-- Slide-Out Drawer -->
      <div id="flowai-drawer" class="flowai-drawer">
        <div class="flowai-drawer-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg, #6366F1, #8B5CF6); display:flex; align-items:center; justify-content:center; color:#FFFFFF;">✨</div>
            <div>
              <strong style="font-size:15px; color:var(--primary-navy);">FlowAI Decision Support</strong>
              <div style="font-size:11px; color:var(--text-muted);">Asynchronous project intelligence</div>
            </div>
          </div>
          <button class="modal-close-btn" onclick="window.worknexApp.closeFlowAIDrawer()">✕</button>
        </div>

        <div id="flowai-messages" class="flowai-drawer-body">
          <div class="flowai-msg-bubble ai">
            <strong>Hello Avni.</strong> I am FlowAI, your decision intelligence assistant.
            <div style="margin-top:6px; font-size:12.5px; color:var(--text-secondary);">
              Ask me about unresolved blockers, silent delays, team progress, or verified collaboration credits:
            </div>
          </div>

          <!-- Suggested Query Chips -->
          <div class="flowai-chips-container">
            ${this.aiEngine.suggestedQueries.map(q => `
              <button class="flowai-chip" onclick="window.worknexApp.askFlowAI('${q}')">
                💬 "${q}"
              </button>
            `).join("")}
          </div>
        </div>

        <div class="flowai-drawer-footer">
          <form class="flowai-input-form" onsubmit="event.preventDefault(); window.worknexApp.handleFlowAISubmit();">
            <input 
              type="text" 
              id="flowai-user-input" 
              class="flowai-input" 
              placeholder="Ask FlowAI a project question..." 
              autocomplete="off"
            />
            <button type="submit" class="btn btn-sm btn-ai">Ask</button>
          </form>
        </div>
      </div>
    `;
  }

  toggleFlowAIDrawer() {
    const el = document.getElementById("flowai-drawer");
    if (el) el.classList.toggle("open");
  }

  closeFlowAIDrawer() {
    const el = document.getElementById("flowai-drawer");
    if (el) el.classList.remove("open");
  }

  handleFlowAISubmit() {
    const input = document.getElementById("flowai-user-input");
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    input.value = "";
    this.askFlowAI(query);
  }

  askFlowAI(query) {
    const drawer = document.getElementById("flowai-drawer");
    if (drawer && !drawer.classList.contains("open")) {
      drawer.classList.add("open");
    }

    const container = document.getElementById("flowai-messages");
    if (!container) return;

    // Append User message
    const userMsg = document.createElement("div");
    userMsg.className = "flowai-msg-bubble user";
    userMsg.textContent = query;
    container.appendChild(userMsg);

    // Process through FlowAI engine
    const response = this.aiEngine.processQuery(query);

    // Append AI response
    const aiMsg = document.createElement("div");
    aiMsg.className = "flowai-msg-bubble ai";
    aiMsg.innerHTML = `
      <div style="font-weight:700; color:var(--primary-navy); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
        <span>✨</span> ${response.title || 'FlowAI Telemetry'}
      </div>
      ${response.html}
    `;
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;
  }

  // ==========================================================================
  // DEMO MODE QUICK DRAWER (SPEC #26)
  // ==========================================================================
  renderDemoDrawer() {
    return `
      <div id="demo-mode-drawer" class="demo-mode-drawer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <strong style="font-size:14.5px; color:var(--primary-navy);">Hackathon Simulation Controls</strong>
            <div style="font-size:11.5px; color:var(--text-muted);">Simulate live event scenarios for evaluators</div>
          </div>
          <button class="modal-close-btn" onclick="window.worknexApp.closeDemoDrawer()">✕</button>
        </div>

        <div class="demo-action-btn-list">
          <div class="demo-action-item" onclick="window.worknexApp.demoController.generateDailyDigest()">
            <span>📋 Generate AI Daily Digest</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" onclick="window.worknexApp.demoController.simulateRecurringBlocker()">
            <span>🔴 3-Day Recurring Blocker (Red Flag)</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" onclick="window.worknexApp.demoController.simulateSilentDelay()">
            <span>⏳ Silent Delay (7 Days Pending)</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" onclick="window.worknexApp.demoController.simulateEmployeeLeave()">
            <span>👤 Employee Leave & Reassignment</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" onclick="window.worknexApp.demoController.simulateCrossTeamBlocker()">
            <span>🌐 Cross-Team Blocker Detection</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" onclick="window.worknexApp.demoController.generateCollaborationMeeting()">
            <span>📅 Generate Collaboration Meeting</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" onclick="window.worknexApp.demoController.generateWeeklyReport()">
            <span>📊 Generate Weekly Velocity Report</span>
            <span>→</span>
          </div>
          <div class="demo-action-item" style="border-color:#FECACA; color:#B91C1C;" onclick="window.worknexApp.demoController.resetDemo()">
            <span>🔄 Reset to Baseline Telemetry</span>
            <span>↺</span>
          </div>
        </div>
      </div>
    `;
  }

  toggleDemoDrawer() {
    const el = document.getElementById("demo-mode-drawer");
    if (el) {
      el.style.display = el.style.display === "block" ? "none" : "block";
    }
  }

  closeDemoDrawer() {
    const el = document.getElementById("demo-mode-drawer");
    if (el) el.style.display = "none";
  }

  // ==========================================================================
  // GLOBAL SEARCH (SPEC #22)
  // ==========================================================================
  openGlobalSearch() {
    this.openModal("modal-global-search");
    setTimeout(() => {
      const input = document.getElementById("global-search-input");
      if (input) input.focus();
    }, 100);
  }

  handleGlobalSearchInput(query) {
    const q = (query || "").trim().toLowerCase();
    const resultsContainer = document.getElementById("global-search-results");
    if (!resultsContainer) return;

    if (!q) {
      resultsContainer.innerHTML = `<div style="font-size:13px; color:var(--text-muted); text-align:center; padding:20px;">Type to search across projects, teams, tasks, blockers, achievements, and credits...</div>`;
      return;
    }

    const state = this.store.getState();
    const results = [];

    // Search Projects
    state.projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) {
        results.push({ type: "Project", title: p.name, subtitle: `${p.code} • ${p.progress}% progress`, action: () => { this.closeAllModals(); this.navigateTo("projects"); } });
      }
    });

    // Search Teams
    state.teams.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.workArea.toLowerCase().includes(q)) {
        results.push({ type: "Team", title: t.name, subtitle: `${t.workArea} • Lead: ${t.lead}`, action: () => { this.closeAllModals(); this.openTeamDetailModal(t.id); } });
      }
    });

    // Search Tasks
    state.tasks.forEach(task => {
      if (task.workArea.toLowerCase().includes(q) || task.employee.toLowerCase().includes(q)) {
        results.push({ type: "Task", title: task.workArea, subtitle: `Assigned: ${task.employee} (${task.team}) • ${task.status}`, action: () => { this.closeAllModals(); this.navigateTo("tasks"); } });
      }
    });

    // Search Blockers
    state.blockers.forEach(b => {
      if (b.title.toLowerCase().includes(q) || b.affectedWorkArea.toLowerCase().includes(q)) {
        results.push({ type: "Blocker", title: `🔴 ${b.title}`, subtitle: `${b.team} • ${b.affectedWorkArea} (${b.daysActive} days active)`, action: () => { this.closeAllModals(); this.navigateTo("blockers"); } });
      }
    });

    // Search Credits
    state.employeeCredits.forEach(c => {
      if (c.employee.toLowerCase().includes(q) || c.reason.toLowerCase().includes(q)) {
        results.push({ type: "Credits", title: `${c.employee} (+${c.credits} pts)`, subtitle: c.reason, action: () => { this.closeAllModals(); this.navigateTo("credits"); } });
      }
    });

    if (results.length === 0) {
      resultsContainer.innerHTML = `<div style="font-size:13px; color:var(--text-muted); text-align:center; padding:20px;">No matching results found for "${query}".</div>`;
      return;
    }

    resultsContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${results.slice(0, 10).map((r, i) => `
          <div 
            style="padding:10px 14px; background:#F8FAFC; border:1px solid var(--border-light); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; cursor:pointer;"
            onclick="window.worknexApp.executeSearchResult(${i})"
          >
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge badge-neutral" style="font-size:10px;">${r.type}</span>
                <strong style="font-size:13.5px; color:var(--primary-navy);">${r.title}</strong>
              </div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${r.subtitle}</div>
            </div>
            <span style="font-size:12px; color:var(--ms-blue);">Open →</span>
          </div>
        `).join("")}
      </div>
    `;
    this._currentSearchResults = results;
  }

  executeSearchResult(index) {
    if (this._currentSearchResults && this._currentSearchResults[index]) {
      this._currentSearchResults[index].action();
    }
  }

  // ==========================================================================
  // HELPERS (Modals, Toasts, Badges)
  // ==========================================================================
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = "flex";
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = "none";
  }

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.style.display = "none");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "🔴";
    if (type === "ai") icon = "✨";

    toast.innerHTML = `
      <div style="font-size:18px;">${icon}</div>
      <div style="flex:1; font-size:13px; font-weight:500; color:var(--primary-navy);">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  getStatusBadgeClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "badge-success";
    if (s === "in progress") return "badge-info";
    if (s === "pending") return "badge-warning";
    if (s === "blocked") return "badge-danger";
    if (s === "overdue") return "badge-danger";
    return "badge-neutral";
  }

  getInitials(name) {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(name) {
    const colors = ["#0078D4", "#6366F1", "#10B981", "#F59E0B", "#8B5CF6", "#0284C7", "#0F172A"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  bindGlobalEvents() {
    // Window click outside closes dropdowns
  }
}

// Global initialization
window.worknexApp = new WorknexApp(
  window.worknexStore,
  window.worknexCharts,
  window.worknexDemoController,
  new window.FlowAIEngine(window.worknexStore)
);
