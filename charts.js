/**
 * WORKNEX Enterprise High-DPI Canvas Chart Engine
 * Microsoft Global Hackathon
 * "Less status chasing. More progress."
 *
 * Renders 5 enterprise-grade interactive charts:
 * 1. Weekly Overall Progress Line Chart (Mon - Fri)
 * 2. Completed vs Pending vs Overdue Bar Chart
 * 3. Team Progress Horizontal Comparison Chart
 * 4. Blocker Resolution Trend Area Chart
 * 5. Work Completion Velocity Trend Line Chart
 * Plus Project Health Donut / Gauge Chart
 */

class WorknexCharts {
  constructor() {
    this.palette = {
      navy: "#0F172A",
      navyLight: "#1E293B",
      primaryBlue: "#0078D4",
      accentBlue: "#2563EB",
      indigoAI: "#6366F1",
      purpleAI: "#8B5CF6",
      successGreen: "#10B981",
      warningAmber: "#F59E0B",
      criticalRed: "#EF4444",
      neutralDark: "#0F172A",
      neutralMuted: "#64748B",
      neutralLight: "#E2E8F0",
      gridLines: "#F1F5F9",
      white: "#FFFFFF"
    };
  }

  setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 500;
    const height = rect.height || canvas.height || 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    return { ctx, width, height };
  }

  /**
   * 1. Weekly Overall Progress Line Chart (Mon: 62% -> Fri: 78%)
   */
  renderWeeklyOverallProgress(canvasId, dailyVelocity) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = dailyVelocity || [
      { day: "Mon", progress: 62 },
      { day: "Tue", progress: 68 },
      { day: "Wed", progress: 71 },
      { day: "Thu", progress: 75 },
      { day: "Fri", progress: 78 }
    ];

    const padding = { top: 35, right: 35, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Y Axis (0 - 100%)
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = this.palette.neutralMuted;

    for (let p = 0; p <= 100; p += 25) {
      const y = padding.top + chartH - (p / 100) * chartH;
      ctx.fillText(`${p}%`, padding.left - 10, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = this.palette.gridLines;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Points
    const stepX = chartW / (data.length - 1);
    const points = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (d.progress / 100) * chartH,
      label: d.day,
      progress: d.progress
    }));

    // Area Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, "rgba(0, 120, 212, 0.22)");
    gradient.addColorStop(1, "rgba(0, 120, 212, 0.01)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = this.palette.primaryBlue;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Nodes and labels
    points.forEach(pt => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = this.palette.white;
      ctx.fill();
      ctx.strokeStyle = this.palette.primaryBlue;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top value badge
      ctx.fillStyle = this.palette.navy;
      ctx.font = "bold 11px 'Segoe UI', system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${pt.progress}%`, pt.x, pt.y - 10);

      // Bottom label
      ctx.fillStyle = this.palette.neutralMuted;
      ctx.font = "11px 'Segoe UI', system-ui";
      ctx.fillText(pt.label, pt.x, height - 14);
    });
  }

  /**
   * 2. Completed vs Pending vs Overdue vs Blocked Bar Chart
   */
  renderTaskStatusComparison(canvasId, stats) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const categories = [
      { label: "Completed", count: stats.completedWork || 42, color: this.palette.successGreen },
      { label: "Pending", count: stats.pendingWork || 11, color: this.palette.primaryBlue },
      { label: "Active Blocked", count: stats.unresolvedBlockers || 4, color: this.palette.criticalRed },
      { label: "Overdue", count: stats.overdueWork || 3, color: this.palette.warningAmber }
    ];

    const padding = { top: 35, right: 30, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...categories.map(c => c.count), 50);

    // Y Axis
    ctx.font = "11px 'Segoe UI', system-ui";
    ctx.textAlign = "right";
    ctx.fillStyle = this.palette.neutralMuted;
    for (let i = 0; i <= maxVal; i += 10) {
      const y = padding.top + chartH - (i / maxVal) * chartH;
      ctx.fillText(i, padding.left - 10, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = this.palette.gridLines;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Bars
    const barWidth = Math.min(chartW / categories.length - 24, 52);
    const stepX = chartW / categories.length;

    categories.forEach((cat, idx) => {
      const barH = (cat.count / maxVal) * chartH;
      const x = padding.left + idx * stepX + (stepX - barWidth) / 2;
      const y = padding.top + chartH - barH;

      ctx.fillStyle = cat.color;
      this.roundRect(ctx, x, y, barWidth, barH, 6);
      ctx.fill();

      // Top value
      ctx.fillStyle = this.palette.navy;
      ctx.font = "bold 12px 'Segoe UI', system-ui";
      ctx.textAlign = "center";
      ctx.fillText(cat.count, x + barWidth / 2, y - 8);

      // Label below
      ctx.fillStyle = this.palette.neutralMuted;
      ctx.font = "11px 'Segoe UI', system-ui";
      ctx.fillText(cat.label, x + barWidth / 2, height - 12);
    });
  }

  /**
   * 3. Team Progress Horizontal Comparison Bar Chart (6 Teams)
   */
  renderTeamProgressComparison(canvasId, teams) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = teams || [
      { name: "Team Alpha", progress: 82, color: "#0078D4" },
      { name: "Team Beta", progress: 74, color: "#6366F1" },
      { name: "Team Gamma", progress: 91, color: "#10B981" },
      { name: "Team Delta", progress: 63, color: "#F59E0B" },
      { name: "Team Epsilon", progress: 70, color: "#8B5CF6" },
      { name: "Team Zeta", progress: 88, color: "#0284C7" }
    ];

    const padding = { top: 25, right: 55, bottom: 25, left: 95 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const rowH = chartH / data.length;
    const barHeight = Math.min(rowH * 0.55, 20);

    data.forEach((t, i) => {
      const y = padding.top + i * rowH + (rowH - barHeight) / 2;

      // Team Label
      ctx.font = "600 12px 'Segoe UI', system-ui";
      ctx.textAlign = "right";
      ctx.fillStyle = this.palette.navy;
      ctx.fillText(t.name, padding.left - 12, y + barHeight * 0.75);

      // Background track
      ctx.fillStyle = this.palette.gridLines;
      this.roundRect(ctx, padding.left, y, chartW, barHeight, 4);
      ctx.fill();

      // Progress bar fill
      const fillW = (t.progress / 100) * chartW;
      ctx.fillStyle = t.color || this.palette.primaryBlue;
      this.roundRect(ctx, padding.left, y, fillW, barHeight, 4);
      ctx.fill();

      // Percentage label on right
      ctx.font = "bold 12px 'Segoe UI', system-ui";
      ctx.textAlign = "left";
      ctx.fillStyle = this.palette.navy;
      ctx.fillText(`${t.progress}%`, padding.left + chartW + 10, y + barHeight * 0.75);
    });
  }

  /**
   * 4. Blocker Trend Line Chart (Active Blockers over 7 days)
   */
  renderBlockerTrend(canvasId, blockerTrend) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = blockerTrend || [
      { day: "23 Sep", active: 7 },
      { day: "24 Sep", active: 6 },
      { day: "25 Sep", active: 5 },
      { day: "26 Sep", active: 5 },
      { day: "27 Sep", active: 4 },
      { day: "28 Sep", active: 4 },
      { day: "29 Sep", active: 4 }
    ];

    const padding = { top: 35, right: 35, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxVal = 10;

    // Y Axis
    ctx.font = "11px 'Segoe UI', system-ui";
    ctx.textAlign = "right";
    ctx.fillStyle = this.palette.neutralMuted;
    for (let i = 0; i <= maxVal; i += 2) {
      const y = padding.top + chartH - (i / maxVal) * chartH;
      ctx.fillText(i, padding.left - 10, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = this.palette.gridLines;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const stepX = chartW / (data.length - 1);
    const points = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (d.active / maxVal) * chartH,
      label: d.day,
      count: d.active
    }));

    // Area Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, "rgba(239, 68, 68, 0.18)");
    gradient.addColorStop(1, "rgba(239, 68, 68, 0.01)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = this.palette.criticalRed;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Nodes
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.palette.white;
      ctx.fill();
      ctx.strokeStyle = this.palette.criticalRed;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.palette.navy;
      ctx.font = "bold 11px 'Segoe UI', system-ui";
      ctx.textAlign = "center";
      ctx.fillText(pt.count, pt.x, pt.y - 9);

      ctx.fillStyle = this.palette.neutralMuted;
      ctx.font = "10.5px 'Segoe UI', system-ui";
      ctx.fillText(pt.label, pt.x, height - 12);
    });
  }

  /**
   * 5. Work Completion Velocity Trend (Cumulative completed items)
   */
  renderWorkCompletionTrend(canvasId, cumulativeVelocity) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = cumulativeVelocity || [
      { date: "23 Sep", completed: 22 },
      { date: "24 Sep", completed: 28 },
      { date: "25 Sep", completed: 33 },
      { date: "26 Sep", completed: 37 },
      { date: "27 Sep", completed: 39 },
      { date: "28 Sep", completed: 41 },
      { date: "29 Sep", completed: 42 }
    ];

    const padding = { top: 35, right: 35, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxVal = 50;

    // Y Axis
    ctx.font = "11px 'Segoe UI', system-ui";
    ctx.textAlign = "right";
    ctx.fillStyle = this.palette.neutralMuted;
    for (let i = 0; i <= maxVal; i += 10) {
      const y = padding.top + chartH - (i / maxVal) * chartH;
      ctx.fillText(i, padding.left - 10, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = this.palette.gridLines;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const stepX = chartW / (data.length - 1);
    const points = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartH - (d.completed / maxVal) * chartH,
      label: d.date,
      count: d.completed
    }));

    // Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.22)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.01)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = this.palette.successGreen;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.palette.white;
      ctx.fill();
      ctx.strokeStyle = this.palette.successGreen;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.palette.navy;
      ctx.font = "bold 11px 'Segoe UI', system-ui";
      ctx.textAlign = "center";
      ctx.fillText(pt.count, pt.x, pt.y - 9);

      ctx.fillStyle = this.palette.neutralMuted;
      ctx.font = "10.5px 'Segoe UI', system-ui";
      ctx.fillText(pt.label, pt.x, height - 12);
    });
  }

  /**
   * Project Health Donut Chart
   * Completed: 60%, In Progress: 25%, Pending: 10%, Blocked: 5%
   */
  renderProjectHealthDonut(canvasId, health) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const data = health || {
      completed: 60,
      inProgress: 25,
      pending: 10,
      blocked: 5
    };

    const segments = [
      { label: "Completed", pct: data.completed, color: this.palette.successGreen },
      { label: "In Progress", pct: data.inProgress, color: this.palette.primaryBlue },
      { label: "Pending", pct: data.pending, color: this.palette.warningAmber },
      { label: "Blocked", pct: data.blocked, color: this.palette.criticalRed }
    ];

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.68;

    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
      const sliceAngle = (seg.pct / 100) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Center Text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.palette.navy;
    ctx.font = "bold 20px 'Segoe UI', system-ui";
    ctx.fillText(`${data.completed}%`, centerX, centerY - 8);

    ctx.font = "11px 'Segoe UI', system-ui";
    ctx.fillStyle = this.palette.neutralMuted;
    ctx.fillText("Completed", centerX, centerY + 12);
  }

  /**
   * Helper: Rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x, y);
    ctx.closePath();
  }
}

// Global instance
window.worknexCharts = new WorknexCharts();
