/**
 * WORKNEX Demo Controller
 * Microsoft Global Hackathon
 * "Less status chasing. More progress."
 *
 * Provides instant simulation controls for evaluators and judges:
 * - Generate Daily Digest
 * - Simulate 3-Day Recurring Blocker (Red Flag)
 * - Simulate Silent Delay (Orange Alert)
 * - Simulate Employee Leave & Reassignment
 * - Simulate Cross-Team Blocker
 * - Generate Collaboration Meeting (Teams Sync)
 * - Generate Weekly Report
 * - Reset to Default
 */

class WorknexDemoController {
  constructor(store) {
    this.store = store;
  }

  generateDailyDigest() {
    this.store.simulateDailyDigest();
    window.worknexApp.showToast("FlowAI processed asynchronous updates into structured project telemetry.", "success");
    window.worknexApp.navigateTo("dashboard");
  }

  simulateRecurringBlocker() {
    this.store.simulateRecurringBlocker();
    window.worknexApp.showToast("🔴 3-Day Recurring Blocker Alert generated: API Access (Team Alpha)", "error");
    window.worknexApp.navigateTo("dashboard");
  }

  simulateSilentDelay() {
    this.store.simulateSilentDelay();
    window.worknexApp.showToast("⚡ Silent Delay Detected: Backend Integration pending 7 days (Team Beta)", "warning");
    window.worknexApp.navigateTo("dashboard");
  }

  simulateEmployeeLeave() {
    this.store.simulateEmployeeLeave();
    window.worknexApp.showToast("Employee On Leave: Rishabh. System suggested reassignment to Elena Rostova.", "info");
    window.worknexApp.openReassignModal();
  }

  simulateCrossTeamBlocker() {
    this.store.simulateCrossTeamBlocker();
    window.worknexApp.showToast("Cross-team blocker detected: API Access affects Team Alpha & Team Gamma.", "info");
    window.worknexApp.navigateTo("dashboard");
  }

  generateCollaborationMeeting() {
    this.store.clearMeetingData();
    window.worknexApp.showToast("📅 Collaboration Meeting suggestion restored and ready to generate.", "ai");
    window.worknexApp.openMeetingModal();
  }

  generateWeeklyReport() {
    window.worknexApp.showToast("Generated latest Executive Weekly Velocity & Progress Telemetry.", "success");
    window.worknexApp.navigateTo("reports");
  }

  resetDemo() {
    this.store.resetDemoData();
    window.worknexApp.showToast("Demo environment reset to baseline telemetry. All actions restored.", "info");
    window.worknexApp.navigateTo("dashboard");
  }
}

window.worknexDemoController = new WorknexDemoController(window.worknexStore);
