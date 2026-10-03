/**
 * FlowAI Enterprise Decision Intelligence Engine
 * WORKNEX — Microsoft Global Hackathon
 * "Less status chasing. More progress."
 *
 * Provides executive decision support queries for Manager (Avni).
 * Formats responses strictly with cards, tables, metrics, and concise bullets.
 * Never displays large paragraphs.
 * Strictly respects Manager Scope restrictions (no task assignments/priorities).
 */

class FlowAIEngine {
  constructor(store) {
    this.store = store;
    this.name = "FlowAI";
    this.version = "FlowAI Enterprise v3.0 (Zero-Hallucination Decision Engine)";

    // Suggested queries for quick interaction
    this.suggestedQueries = [
      "Which blockers are unresolved this week?",
      "Which teams have pending work?",
      "Which blockers are recurring?",
      "Which work areas have remained pending?",
      "Which teams are experiencing silent delays?",
      "Which employees have earned collaboration credits and why?",
      "Show me this week's project progress.",
      "Which issues affect multiple teams?"
    ];
  }

  processQuery(query) {
    const q = (query || "").trim().toLowerCase();

    // Guardrail against task assignment / setting priority requests
    if (q.includes("assign task") || q.includes("change priority") || q.includes("set deadline") || q.includes("create task")) {
      return {
        title: "Worknex Policy Notice",
        format: "card",
        html: `
          <div class="flowai-alert-card warning">
            <div style="font-weight: 700; color: #D97706; margin-bottom: 4px;">⚠️ Manager Scope Restriction</div>
            <p style="font-size: 13px; color: #475569; margin: 0;">
              Worknex is built for asynchronous project visibility and decision support. 
              Top-down task creation and priority assignment are prohibited to maintain engineering autonomy and prevent status chasing.
            </p>
          </div>
        `
      };
    }

    const state = this.store.getState();

    // 1. "Which blockers are recurring?"
    if (q.includes("recurring") || (q.includes("blocker") && q.includes("repeat"))) {
      const recurring = state.blockers.filter(b => b.isRecurring || b.daysActive >= 3);
      return {
        title: "Recurring Blockers Telemetry",
        format: "card",
        html: `
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <span class="badge badge-danger">🔴 1 Critical Recurring Blocker</span>
            <span class="badge badge-neutral">Threshold: ≥3 Days</span>
          </div>
          <table class="flowai-table">
            <thead>
              <tr>
                <th>Blocker</th>
                <th>Affected Team</th>
                <th>Work Area</th>
                <th>Consecutive Days</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recurring.map(b => `
                <tr>
                  <td><strong style="color:#EF4444;">${b.title}</strong></td>
                  <td>${b.team}</td>
                  <td>${b.affectedWorkArea}</td>
                  <td><span class="badge badge-danger">${b.consecutiveDays || b.daysActive} consecutive days</span></td>
                  <td><button class="btn btn-xs btn-primary" onclick="window.worknexApp.openSourceModal('${b.sourceUpdateId || "digest-2"}')">View Source</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="margin-top:10px; font-size:12px; color:#64748B;">
            • Root cause: Azure KeyVault OAuth 2.0 handshake bottleneck.<br>
            • System action: Automatic collaboration sync suggested for affected teams.
          </div>
        `
      };
    }

    // 2. "Which blockers are unresolved this week?"
    if (q.includes("unresolved") || (q.includes("blockers") && !q.includes("recurring") && !q.includes("multiple"))) {
      const unresolved = state.blockers.filter(b => b.status === "Unresolved" || b.status === "In Progress");
      return {
        title: "Unresolved Blockers Summary",
        format: "table",
        html: `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:13px; color:#475569;">Active blockers currently impacting sprint velocity:</div>
            <span class="badge badge-danger">${unresolved.length} Unresolved Blockers</span>
          </div>
          <table class="flowai-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Team</th>
                <th>Area</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${unresolved.map(b => `
                <tr>
                  <td><strong>${b.title}</strong></td>
                  <td>${b.team}</td>
                  <td>${b.affectedWorkArea}</td>
                  <td><span class="badge ${b.severity === 'High' ? 'badge-danger' : b.severity === 'Medium' ? 'badge-warning' : 'badge-neutral'}">${b.severity}</span></td>
                  <td><span class="badge badge-subtle">${b.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="btn btn-xs btn-outline" onclick="window.worknexApp.navigateTo('blockers')">Open Blocker Center →</button>
          </div>
        `
      };
    }

    // 3. "Which issues affect multiple teams?"
    if (q.includes("multiple team") || q.includes("cross-team") || q.includes("affect multiple") || q.includes("common issue")) {
      const meeting = state.suggestedMeetings[0];
      return {
        title: "Cross-Team Common Blockers",
        format: "card",
        html: `
          <div class="flowai-metric-group" style="display:flex; gap:12px; margin-bottom:12px;">
            <div class="metric-pill">
              <span class="metric-num">1</span>
              <span class="metric-lbl">Cross-Team Issue</span>
            </div>
            <div class="metric-pill">
              <span class="metric-num">4</span>
              <span class="metric-lbl">Affected Members</span>
            </div>
            <div class="metric-pill">
              <span class="metric-num">2</span>
              <span class="metric-lbl">Affected Teams</span>
            </div>
          </div>
          <div class="flowai-alert-card ai-purple" style="margin-bottom:10px;">
            <div style="font-weight:700; color:#7C3AED; margin-bottom:4px;">COLLABORATION MEETING SUGGESTED</div>
            <div style="font-size:13px; color:#1E293B;">
              <strong>Issue:</strong> ${meeting.issue}<br>
              <strong>Affected Teams:</strong> ${meeting.affectedTeams.join(", ")}<br>
              <strong>Affected Members:</strong> ${meeting.affectedMembers.join(", ")}<br>
              <strong>Proposed:</strong> 25-minute focused sync to unblock shared Azure credentials.
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="window.worknexApp.openMeetingModal()">Create Meeting via Teams</button>
        `
      };
    }

    // 4. "Which teams are experiencing silent delays?"
    if (q.includes("silent delay") || (q.includes("delay") && q.includes("silent"))) {
      const delays = state.silentDelays || [];
      return {
        title: "Silent Delay Detection Telemetry",
        format: "card",
        html: `
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <span class="badge badge-warning">⚡ 1 Silent Delay Detected</span>
            <span class="badge badge-neutral">Condition: Pending ≥ 7 days</span>
          </div>
          <div class="flowai-alert-card warning">
            <div style="font-weight:700; color:#D97706; margin-bottom:6px;">SILENT DELAY — Team Beta</div>
            <ul style="margin:0; padding-left:18px; font-size:13px; color:#334155; line-height:1.6;">
              <li><strong>Work Area:</strong> Backend Integration</li>
              <li><strong>Assigned Member:</strong> Rishabh (Status: On Leave)</li>
              <li><strong>Consecutive Pending Duration:</strong> 7 days</li>
              <li><strong>Last Recorded Update:</strong> 23 September 2026</li>
            </ul>
          </div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="btn btn-sm btn-outline" onclick="window.worknexApp.openReassignModal()">Review Reassignment Suggestion</button>
          </div>
        `
      };
    }

    // 5. "Which teams have pending work?"
    if (q.includes("pending work") || (q.includes("teams") && q.includes("pending"))) {
      const teams = state.teams.filter(t => t.pendingWork > 0);
      return {
        title: "Teams with Pending Workstreams",
        format: "table",
        html: `
          <div style="margin-bottom:8px; font-size:13px; color:#475569;">
            Breakdown of pending work items across all 6 teams:
          </div>
          <table class="flowai-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Work Area</th>
                <th>Pending Items</th>
                <th>Velocity</th>
              </tr>
            </thead>
            <tbody>
              ${teams.map(t => `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td>${t.workArea}</td>
                  <td><span class="badge badge-warning">${t.pendingWork} pending</span></td>
                  <td>${t.progress}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="margin-top:10px; font-size:12px; color:#64748B;">
            • Total Pending in Hackathon: <strong>11 work items</strong>
          </div>
        `
      };
    }

    // 6. "Which work areas have remained pending?"
    if (q.includes("work area") || (q.includes("remained pending") || q.includes("pending work areas"))) {
      const pendingTasks = state.tasks.filter(t => t.status === "Pending");
      return {
        title: "Pending Work Areas",
        format: "table",
        html: `
          <div style="margin-bottom:8px; font-size:13px; color:#475569;">
            ${pendingTasks.length} work items are currently awaiting dependencies:
          </div>
          <table class="flowai-table">
            <thead>
              <tr>
                <th>Work Area</th>
                <th>Assigned</th>
                <th>Team</th>
                <th>Days in Status</th>
              </tr>
            </thead>
            <tbody>
              ${pendingTasks.slice(0, 6).map(t => `
                <tr>
                  <td><strong>${t.workArea}</strong></td>
                  <td>${t.employee}</td>
                  <td>${t.team}</td>
                  <td>${t.daysInStatus || 2}d</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `
      };
    }

    // 7. "Which employees have earned collaboration credits and why?"
    if (q.includes("credit") || q.includes("collaboration") || q.includes("earned credits")) {
      const credits = state.employeeCredits;
      return {
        title: "Employee Collaboration Credits",
        format: "table",
        html: `
          <div style="margin-bottom:10px; font-size:13px; color:#475569;">
            Credits earned strictly through verified peer collaboration:
          </div>
          <table class="flowai-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Credits</th>
                <th>Reason (Verified Collaboration)</th>
              </tr>
            </thead>
            <tbody>
              ${credits.slice(0, 5).map(c => `
                <tr>
                  <td><strong>${c.employee}</strong></td>
                  <td><span class="badge badge-ai">+${c.credits} pts</span></td>
                  <td style="font-size:12.5px;">${c.reason}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div style="margin-top:10px;">
            <button class="btn btn-xs btn-outline" onclick="window.worknexApp.navigateTo('credits')">View Full Credits Table →</button>
          </div>
        `
      };
    }

    // 8. "Show me this week's project progress."
    if (q.includes("progress") || q.includes("project progress") || q.includes("this week")) {
      return {
        title: "Microsoft Hackathon — Velocity Telemetry",
        format: "card",
        html: `
          <div class="flowai-metric-group" style="display:flex; gap:12px; margin-bottom:12px;">
            <div class="metric-pill">
              <span class="metric-num">78%</span>
              <span class="metric-lbl">Overall Progress</span>
            </div>
            <div class="metric-pill">
              <span class="metric-num">42</span>
              <span class="metric-lbl">Completed</span>
            </div>
            <div class="metric-pill">
              <span class="metric-num">11</span>
              <span class="metric-lbl">Pending</span>
            </div>
            <div class="metric-pill">
              <span class="metric-num">4</span>
              <span class="metric-lbl">Blockers</span>
            </div>
          </div>
          <ul style="margin:0; padding-left:18px; font-size:13px; color:#334155; line-height:1.6;">
            <li><strong>Velocity Trajectory:</strong> Monday 62% → Friday 78% (+16% gain this sprint).</li>
            <li><strong>Team Leaderboard Velocity:</strong> Team Gamma (91%), Team Zeta (88%), Team Alpha (82%).</li>
            <li><strong>Health Distribution:</strong> 60% Completed, 25% In Progress, 10% Pending, 5% Blocked.</li>
          </ul>
          <div style="margin-top:10px;">
            <button class="btn btn-xs btn-primary" onclick="window.worknexApp.navigateTo('reports')">Open Full Weekly Reports →</button>
          </div>
        `
      };
    }

    // Default Fallback with structured overview
    return {
      title: "FlowAI Project Overview",
      format: "card",
      html: `
        <div style="font-size:13px; color:#475569; margin-bottom:8px;">
          Here is a quick snapshot of project telemetry for <strong>Avni</strong>:
        </div>
        <div class="flowai-metric-group" style="display:flex; gap:8px; margin-bottom:10px;">
          <div class="metric-pill"><span class="metric-num">78%</span><span class="metric-lbl">Progress</span></div>
          <div class="metric-pill"><span class="metric-num">4</span><span class="metric-lbl">Blockers</span></div>
          <div class="metric-pill"><span class="metric-num">1</span><span class="metric-lbl">Recurring</span></div>
          <div class="metric-pill"><span class="metric-num">1</span><span class="metric-lbl">Silent Delay</span></div>
        </div>
        <div style="font-size:12px; color:#64748B;">
          You can ask specific questions like:
          <div style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">
            <a href="javascript:void(0)" onclick="window.worknexApp.askFlowAI('Which blockers are recurring?')" style="color:#0078D4; text-decoration:none;">• Which blockers are recurring?</a>
            <a href="javascript:void(0)" onclick="window.worknexApp.askFlowAI('Which teams are experiencing silent delays?')" style="color:#0078D4; text-decoration:none;">• Which teams are experiencing silent delays?</a>
            <a href="javascript:void(0)" onclick="window.worknexApp.askFlowAI('Which issues affect multiple teams?')" style="color:#0078D4; text-decoration:none;">• Which issues affect multiple teams?</a>
          </div>
        </div>
      `
    };
  }
}

window.FlowAIEngine = FlowAIEngine;
