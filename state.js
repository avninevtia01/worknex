/**
 * WORKNEX State Management & Event Bus
 * Microsoft Global Hackathon Prototype
 * "Less status chasing. More progress."
 *
 * UNIFIED SINGLE SOURCE OF TRUTH:
 * Powers both the Manager Portal (Avni) and Employee Portal (Aadarsh).
 * Manages shared state, cross-portal synchronization, role-based auth,
 * daily updates, peer collaboration, and verified credit transactions.
 */

class WorknexStore {
  constructor() {
    this.storageKey = "worknex_unified_state_v4";
    this.activeRoleKey = "worknex_active_role_v2";
    this.managerAuthKey = "worknex_auth_token_v2";
    this.employeeAuthKey = "worknex_employee_auth_v2";
    this.listeners = [];
    this.init();
  }

  init() {
    // Clear legacy storage keys if present
    try {
      localStorage.removeItem("worknex_manager_state_v1");
      localStorage.removeItem("worknex_manager_state_v2");
      localStorage.removeItem("worknex_unified_state_v3");
    } catch (e) {}

    // Check Active Role ('manager' | 'employee' | null)
    this.activeRole = localStorage.getItem(this.activeRoleKey) || null;
    this.isManagerAuthenticated = this.activeRole === "manager";
    this.isEmployeeAuthenticated = this.activeRole === "employee";

    // Load unified state from localStorage or initialize with clean seed data
    const savedState = localStorage.getItem(this.storageKey);
    if (savedState) {
      try {
        this.state = JSON.parse(savedState);
        // Ensure new required data structures are present
        if (!this.state.aadarshAttendanceHistory) {
          this.state.aadarshAttendanceHistory = JSON.parse(JSON.stringify(window.WORKNEX_INITIAL_DATA.aadarshAttendanceHistory || []));
        }
      } catch (e) {
        this.state = JSON.parse(JSON.stringify(window.WORKNEX_INITIAL_DATA || {}));
      }
    } else {
      this.state = JSON.parse(JSON.stringify(window.WORKNEX_INITIAL_DATA || {}));
      if (this.state.suggestedMeetings && this.state.suggestedMeetings.length > 0) {
        this.state.suggestedMeetings[0].status = "Suggested";
      }
      this.persist();
    }

    // Real-time cross-tab / cross-window synchronization
    window.addEventListener("storage", (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          this.state = JSON.parse(e.newValue);
          this.notify();
        } catch (err) {
          console.error("Error syncing state from storage event:", err);
        }
      }
    });
  }

  // Backward compatibility property for Manager App
  get isAuthenticated() {
    return this.isManagerAuthenticated;
  }

  set isAuthenticated(val) {
    this.isManagerAuthenticated = !!val;
  }

  getState() {
    return this.state;
  }

  persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Storage quota exceeded or error saving to localStorage:", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error("Error in state subscriber:", err);
      }
    });
  }

  // ==========================================
  // Role-Based Authentication
  // ==========================================

  // Universal Login Gateway
  login(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (cleanEmail.includes("aadarsh")) {
      return this.loginEmployee(email, password);
    }
    return this.loginManager(email, password);
  }

  // Manager Authentication (Avni)
  loginManager(email, password) {
    const validEmail = "avni@worknex.demo";
    const validPassword = "Manager@123";

    const trimmedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if ((trimmedEmail === validEmail.toLowerCase() || trimmedEmail === "avni") && cleanPassword === validPassword) {
      this.activeRole = "manager";
      this.isManagerAuthenticated = true;
      this.isEmployeeAuthenticated = false;
      localStorage.setItem(this.activeRoleKey, "manager");
      localStorage.setItem(this.managerAuthKey, "true");
      this.logActivity("Avni", "Sign In", "Authenticated into Manager Portal");
      this.notify();
      return { success: true, role: "Manager", user: "Avni" };
    } else {
      return { success: false, message: "Invalid credentials. Use avni@worknex.demo / Manager@123" };
    }
  }

  logoutManager() {
    this.activeRole = null;
    this.isManagerAuthenticated = false;
    localStorage.removeItem(this.activeRoleKey);
    localStorage.removeItem(this.managerAuthKey);
    this.logActivity("Avni", "Sign Out", "Manager session ended");
    this.notify();
  }

  logout() {
    this.logoutManager();
  }

  // Employee Authentication (Aadarsh)
  loginEmployee(email, password) {
    const validEmail = "aadarsh@worknex.demo";
    const validPassword = "Employee@123";

    const trimmedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if ((trimmedEmail === validEmail.toLowerCase() || trimmedEmail === "aadarsh") && cleanPassword === validPassword) {
      this.activeRole = "employee";
      this.isEmployeeAuthenticated = true;
      this.isManagerAuthenticated = false;
      localStorage.setItem(this.activeRoleKey, "employee");
      localStorage.setItem(this.employeeAuthKey, "true");
      this.logActivity("Aadarsh", "Sign In", "Authenticated into Employee Portal");
      this.notify();
      return { success: true, role: "Employee", user: "Aadarsh", employee: this.getCurrentEmployee() };
    } else {
      return { success: false, message: "Invalid credentials. Use aadarsh@worknex.demo / Employee@123" };
    }
  }

  logoutEmployee() {
    this.activeRole = null;
    this.isEmployeeAuthenticated = false;
    localStorage.removeItem(this.activeRoleKey);
    localStorage.removeItem(this.employeeAuthKey);
    this.logActivity("Aadarsh", "Sign Out", "Employee session ended");
    this.notify();
  }

  getCurrentEmployee() {
    if (!this.state.employees) return { id: "emp-aadarsh", name: "Aadarsh", roleTitle: "Software Engineer", teamId: "team-alpha", email: "aadarsh@worknex.demo", credits: 150, avatarColor: "#0078D4", status: "Present" };
    const emp = this.state.employees.find(e => e.email === "aadarsh@worknex.demo" || e.name === "Aadarsh");
    if (emp) {
      if (!emp.credits) emp.credits = 150;
      return emp;
    }
    return {
      id: "emp-aadarsh",
      name: "Aadarsh",
      roleTitle: "Software Engineer",
      teamId: "team-alpha",
      email: "aadarsh@worknex.demo",
      credits: 150,
      avatarColor: "#0078D4",
      status: "Present"
    };
  }

  // ==========================================
  // SHARED DATA FLOW: Employee Daily Update
  // ==========================================
  submitDailyUpdate(employeeName, updateData) {
    const emp = this.state.employees.find(e => e.name === employeeName) || this.getCurrentEmployee();
    const dateStr = updateData.date || "4 Oct 2026";

    const isBlocked = updateData.isBlocked === true || updateData.isBlocked === "yes" || updateData.isBlocked === "Yes";
    const blockerReason = isBlocked ? (updateData.blockerReason || "API Access") : "None";
    const workArea = updateData.workArea || "Software Integration";
    const status = isBlocked ? "Pending" : "Completed";
    const attendance = updateData.attendance || "Present";

    // 0. Update voluntary attendance history for employee (Requirement 3: Zero surveillance)
    if (employeeName === "Aadarsh") {
      if (!this.state.aadarshAttendanceHistory) {
        this.state.aadarshAttendanceHistory = [
          { date: "1 Oct", status: "Present" },
          { date: "2 Oct", status: "Present" },
          { date: "3 Oct", status: "On Leave" },
          { date: "4 Oct", status: "Present" }
        ];
      }
      const existingAttIdx = this.state.aadarshAttendanceHistory.findIndex(a => a.date === "4 Oct" || a.date === dateStr);
      if (existingAttIdx >= 0) {
        this.state.aadarshAttendanceHistory[existingAttIdx].status = attendance;
      } else {
        this.state.aadarshAttendanceHistory.push({ date: "4 Oct", status: attendance });
      }
    }
    if (emp) {
      emp.status = attendance;
    }

    // Build raw update string for zero-hallucination processing
    const rawMessage = updateData.rawMessage || 
      `Work: ${updateData.whatWorkedOn || 'Core feature implementation'}. Completed: ${updateData.whatCompleted || 'UI components'}. Pending: ${updateData.whatPending || (isBlocked ? 'Software pending because API access is unavailable' : 'None')}.${isBlocked ? ' Blocker: ' + blockerReason : ''}. Attendance: ${attendance}`;

    // 1. Add to shared dailyDigest (Organized team-wise, read-only for Manager)
    const newDigestEntry = {
      id: "digest-" + Date.now(),
      teamId: emp.teamId || "team-alpha",
      teamName: "Team Alpha",
      employeeId: emp.id || "emp-aadarsh",
      employeeName: employeeName,
      workArea: workArea,
      status: status,
      blocker: blockerReason,
      attendance: attendance,
      challenge: updateData.challenge || (isBlocked ? "API Integration latency" : "None"),
      date: dateStr,
      isRecurringBlocker: isBlocked,
      consecutiveDays: isBlocked ? 2 : 1,
      sourceMessage: rawMessage,
      extractedInfo: {
        workArea: workArea,
        status: status,
        blocker: blockerReason,
        attendance: attendance,
        confidence: 0.99
      }
    };

    // Replace or unshift in dailyDigest
    const existingIndex = this.state.dailyDigest.findIndex(d => d.employeeName === employeeName && (d.date === dateStr || d.date === "29 September 2026"));
    if (existingIndex >= 0) {
      this.state.dailyDigest[existingIndex] = newDigestEntry;
    } else {
      this.state.dailyDigest.unshift(newDigestEntry);
    }

    // 2. Synchronize shared Blocker Center
    if (isBlocked) {
      const existingBlocker = this.state.blockers.find(b => b.assignedEmployee === employeeName && b.status !== "Resolved");
      if (existingBlocker) {
        existingBlocker.title = blockerReason;
        existingBlocker.status = "Unresolved";
        existingBlocker.lastReported = dateStr;
      } else {
        this.state.blockers.unshift({
          id: "blocker-" + Date.now(),
          title: blockerReason,
          team: "Team Alpha",
          teamId: "team-alpha",
          affectedWorkArea: "Software Integration",
          assignedEmployee: employeeName,
          daysActive: 2,
          isRecurring: true,
          severity: "High",
          status: "Unresolved",
          sourceUpdateId: newDigestEntry.id,
          reportedDate: "2026-09-27",
          lastReported: "2026-09-29",
          consecutiveDays: 2,
          sourceExcerpt: rawMessage,
          impact: "Blocks downstream microservices and client telemetry tests. Cross-team dependency detected."
        });
      }

      // Update task in tasks array
      const task = this.state.tasks.find(t => t.employee === employeeName && (t.workArea.toLowerCase().includes("fix api") || t.workArea.toLowerCase().includes("software")));
      if (task) {
        task.status = "Incomplete";
        task.blocker = blockerReason;
        task.progress = 40;
      }
    } else {
      // Clear blocker if marked not blocked
      const existingBlocker = this.state.blockers.find(b => b.assignedEmployee === employeeName && b.status !== "Resolved");
      if (existingBlocker) {
        existingBlocker.status = "Resolved";
      }
      const task = this.state.tasks.find(t => t.employee === employeeName && (t.workArea.toLowerCase().includes("fix api") || t.workArea.toLowerCase().includes("software")));
      if (task) {
        task.status = "Completed";
        task.blocker = "None";
        task.progress = 100;
      }
    }

    // 3. Log immutable activity
    this.logActivity("FlowAI Engine", "AI detected daily updates", `${employeeName}'s daily update processed: ${workArea} ${status} (Attendance: ${attendance}${blockerReason !== 'None' ? ', Blocker: ' + blockerReason : ', No blockers'})`);

    this.persist();
    return { success: true, digest: newDigestEntry, structured: newDigestEntry.extractedInfo };
  }

  // ==========================================================================
  // SHARED DATA FLOW: TWO-WAY COLLABORATION HUB
  // ==========================================================================

  // CASE A: Aadarsh offers help to another employee (Rishabh)
  aadarshHelpsRishabh(taskTitle = "API Integration", blockerTitle = "API Access", creditPoints = 30) {
    const aadarsh = this.state.employees.find(e => e.name === "Aadarsh") || this.getCurrentEmployee();
    const prevCredits = aadarsh.credits || 150;
    const newTotal = prevCredits + creditPoints;
    aadarsh.credits = newTotal;

    // 1. Append verified credit transaction log into shared employeeCredits
    const creditEntry = {
      id: "cred-" + Date.now(),
      employee: "Aadarsh",
      credits: newTotal,
      change: `+${creditPoints}`,
      reason: `Helped Rishabh resolve ${taskTitle} blocker`,
      date: "29 Sept 2026"
    };
    this.state.employeeCredits.unshift(creditEntry);

    // 2. Resolve Rishabh's Blocker in shared blockers list
    const rishabhBlocker = this.state.blockers.find(b => (b.assignedEmployee === "Rishabh" || b.id === "blocker-rishabh-api") && b.status !== "Resolved");
    if (rishabhBlocker) {
      rishabhBlocker.status = "Resolved";
      rishabhBlocker.resolvedBy = "Aadarsh";
      rishabhBlocker.resolutionDate = "29 Sept 2026";
      rishabhBlocker.impact = "Resolved with peer assistance from Aadarsh (Software Engineer • Team Alpha).";
    }

    // 3. Mark Rishabh's Task Completed
    const rishabhTask = this.state.tasks.find(t => t.employee === "Rishabh" && t.workArea.toLowerCase().includes("api"));
    if (rishabhTask) {
      rishabhTask.status = "Completed";
      rishabhTask.progress = 100;
      rishabhTask.blocker = "None";
    }

    // 4. Notifications
    this.state.notifications.unshift({
      id: "notif-cred-" + Date.now(),
      type: "credit",
      severity: "success",
      title: "Credits Earned (+30 Credits)",
      message: `You earned +30 Credits! Helped Rishabh resolve ${taskTitle} blocker. Total: ${newTotal} Credits.`,
      timestamp: "Just now",
      date: "2026-09-29",
      unread: true,
      forEmployee: "Aadarsh",
      badgeColor: "#10B981"
    });

    this.state.notifications.unshift({
      id: "notif-mgr-collab-" + Date.now(),
      type: "completion",
      severity: "success",
      title: "Collaboration Help Completed",
      message: `Aadarsh earned +${creditPoints} credits helping Rishabh resolve ${taskTitle} blocker.`,
      relatedTeam: "Team Alpha & Team Beta",
      relatedWork: taskTitle,
      timestamp: "Just now",
      date: "2026-09-29",
      unread: true,
      actionRoute: "credits",
      actionLabel: "View Credits",
      badgeColor: "#10B981"
    });

    // 5. Add achievement
    this.state.employeeAchievements.unshift({
      id: "ach-" + Date.now(),
      employee: "Aadarsh",
      achievement: `Helped resolve ${taskTitle} blocker`,
      project: "Cross-Team Unblocking",
      date: "29 September 2026",
      description: `Assisted Rishabh in resolving ${blockerTitle} dependency via token exchange.`
    });

    this.logActivity(
      "Collaboration Hub",
      "Verified peer help completed",
      `Aadarsh helped Rishabh resolve ${blockerTitle} (+${creditPoints} credits awarded to Aadarsh, total: ${newTotal})`
    );

    this.persist();
    return { success: true, helper: "Aadarsh", newCredits: newTotal, points: creditPoints, reason: creditEntry.reason };
  }

  // CASE B: Someone helps Aadarsh (Rishabh helps Aadarsh)
  rishabhHelpsAadarsh(taskTitle = "Software Integration", blockerTitle = "API Access", creditPoints = 30) {
    const helperName = "Rishabh";
    const helpeeName = "Aadarsh";

    // 1. Update Helper's Credit Total in shared employees record
    const helper = this.state.employees.find(e => e.name === helperName);
    const prevCredits = helper ? (helper.credits || 50) : 50;
    const newCreditTotal = prevCredits + creditPoints; // 80 Credits

    if (helper) {
      helper.credits = newCreditTotal;
    }

    // 2. Append verified credit transaction log into shared employeeCredits
    const creditEntry = {
      id: "cred-" + Date.now(),
      employee: helperName,
      credits: newCreditTotal, // 80 Credits
      change: `+${creditPoints}`,
      reason: `+${creditPoints} — Helped ${helpeeName} resolve ${taskTitle} blocker`,
      date: "29 Sept 2026"
    };

    // Unshift so it appears at top of Manager Portal credits list
    this.state.employeeCredits.unshift(creditEntry);

    // 3. Resolve the Blocker in shared blockers list
    const blocker = this.state.blockers.find(b => b.assignedEmployee === helpeeName && b.status !== "Resolved");
    if (blocker) {
      blocker.status = "Resolved";
      blocker.resolvedBy = helperName;
      blocker.resolutionDate = "29 Sept 2026";
      blocker.impact = `Resolved with peer assistance from ${helperName} (${helper ? helper.roleTitle : 'Senior Backend Engineer'}).`;
    }

    // 4. Update the Task status to Completed / Unblocked
    const task = this.state.tasks.find(t => t.employee === helpeeName && (t.workArea.toLowerCase().includes("fix api") || t.workArea.toLowerCase().includes("software")));
    if (task) {
      task.status = "Completed";
      task.progress = 100;
      task.blocker = "None";
    }

    // 5. Shared Notifications
    this.state.notifications.unshift({
      id: "notif-collab-" + Date.now(),
      type: "completion",
      severity: "success",
      title: "Collaboration Help Completed",
      message: `${helperName} earned +${creditPoints} credits helping ${helpeeName} resolve ${taskTitle} blocker.`,
      relatedTeam: "Team Beta & Team Alpha",
      relatedWork: taskTitle,
      timestamp: "Just now",
      date: "2026-09-29",
      unread: true,
      actionRoute: "credits",
      actionLabel: "View Credits",
      badgeColor: "#10B981"
    });

    this.state.notifications.unshift({
      id: "notif-emp-" + Date.now(),
      type: "resolution",
      severity: "success",
      title: "Blocker Resolved via Collaboration",
      message: `${helperName} helped resolve ${blockerTitle}. Task '${taskTitle}' is now unblocked.`,
      timestamp: "Just now",
      date: "2026-09-29",
      unread: true,
      forEmployee: helpeeName,
      badgeColor: "#10B981"
    });

    this.logActivity(
      "Collaboration Hub",
      "Verified peer help completed",
      `${helperName} helped ${helpeeName} resolve ${blockerTitle} (+${creditPoints} credits awarded, total: ${newCreditTotal})`
    );

    this.persist();

    return {
      success: true,
      helper: helperName,
      newCredits: newCreditTotal,
      previousCredits: prevCredits,
      pointsAwarded: creditPoints,
      reason: creditEntry.reason
    };
  }

  // Alias for backward compatibility
  resolveCollaborationHelp(helperName = "Rishabh", helpeeName = "Aadarsh", taskTitle = "Software Integration", blockerTitle = "API Access", creditPoints = 30) {
    if (helperName === "Aadarsh") {
      return this.aadarshHelpsRishabh(taskTitle, blockerTitle, creditPoints);
    }
    return this.rishabhHelpsAadarsh(taskTitle, blockerTitle, creditPoints);
  }

  // Requirement 8 & 9: Contributor updates task status (Priority is STRICTLY read-only)
  updateTaskStatus(taskId, newStatus, newProgress, newBlocker) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = newStatus || task.status;
    if (newProgress !== undefined && newProgress !== null) {
      task.progress = parseInt(newProgress, 10);
    }
    if (newBlocker !== undefined) {
      task.blocker = newBlocker;
    }
    if (task.status === "Completed") {
      task.progress = 100;
      task.blocker = "None";
      const b = this.state.blockers.find(b => b.assignedEmployee === task.employee && b.status !== "Resolved");
      if (b) b.status = "Resolved";
    }

    this.logActivity(task.employee || "Aadarsh", "Updated Task Status", `${task.workArea} marked ${task.status} (${task.progress}%)`);
    this.persist();
    return task;
  }

  // Demo Reset helper for live presentations
  resetCollaborationDemo() {
    const aadarshTask = this.state.tasks.find(t => t.employee === "Aadarsh" && (t.workArea.toLowerCase().includes("fix api") || t.workArea.toLowerCase().includes("software")));
    if (aadarshTask) {
      aadarshTask.status = "Incomplete";
      aadarshTask.progress = 40;
      aadarshTask.blocker = "API Access";
    }
    const aadarshBlocker = this.state.blockers.find(b => b.assignedEmployee === "Aadarsh");
    if (aadarshBlocker) {
      aadarshBlocker.status = "Unresolved";
      aadarshBlocker.resolvedBy = null;
    }

    const rishabhTask = this.state.tasks.find(t => t.employee === "Rishabh" && t.workArea.toLowerCase().includes("api"));
    if (rishabhTask) {
      rishabhTask.status = "Blocked";
      rishabhTask.progress = 45;
      rishabhTask.blocker = "API Access";
    }
    const rishabhBlocker = this.state.blockers.find(b => b.assignedEmployee === "Rishabh" || b.id === "blocker-rishabh-api");
    if (rishabhBlocker) {
      rishabhBlocker.status = "Unresolved";
      rishabhBlocker.resolvedBy = null;
    }

    this.persist();
    return true;
  }

  // ==========================================
  // Activity Logging (Audit Trail)
  // ==========================================
  logActivity(actor, action, related) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = "29 Sept 2026";

    const entry = {
      id: "act-" + Date.now(),
      date: dateStr,
      time: timeStr,
      action: action,
      actor: actor || "Avni (Manager)",
      related: related || "Project Telemetry"
    };

    if (!this.state.activityLogs) this.state.activityLogs = [];
    this.state.activityLogs.unshift(entry);
    if (this.state.activityLogs.length > 50) {
      this.state.activityLogs.pop();
    }
  }

  // ==========================================
  // Project Selection
  // ==========================================
  selectProject(projectId) {
    const proj = this.state.projects.find(p => p.id === projectId);
    if (proj) {
      this.state.selectedProjectId = projectId;
      this.logActivity("Avni", "Switched Project", `Active view changed to ${proj.name}`);
      this.persist();
    }
  }

  // ==========================================
  // Blocker Management (Manager Decisions)
  // ==========================================
  reviewBlocker(blockerId) {
    const blocker = this.state.blockers.find(b => b.id === blockerId);
    if (blocker) {
      blocker.status = "In Progress";
      this.logActivity("Avni", "Reviewed Blocker", `${blocker.title} (${blocker.team}) marked in review`);
      this.persist();
      return blocker;
    }
    return null;
  }

  dismissBlockerAlert(blockerId) {
    const blocker = this.state.blockers.find(b => b.id === blockerId);
    if (blocker) {
      blocker.dismissedAlert = true;
      this.logActivity("Avni", "Dismissed Alert", `Alert dismissed for ${blocker.title}`);
      this.persist();
    }
  }

  // ==========================================
  // Suggested Meeting Actions
  // ==========================================
  createMeeting(meetingId) {
    const meeting = this.state.suggestedMeetings.find(m => m.id === meetingId) || this.state.suggestedMeetings[0];
    if (meeting) {
      meeting.status = "Created";
      this.logActivity("Avni", "Collaboration meeting suggested", `${meeting.issue} (Sync scheduled)`);
      this.persist();
      return meeting;
    }
    return null;
  }

  dismissMeeting(meetingId) {
    const meeting = this.state.suggestedMeetings.find(m => m.id === meetingId) || this.state.suggestedMeetings[0];
    if (meeting) {
      meeting.status = "Dismissed";
      this.logActivity("Avni", "Dismissed Meeting Suggestion", `${meeting.issue}`);
      this.persist();
    }
  }

  clearMeetingData() {
    if (this.state.suggestedMeetings && this.state.suggestedMeetings.length > 0) {
      this.state.suggestedMeetings[0].status = "Suggested";
      this.state.suggestedMeetings[0].createdDate = null;
    }
    if (this.state.activityLogs) {
      this.state.activityLogs = this.state.activityLogs.filter(a => !(a.action && a.action.toLowerCase().includes("sync scheduled")));
    }
    this.persist();
    return true;
  }

  // ==========================================
  // Leave & Work Reassignment
  // ==========================================
  approveReassignment(reassignId) {
    const item = this.state.leaveReassignments.find(r => r.id === reassignId) || this.state.leaveReassignments[0];
    if (item) {
      item.statusState = "Approved";
      this.logActivity("Avni", "Reassignment suggestion generated", `Reassigned ${item.affectedWork} to ${item.suggestedAssignee}`);
      this.persist();
      return item;
    }
    return null;
  }

  // ==========================================
  // Demo Mode Simulations
  // ==========================================
  simulateDailyDigest() {
    this.logActivity("FlowAI Engine", "AI detected daily updates", "Processed 8 employee updates asynchronously");
    this.persist();
    return true;
  }

  simulateRecurringBlocker() {
    const blocker = this.state.blockers.find(b => b.id === "blocker-1");
    if (blocker) {
      blocker.daysActive = 3;
      blocker.consecutiveDays = 3;
      blocker.isRecurring = true;
      blocker.dismissedAlert = false;
    }
    this.logActivity("FlowAI Engine", "Recurring blocker flagged", "API Access has appeared for 3 consecutive days");
    this.persist();
    return true;
  }

  simulateSilentDelay() {
    const delay = this.state.silentDelays[0];
    if (delay) {
      delay.durationDays = 7;
    }
    this.logActivity("FlowAI Engine", "Silent delay flagged", "Backend Integration (Team Beta) pending for 7 days");
    this.persist();
    return true;
  }

  simulateEmployeeLeave() {
    const emp = this.state.employees.find(e => e.id === "emp-rishabh");
    if (emp) {
      emp.status = "On Leave";
    }
    this.logActivity("FlowAI Engine", "Leave detected", "Rishabh marked On Leave; reassignment suggestion generated");
    this.persist();
    return true;
  }

  simulateCrossTeamBlocker() {
    const meeting = this.state.suggestedMeetings[0];
    if (meeting) {
      meeting.status = "Suggested";
    }
    this.logActivity("FlowAI Engine", "Collaboration meeting suggested", "API Access impacts Team Alpha & Team Gamma");
    this.persist();
    return true;
  }

  resetDemoData() {
    this.state = JSON.parse(JSON.stringify(window.WORKNEX_INITIAL_DATA));
    if (this.state.suggestedMeetings && this.state.suggestedMeetings.length > 0) {
      this.state.suggestedMeetings[0].status = "Suggested";
    }
    this.persist();
    return true;
  }
}

// Global shared store instance
window.worknexStore = new WorknexStore();
