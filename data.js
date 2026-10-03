/**
 * WORKNEX Enterprise Data Store
 * "Less status chasing. More progress."
 * Microsoft Global Hackathon Prototype
 *
 * Full enterprise dataset for Manager Portal (Avni)
 * Teams, Employees, Work Items, Daily Digests, Blockers, Silent Delays,
 * Credits, Achievements, Reports, Notifications, Activity Logs.
 */

const WORKNEX_INITIAL_DATA = {
  currentDate: "2026-09-29",
  systemTime: "2026-09-29T20:16:00",
  organization: {
    name: "Contoso Enterprise Solutions",
    division: "Cloud & Distributed Systems Group",
    appName: "WORKNEX",
    tagline: "Less status chasing. More progress.",
    hackathon: "Microsoft Global Hackathon",
    compliance: "Azure Enterprise Zero Trust & Anti-Surveillance Compliant"
  },

  // Authenticated Manager Profile
  currentUser: {
    id: "mgr-avni-1",
    name: "Avni",
    role: "Manager",
    email: "avni@worknex.demo",
    title: "Senior Engineering Manager & Hackathon Lead",
    department: "Cloud Systems & Enterprise Architecture",
    avatarBg: "#0F172A",
    avatarInitials: "AV",
    demoPassword: "Manager@123"
  },

  // Selected Project (Microsoft Hackathon by default)
  selectedProjectId: "proj-hackathon",

  // Projects
  projects: [
    {
      id: "proj-hackathon",
      name: "Microsoft Hackathon",
      code: "MS-HACK-2026",
      description: "AI-powered asynchronous distributed progress management and decision intelligence platform.",
      progress: 78,
      teamsCount: 6,
      totalWorkItems: 54,
      completedWorkItems: 42,
      pendingWorkItems: 11,
      blockedWorkItems: 4,
      overdueWorkItems: 3,
      startDate: "2026-09-01",
      targetDate: "2026-10-05",
      status: "Active",
      health: {
        completed: 60,
        inProgress: 25,
        pending: 10,
        blocked: 5
      },
      milestones: [
        { name: "Core Architecture & Event Bus", status: "Completed", date: "2026-09-12" },
        { name: "Asynchronous Telemetry Engine", status: "Completed", date: "2026-09-20" },
        { name: "FlowAI Decision Support Suite", status: "In Progress", date: "2026-09-30" },
        { name: "Final Presentation & Live Demo", status: "Pending", date: "2026-10-04" }
      ]
    },
    {
      id: "proj-alpha",
      name: "Project Alpha (Azure Cloud Migration)",
      code: "AZ-ALPHA",
      description: "Enterprise lift-and-shift of legacy distributed workloads to Azure Kubernetes Service.",
      progress: 74,
      teamsCount: 4,
      totalWorkItems: 48,
      completedWorkItems: 35,
      pendingWorkItems: 9,
      blockedWorkItems: 3,
      overdueWorkItems: 1,
      startDate: "2026-08-15",
      targetDate: "2026-10-20",
      status: "Active",
      health: {
        completed: 72,
        inProgress: 18,
        pending: 6,
        blocked: 4
      },
      milestones: [
        { name: "Identity & Entra ID Federation", status: "Completed", date: "2026-09-01" },
        { name: "Database Sharding & CosmosDB", status: "Completed", date: "2026-09-15" },
        { name: "Traffic Routing & Front Door", status: "In Progress", date: "2026-10-10" }
      ]
    },
    {
      id: "proj-workflows",
      name: "NextGen Distributed Workflows",
      code: "NG-FLOW",
      description: "Asynchronous task orchestration engine with Teams and Outlook deep integration.",
      progress: 68,
      teamsCount: 3,
      totalWorkItems: 36,
      completedWorkItems: 24,
      pendingWorkItems: 8,
      blockedWorkItems: 3,
      overdueWorkItems: 1,
      startDate: "2026-08-20",
      targetDate: "2026-11-01",
      status: "Active",
      health: {
        completed: 66,
        inProgress: 22,
        pending: 7,
        blocked: 5
      },
      milestones: [
        { name: "Webhook Subscriptions", status: "Completed", date: "2026-09-08" },
        { name: "Event Bridge Pipeline", status: "In Progress", date: "2026-10-01" }
      ]
    }
  ],

  // 6 Teams
  teams: [
    {
      id: "team-alpha",
      name: "Team Alpha",
      workArea: "Core Platform & UI/UX",
      progress: 82,
      lead: "Elena Rostova",
      color: "#0078D4",
      completedWork: 12,
      pendingWork: 2,
      activeBlockers: 1, // Recurring API Access
      overdueWork: 0,
      challenges: "OAuth 2.0 reverse proxy token handshake",
      attendanceSummary: { present: 4, onLeave: 0, total: 4 },
      members: [
        { id: "emp-elena", name: "Elena Rostova", role: "Team Lead & Principal Architect", avatar: "ER", status: "Present" },
        { id: "emp-aadarsh", name: "Aadarsh", role: "Software Engineer", avatar: "AP", status: "Present" },
        { id: "emp-avni", name: "Avni", role: "UI/UX & Platform Manager", avatar: "AV", status: "Present" },
        { id: "emp-daniel", name: "Daniel Craig", role: "Frontend Specialist", avatar: "DC", status: "Present" }
      ],
      weeklyTrend: [
        { day: "Mon", progress: 68 },
        { day: "Tue", progress: 72 },
        { day: "Wed", progress: 76 },
        { day: "Thu", progress: 80 },
        { day: "Fri", progress: 82 }
      ]
    },
    {
      id: "team-beta",
      name: "Team Beta",
      workArea: "Backend & Microservices",
      progress: 74,
      lead: "Marcus Thorne",
      color: "#6366F1",
      completedWork: 8,
      pendingWork: 3,
      activeBlockers: 1, // Hardware Issue / Gateway Timeout
      overdueWork: 1,
      challenges: "Asynchronous RPC contract backward compatibility",
      attendanceSummary: { present: 3, onLeave: 1, total: 4 },
      members: [
        { id: "emp-marcus", name: "Marcus Thorne", role: "Team Lead & Backend Architect", avatar: "MT", status: "Present" },
        { id: "emp-rishabh", name: "Rishabh", role: "Senior Backend Engineer", avatar: "RV", status: "On Leave" },
        { id: "emp-lucas", name: "Lucas Silva", role: "Microservices Engineer", avatar: "LS", status: "Present" },
        { id: "emp-tara", name: "Tara Chen", role: "Distributed Systems Dev", avatar: "TC", status: "Present" }
      ],
      weeklyTrend: [
        { day: "Mon", progress: 58 },
        { day: "Tue", progress: 64 },
        { day: "Wed", progress: 69 },
        { day: "Thu", progress: 72 },
        { day: "Fri", progress: 74 }
      ]
    },
    {
      id: "team-gamma",
      name: "Team Gamma",
      workArea: "Data Pipeline & Search",
      progress: 91,
      lead: "Chen Wei",
      color: "#10B981",
      completedWork: 11,
      pendingWork: 1,
      activeBlockers: 1, // API Access dependency
      overdueWork: 0,
      challenges: "Vector embeddings index compaction latency",
      attendanceSummary: { present: 4, onLeave: 0, total: 4 },
      members: [
        { id: "emp-chen", name: "Chen Wei", role: "Team Lead & Data Scientist", avatar: "CW", status: "Present" },
        { id: "emp-vikram", name: "Vikram Mehta", role: "Cache & Performance Engineer", avatar: "VM", status: "Present" },
        { id: "emp-chloe", name: "Chloe Adams", role: "Data Pipeline Developer", avatar: "CA", status: "Present" },
        { id: "emp-zack", name: "Zack Taylor", role: "Search Optimization Engineer", avatar: "ZT", status: "Present" }
      ],
      weeklyTrend: [
        { day: "Mon", progress: 74 },
        { day: "Tue", progress: 80 },
        { day: "Wed", progress: 85 },
        { day: "Thu", progress: 88 },
        { day: "Fri", progress: 91 }
      ]
    },
    {
      id: "team-delta",
      name: "Team Delta",
      workArea: "Security & Compliance",
      progress: 63,
      lead: "Sneha Rao",
      color: "#F59E0B",
      completedWork: 5,
      pendingWork: 3,
      activeBlockers: 1, // Queue Throttling
      overdueWork: 1,
      challenges: "Multi-tenant token refresh race conditions under load",
      attendanceSummary: { present: 4, onLeave: 0, total: 4 },
      members: [
        { id: "emp-sneha", name: "Sneha Rao", role: "Team Lead & Security Specialist", avatar: "SR", status: "Present" },
        { id: "emp-maya", name: "Maya Patel", role: "Event Gateway Developer", avatar: "MP", status: "Present" },
        { id: "emp-leo", name: "Leo Vance", role: "Identity & Entra Specialist", avatar: "LV", status: "Present" },
        { id: "emp-kavita", name: "Kavita Nair", role: "Compliance & Audit Engineer", avatar: "KN", status: "Present" }
      ],
      weeklyTrend: [
        { day: "Mon", progress: 48 },
        { day: "Tue", progress: 52 },
        { day: "Wed", progress: 57 },
        { day: "Thu", progress: 60 },
        { day: "Fri", progress: 63 }
      ]
    },
    {
      id: "team-epsilon",
      name: "Team Epsilon",
      workArea: "DevOps & Azure Cloud",
      progress: 70,
      lead: "Carlos Mendez",
      color: "#8B5CF6",
      completedWork: 6,
      pendingWork: 2,
      activeBlockers: 0,
      overdueWork: 1,
      challenges: "ARM template parameterization across staging environments",
      attendanceSummary: { present: 4, onLeave: 0, total: 4 },
      members: [
        { id: "emp-carlos", name: "Carlos Mendez", role: "Team Lead & Cloud Architect", avatar: "CM", status: "Present" },
        { id: "emp-sophie", name: "Sophie Dupont", role: "Observability Engineer", avatar: "SD", status: "Present" },
        { id: "emp-nathan", name: "Nathan Drake", role: "Kubernetes Admin", avatar: "ND", status: "Present" },
        { id: "emp-rachel", name: "Rachel Green", role: "Site Reliability Engineer", avatar: "RG", status: "Present" }
      ],
      weeklyTrend: [
        { day: "Mon", progress: 54 },
        { day: "Tue", progress: 58 },
        { day: "Wed", progress: 63 },
        { day: "Thu", progress: 67 },
        { day: "Fri", progress: 70 }
      ]
    },
    {
      id: "team-zeta",
      name: "Team Zeta",
      workArea: "QA & Performance Testing",
      progress: 88,
      lead: "Priya Sharma",
      color: "#0284C7",
      completedWork: 9,
      pendingWork: 1,
      activeBlockers: 0,
      overdueWork: 0,
      challenges: "Simulating 10k concurrent WebSocket heartbeats in CI pipeline",
      attendanceSummary: { present: 4, onLeave: 0, total: 4 },
      members: [
        { id: "emp-priya", name: "Priya Sharma", role: "Team Lead & QA Architect", avatar: "PS", status: "Present" },
        { id: "emp-arjun", name: "Arjun Kapoor", role: "Automation Engineer", avatar: "AK", status: "Present" },
        { id: "emp-emma", name: "Emma Watson", role: "Load Testing Engineer", avatar: "EW", status: "Present" },
        { id: "emp-ananya", name: "Ananya Roy", role: "Regression QA", avatar: "AR", status: "Present" }
      ],
      weeklyTrend: [
        { day: "Mon", progress: 70 },
        { day: "Tue", progress: 76 },
        { day: "Wed", progress: 81 },
        { day: "Thu", progress: 85 },
        { day: "Fri", progress: 88 }
      ]
    }
  ],

  // 24 Employees
  employees: [
    { id: "emp-avni", name: "Avni", roleTitle: "Manager & UI/UX Oversight", teamId: "team-alpha", email: "avni@worknex.demo", credits: 50, avatarColor: "#0F172A", status: "Present" },
    { id: "emp-aadarsh", name: "Aadarsh", roleTitle: "Software Engineer", teamId: "team-alpha", email: "aadarsh@worknex.demo", credits: 150, avatarColor: "#0078D4", status: "Present" },
    { id: "emp-rishabh", name: "Rishabh", roleTitle: "Senior Backend Engineer", teamId: "team-beta", email: "rishabh@worknex.demo", credits: 50, avatarColor: "#6366F1", status: "On Leave" },
    { id: "emp-elena", name: "Elena Rostova", roleTitle: "Team Lead & Principal Architect", teamId: "team-alpha", email: "elena@worknex.demo", credits: 75, avatarColor: "#0284C7", status: "Present" },
    { id: "emp-marcus", name: "Marcus Thorne", roleTitle: "Backend Lead", teamId: "team-beta", email: "marcus@worknex.demo", credits: 40, avatarColor: "#475569", status: "Present" },
    { id: "emp-lucas", name: "Lucas Silva", roleTitle: "Microservices Engineer", teamId: "team-beta", email: "lucas@worknex.demo", credits: 60, avatarColor: "#2563EB", status: "Present" },
    { id: "emp-tara", name: "Tara Chen", roleTitle: "Distributed Systems Dev", teamId: "team-beta", email: "tara@worknex.demo", credits: 30, avatarColor: "#7C3AED", status: "Present" },
    { id: "emp-chen", name: "Chen Wei", roleTitle: "Data Lead & Architect", teamId: "team-gamma", email: "chen@worknex.demo", credits: 90, avatarColor: "#10B981", status: "Present" },
    { id: "emp-vikram", name: "Vikram Mehta", roleTitle: "Performance & Cache Engineer", teamId: "team-gamma", email: "vikram@worknex.demo", credits: 80, avatarColor: "#059669", status: "Present" },
    { id: "emp-chloe", name: "Chloe Adams", roleTitle: "Data Pipeline Developer", teamId: "team-gamma", email: "chloe@worknex.demo", credits: 45, avatarColor: "#14B8A6", status: "Present" },
    { id: "emp-sneha", name: "Sneha Rao", roleTitle: "Security Lead", teamId: "team-delta", email: "sneha@worknex.demo", credits: 120, avatarColor: "#F59E0B", status: "Present" },
    { id: "emp-maya", name: "Maya Patel", roleTitle: "Event Gateway Developer", teamId: "team-delta", email: "maya@worknex.demo", credits: 35, avatarColor: "#D97706", status: "Present" },
    { id: "emp-carlos", name: "Carlos Mendez", roleTitle: "Cloud & DevOps Lead", teamId: "team-epsilon", email: "carlos@worknex.demo", credits: 70, avatarColor: "#8B5CF6", status: "Present" },
    { id: "emp-sophie", name: "Sophie Dupont", roleTitle: "Observability Engineer", teamId: "team-epsilon", email: "sophie@worknex.demo", credits: 25, avatarColor: "#9333EA", status: "Present" },
    { id: "emp-priya", name: "Priya Sharma", roleTitle: "QA & Automation Lead", teamId: "team-zeta", email: "priya@worknex.demo", credits: 85, avatarColor: "#0284C7", status: "Present" },
    { id: "emp-arjun", name: "Arjun Kapoor", roleTitle: "Automation Engineer", teamId: "team-zeta", email: "arjun@worknex.demo", credits: 50, avatarColor: "#0891B2", status: "Present" }
  ],

  // AI Daily Digest (Processed Information - Read-only, Organized Team-Wise)
  dailyDigest: [
    // --- TEAM ALPHA (Core Platform & UI/UX) ---
    {
      id: "digest-1",
      teamId: "team-alpha",
      teamName: "Team Alpha",
      employeeId: "emp-avni",
      employeeName: "Avni",
      workArea: "UI/UX",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Completed the Manager Portal visual hierarchy specifications, responsive sidebar navigation, and design token integration. Everything verified against enterprise standards.",
      extractedInfo: {
        workArea: "UI/UX",
        status: "Completed",
        blocker: "None",
        confidence: 0.99
      }
    },
    {
      id: "digest-2",
      teamId: "team-alpha",
      teamName: "Team Alpha",
      employeeId: "emp-aadarsh",
      employeeName: "Aadarsh",
      workArea: "Software",
      status: "Pending",
      blocker: "API Access",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      isRecurringBlocker: true, // 3 consecutive days!
      consecutiveDays: 3,
      sourceMessage: "Software is not done because I don't have API access.",
      extractedInfo: {
        workArea: "Software",
        status: "Pending",
        blocker: "API Access",
        confidence: 0.98
      }
    },
    {
      id: "digest-elena",
      teamId: "team-alpha",
      teamName: "Team Alpha",
      employeeId: "emp-elena",
      employeeName: "Elena Rostova",
      workArea: "Core Architecture Spec",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Finalized the core architectural blueprints, rate limiting middleware, and telemetry contract specifications.",
      extractedInfo: {
        workArea: "Core Architecture Spec",
        status: "Completed",
        blocker: "None",
        confidence: 0.99
      }
    },
    {
      id: "digest-daniel",
      teamId: "team-alpha",
      teamName: "Team Alpha",
      employeeId: "emp-daniel",
      employeeName: "Daniel Craig",
      workArea: "Frontend Layout Resiliency",
      status: "In Progress",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Implementing fluid grid breakpoints and high-DPI canvas charts for high-resolution displays.",
      extractedInfo: {
        workArea: "Frontend Layout Resiliency",
        status: "In Progress",
        blocker: "None",
        confidence: 0.97
      }
    },

    // --- TEAM BETA (Backend & Microservices) ---
    {
      id: "digest-marcus",
      teamId: "team-beta",
      teamName: "Team Beta",
      employeeId: "emp-marcus",
      employeeName: "Marcus Thorne",
      workArea: "Asynchronous RPC Bus",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Completed asynchronous RPC message serialization layer and GraphQL schema stitching.",
      extractedInfo: {
        workArea: "Asynchronous RPC Bus",
        status: "Completed",
        blocker: "None",
        confidence: 0.98
      }
    },
    {
      id: "digest-3",
      teamId: "team-beta",
      teamName: "Team Beta",
      employeeId: "emp-rishabh",
      employeeName: "Rishabh",
      workArea: "Backend",
      status: "Pending",
      blocker: "None",
      attendance: "On Leave",
      challenge: "Hardware Issue",
      date: "29 September 2026",
      isSilentDelay: true, // 7 days pending
      pendingDays: 7,
      sourceMessage: "On leave today due to urgent workstation hardware malfunction. Backend integration queue remains pending until repair or reassignment.",
      extractedInfo: {
        workArea: "Backend",
        status: "Pending",
        blocker: "None",
        attendance: "On Leave",
        challenge: "Hardware Issue",
        confidence: 0.97
      }
    },
    {
      id: "digest-4",
      teamId: "team-beta",
      teamName: "Team Beta",
      employeeId: "emp-lucas",
      employeeName: "Lucas Silva",
      workArea: "Microservices",
      status: "Blocked",
      blocker: "API Access",
      attendance: "Present",
      challenge: "Gateway Timeout",
      date: "29 September 2026",
      sourceMessage: "Microservices telemetry ingestion is blocked waiting for API access credentials from Azure KeyVault. Experiencing gateway timeouts during mock handshake.",
      extractedInfo: {
        workArea: "Microservices",
        status: "Blocked",
        blocker: "API Access",
        challenge: "Gateway Timeout",
        confidence: 0.96
      }
    },
    {
      id: "digest-tara",
      teamId: "team-beta",
      teamName: "Team Beta",
      employeeId: "emp-tara",
      employeeName: "Tara Chen",
      workArea: "CosmosDB Data Partitioning",
      status: "In Progress",
      blocker: "None",
      attendance: "Present",
      challenge: "Cross-partition Query Latency",
      date: "29 September 2026",
      sourceMessage: "Rebalancing partition keys to eliminate hot spot partitions on distributed document collection.",
      extractedInfo: {
        workArea: "CosmosDB Data Partitioning",
        status: "In Progress",
        blocker: "None",
        challenge: "Cross-partition Query Latency",
        confidence: 0.95
      }
    },

    // --- TEAM GAMMA (Data Pipeline & Search) ---
    {
      id: "digest-chen",
      teamId: "team-gamma",
      teamName: "Team Gamma",
      employeeId: "emp-chen",
      employeeName: "Chen Wei",
      workArea: "Vector Embeddings Pipeline",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Finished ingestion pipeline for dense vector embeddings with batch dimension reduction.",
      extractedInfo: {
        workArea: "Vector Embeddings Pipeline",
        status: "Completed",
        blocker: "None",
        confidence: 0.99
      }
    },
    {
      id: "digest-6",
      teamId: "team-gamma",
      teamName: "Team Gamma",
      employeeId: "emp-vikram",
      employeeName: "Vikram Mehta",
      workArea: "Cache Layer",
      status: "In Progress",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Optimized Redis distributed cache invalidation hooks. Average query latency reduced from 34ms to 6ms.",
      extractedInfo: {
        workArea: "Cache Layer",
        status: "In Progress",
        blocker: "None",
        confidence: 0.99
      }
    },
    {
      id: "digest-chloe",
      teamId: "team-gamma",
      teamName: "Team Gamma",
      employeeId: "emp-chloe",
      employeeName: "Chloe Adams",
      workArea: "Data Pipeline & Gateway",
      status: "Blocked",
      blocker: "API Access",
      attendance: "Present",
      challenge: "Azure KeyVault Secret Sync",
      date: "29 September 2026",
      sourceMessage: "Data ingestion pipeline halted waiting on Azure KeyVault API access permissions for secure stream ingestion.",
      extractedInfo: {
        workArea: "Data Pipeline & Gateway",
        status: "Blocked",
        blocker: "API Access",
        challenge: "Azure KeyVault Secret Sync",
        confidence: 0.97
      }
    },
    {
      id: "digest-zack",
      teamId: "team-gamma",
      teamName: "Team Gamma",
      employeeId: "emp-zack",
      employeeName: "Zack Taylor",
      workArea: "Semantic Search Index",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Indexed 100k project documents with semantic token sharding; latency metrics within 45ms P99 SLA.",
      extractedInfo: {
        workArea: "Semantic Search Index",
        status: "Completed",
        blocker: "None",
        confidence: 0.98
      }
    },

    // --- TEAM DELTA (Security & Compliance) ---
    {
      id: "digest-5",
      teamId: "team-delta",
      teamName: "Team Delta",
      employeeId: "emp-sneha",
      employeeName: "Sneha Rao",
      workArea: "Security & Auth",
      status: "In Progress",
      blocker: "None",
      attendance: "Present",
      challenge: "Token Refresh Edge-case",
      date: "29 September 2026",
      sourceMessage: "Implementing OAuth 2.0 PKCE flow for Manager portal. Resolving edge-case with concurrent token refresh requests.",
      extractedInfo: {
        workArea: "Security & Auth",
        status: "In Progress",
        blocker: "None",
        confidence: 0.97
      }
    },
    {
      id: "digest-maya",
      teamId: "team-delta",
      teamName: "Team Delta",
      employeeId: "emp-maya",
      employeeName: "Maya Patel",
      workArea: "Event Gateway",
      status: "Blocked",
      blocker: "Message Queue Throttling",
      attendance: "Present",
      challenge: "Partition Throttling",
      date: "29 September 2026",
      sourceMessage: "Event hub partition reached maximum batch quota during high-frequency stress testing.",
      extractedInfo: {
        workArea: "Event Gateway",
        status: "Blocked",
        blocker: "Message Queue Throttling",
        challenge: "Partition Throttling",
        confidence: 0.96
      }
    },
    {
      id: "digest-leo",
      teamId: "team-delta",
      teamName: "Team Delta",
      employeeId: "emp-leo",
      employeeName: "Leo Vance",
      workArea: "Zero Trust Network Policy",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Deployed Azure Calico network policies restricting pod-to-pod ingress strictly across authorized mTLS namespaces.",
      extractedInfo: {
        workArea: "Zero Trust Network Policy",
        status: "Completed",
        blocker: "None",
        confidence: 0.98
      }
    },
    {
      id: "digest-kavita",
      teamId: "team-delta",
      teamName: "Team Delta",
      employeeId: "emp-kavita",
      employeeName: "Kavita Nair",
      workArea: "Compliance & Audit Logger",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Verified immutable audit log hashing using Azure KeyVault asymmetric keys. Meets SOC-2 Type II standards.",
      extractedInfo: {
        workArea: "Compliance & Audit Logger",
        status: "Completed",
        blocker: "None",
        confidence: 0.99
      }
    },

    // --- TEAM EPSILON (DevOps & Azure Cloud) ---
    {
      id: "digest-8",
      teamId: "team-epsilon",
      teamName: "Team Epsilon",
      employeeId: "emp-carlos",
      employeeName: "Carlos Mendez",
      workArea: "Cloud Infrastructure",
      status: "Pending",
      blocker: "None",
      attendance: "Present",
      challenge: "PR Review Latency",
      date: "29 September 2026",
      sourceMessage: "Awaiting approval on Azure Resource Manager virtual network peering pull request before deploying production ingress.",
      extractedInfo: {
        workArea: "Cloud Infrastructure",
        status: "Pending",
        blocker: "None",
        confidence: 0.95
      }
    },
    {
      id: "digest-sophie",
      teamId: "team-epsilon",
      teamName: "Team Epsilon",
      employeeId: "emp-sophie",
      employeeName: "Sophie Dupont",
      workArea: "Prometheus Monitoring",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Connected Prometheus scrapers and OpenTelemetry collectors with real-time alerting rules.",
      extractedInfo: {
        workArea: "Prometheus Monitoring",
        status: "Completed",
        blocker: "None",
        confidence: 0.98
      }
    },
    {
      id: "digest-nathan",
      teamId: "team-epsilon",
      teamName: "Team Epsilon",
      employeeId: "emp-nathan",
      employeeName: "Nathan Drake",
      workArea: "Azure VNet Peering",
      status: "Overdue",
      blocker: "None",
      attendance: "Present",
      challenge: "Route Table Synchronization",
      date: "29 September 2026",
      sourceMessage: "Route table synchronization between staging and production VNets encountered route conflict.",
      extractedInfo: {
        workArea: "Azure VNet Peering",
        status: "Overdue",
        blocker: "None",
        confidence: 0.94
      }
    },
    {
      id: "digest-rachel",
      teamId: "team-epsilon",
      teamName: "Team Epsilon",
      employeeId: "emp-rachel",
      employeeName: "Rachel Green",
      workArea: "Grafana Dashboards",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Deployed executive telemetry and cluster node utilization dashboards to production Grafana.",
      extractedInfo: {
        workArea: "Grafana Dashboards",
        status: "Completed",
        blocker: "None",
        confidence: 0.99
      }
    },

    // --- TEAM ZETA (QA & Performance Testing) ---
    {
      id: "digest-7",
      teamId: "team-zeta",
      teamName: "Team Zeta",
      employeeId: "emp-priya",
      employeeName: "Priya Sharma",
      workArea: "QA & Testing",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Automated end-to-end regression test suite successfully ran against staging build. All 84 test assertions passed.",
      extractedInfo: {
        workArea: "QA & Testing",
        status: "Completed",
        blocker: "None",
        confidence: 0.98
      }
    },
    {
      id: "digest-arjun",
      teamId: "team-zeta",
      teamName: "Team Zeta",
      employeeId: "emp-arjun",
      employeeName: "Arjun Kapoor",
      workArea: "CI/CD Test Runner",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Containerized GitHub Actions / Azure DevOps test runner agents with automated parallel test execution.",
      extractedInfo: {
        workArea: "CI/CD Test Runner",
        status: "Completed",
        blocker: "None",
        confidence: 0.98
      }
    },
    {
      id: "digest-emma",
      teamId: "team-zeta",
      teamName: "Team Zeta",
      employeeId: "emp-emma",
      employeeName: "Emma Watson",
      workArea: "Load Spike Stress Test",
      status: "In Progress",
      blocker: "None",
      attendance: "Present",
      challenge: "10k Client Emulation",
      date: "29 September 2026",
      sourceMessage: "Running 10,000 concurrent mock WebSocket client connections to verify connection pool resiliency.",
      extractedInfo: {
        workArea: "Load Spike Stress Test",
        status: "In Progress",
        blocker: "None",
        confidence: 0.96
      }
    },
    {
      id: "digest-ananya",
      teamId: "team-zeta",
      teamName: "Team Zeta",
      employeeId: "emp-ananya",
      employeeName: "Ananya Roy",
      workArea: "Visual Regression Tests",
      status: "Completed",
      blocker: "None",
      attendance: "Present",
      challenge: "None",
      date: "29 September 2026",
      sourceMessage: "Captured pixel-perfect visual snapshots across Chrome, Edge, Safari, and mobile viewport widths.",
      extractedInfo: {
        workArea: "Visual Regression Tests",
        status: "Completed",
        blocker: "None",
        confidence: 0.99
      }
    }
  ],

  // 54+ Work Items (Tasks overview - Read-only for Manager)
  tasks: [
    { id: "task-01", workArea: "Fix API", employee: "Aadarsh", team: "Team Alpha", status: "Incomplete", priority: "High", deadline: "20 September 2026", progress: 40, blocker: "API Access", daysInStatus: 2 },
    { id: "task-01b", workArea: "Frontend Integration", employee: "Aadarsh", team: "Team Alpha", status: "Pending", priority: "Medium", deadline: "25 September 2026", progress: 60, blocker: "None", daysInStatus: 2 },
    { id: "task-02", workArea: "Backend Integration", employee: "Rishabh", team: "Team Beta", status: "Pending", deadline: "2026-09-28", progress: 30, blocker: "Hardware Issue", daysInStatus: 7, isSilentDelay: true },
    { id: "task-02b", workArea: "API Integration", employee: "Rishabh", team: "Team Beta", status: "Blocked", priority: "High", deadline: "30 September 2026", progress: 45, blocker: "API Access", daysInStatus: 2 },
    { id: "task-03", workArea: "UI/UX Design System", employee: "Avni", team: "Team Alpha", status: "Completed", deadline: "2026-09-25", progress: 100, blocker: "None", daysInStatus: 4 },
    { id: "task-04", workArea: "Microservices Gateway", employee: "Lucas Silva", team: "Team Beta", status: "Blocked", deadline: "2026-09-29", progress: 40, blocker: "API Access", daysInStatus: 3 },
    { id: "task-05", workArea: "Security & Entra ID", employee: "Sneha Rao", team: "Team Delta", status: "In Progress", deadline: "2026-10-02", progress: 70, blocker: "None", daysInStatus: 2 },
    { id: "task-06", workArea: "Redis Distributed Cache", employee: "Vikram Mehta", team: "Team Gamma", status: "In Progress", deadline: "2026-10-01", progress: 65, blocker: "None", daysInStatus: 2 },
    { id: "task-07", workArea: "QA Regression Matrix", employee: "Priya Sharma", team: "Team Zeta", status: "Completed", deadline: "2026-09-26", progress: 100, blocker: "None", daysInStatus: 3 },
    { id: "task-08", workArea: "Kubernetes Auto-Scaler", employee: "Carlos Mendez", team: "Team Epsilon", status: "Pending", deadline: "2026-10-04", progress: 20, blocker: "None", daysInStatus: 2 },
    { id: "task-09", workArea: "Core Architecture Spec", employee: "Elena Rostova", team: "Team Alpha", status: "Completed", deadline: "2026-09-15", progress: 100, blocker: "None", daysInStatus: 14 },
    { id: "task-10", workArea: "Vector Embeddings Pipeline", employee: "Chen Wei", team: "Team Gamma", status: "Completed", deadline: "2026-09-22", progress: 100, blocker: "None", daysInStatus: 7 },
    { id: "task-11", workArea: "Event Gateway Throttling", employee: "Maya Patel", team: "Team Delta", status: "Blocked", deadline: "2026-09-28", progress: 50, blocker: "Message Queue Throttling", daysInStatus: 2 },
    { id: "task-12", workArea: "Asynchronous RPC Bus", employee: "Marcus Thorne", team: "Team Beta", status: "Completed", deadline: "2026-09-20", progress: 100, blocker: "None", daysInStatus: 9 },
    { id: "task-13", workArea: "Azure VNet Peering", employee: "Nathan Drake", team: "Team Epsilon", status: "Overdue", deadline: "2026-09-27", progress: 60, blocker: "None", daysInStatus: 5 },
    { id: "task-14", workArea: "Compliance Audit Logger", employee: "Kavita Nair", team: "Team Delta", status: "Completed", deadline: "2026-09-24", progress: 100, blocker: "None", daysInStatus: 5 },
    { id: "task-15", workArea: "Search Ingestion Sharding", employee: "Chloe Adams", team: "Team Gamma", status: "Completed", deadline: "2026-09-23", progress: 100, blocker: "None", daysInStatus: 6 },
    { id: "task-16", workArea: "CI/CD Test Runner", employee: "Arjun Kapoor", team: "Team Zeta", status: "Completed", deadline: "2026-09-25", progress: 100, blocker: "None", daysInStatus: 4 },
    { id: "task-17", workArea: "Frontend Layout Resiliency", employee: "Daniel Craig", team: "Team Alpha", status: "In Progress", deadline: "2026-10-01", progress: 80, blocker: "None", daysInStatus: 2 },
    { id: "task-18", workArea: "Prometheus Monitoring", employee: "Sophie Dupont", team: "Team Epsilon", status: "Completed", deadline: "2026-09-24", progress: 100, blocker: "None", daysInStatus: 5 },
    { id: "task-19", workArea: "Load Spike Stress Test", employee: "Emma Watson", team: "Team Zeta", status: "In Progress", deadline: "2026-10-02", progress: 55, blocker: "None", daysInStatus: 2 },
    { id: "task-20", workArea: "State Store Synchronization", employee: "Aadarsh", team: "Team Alpha", status: "Completed", deadline: "2026-09-18", progress: 100, blocker: "None", daysInStatus: 11 },
    { id: "task-21", workArea: "CosmosDB Data Partitioning", employee: "Tara Chen", team: "Team Beta", status: "Overdue", deadline: "2026-09-26", progress: 75, blocker: "None", daysInStatus: 6 },
    { id: "task-22", workArea: "Zero Trust Network Policy", employee: "Leo Vance", team: "Team Delta", status: "Completed", deadline: "2026-09-21", progress: 100, blocker: "None", daysInStatus: 8 },
    { id: "task-23", workArea: "Semantic Search Index", employee: "Zack Taylor", team: "Team Gamma", status: "Completed", deadline: "2026-09-24", progress: 100, blocker: "None", daysInStatus: 5 },
    { id: "task-24", workArea: "Grafana Enterprise Dashboards", employee: "Rachel Green", team: "Team Epsilon", status: "Completed", deadline: "2026-09-22", progress: 100, blocker: "None", daysInStatus: 7 },
    { id: "task-25", workArea: "Visual Regression Tests", employee: "Ananya Roy", team: "Team Zeta", status: "Completed", deadline: "2026-09-27", progress: 100, blocker: "None", daysInStatus: 2 },
    { id: "task-26", workArea: "Manager KPI Telemetry", employee: "Avni", team: "Team Alpha", status: "Completed", deadline: "2026-09-28", progress: 100, blocker: "None", daysInStatus: 1 },
    { id: "task-27", workArea: "GraphQL Schema Stitching", employee: "Marcus Thorne", team: "Team Beta", status: "Completed", deadline: "2026-09-19", progress: 100, blocker: "None", daysInStatus: 10 },
    { id: "task-28", workArea: "Database Re-indexing", employee: "Tara Chen", team: "Team Beta", status: "Completed", deadline: "2026-09-20", progress: 100, blocker: "None", daysInStatus: 9 },
    { id: "task-29", workArea: "Data Lake Ingestion", employee: "Chen Wei", team: "Team Gamma", status: "Completed", deadline: "2026-09-16", progress: 100, blocker: "None", daysInStatus: 13 },
    { id: "task-30", workArea: "SSL Certificate Auto-Renewal", employee: "Nathan Drake", team: "Team Epsilon", status: "Completed", deadline: "2026-09-14", progress: 100, blocker: "None", daysInStatus: 15 },
    { id: "task-31", workArea: "API Rate Limiter Middleware", employee: "Elena Rostova", team: "Team Alpha", status: "Completed", deadline: "2026-09-21", progress: 100, blocker: "None", daysInStatus: 8 },
    { id: "task-32", workArea: "Log Aggregation FluentBit", employee: "Sophie Dupont", team: "Team Epsilon", status: "Completed", deadline: "2026-09-23", progress: 100, blocker: "None", daysInStatus: 6 },
    { id: "task-33", workArea: "Penetration Test Remediation", employee: "Sneha Rao", team: "Team Delta", status: "Completed", deadline: "2026-09-25", progress: 100, blocker: "None", daysInStatus: 4 },
    { id: "task-34", workArea: "High-DPI Canvas Charts", employee: "Daniel Craig", team: "Team Alpha", status: "Completed", deadline: "2026-09-26", progress: 100, blocker: "None", daysInStatus: 3 },
    { id: "task-35", workArea: "Cross-Origin Policy Audit", employee: "Leo Vance", team: "Team Delta", status: "Completed", deadline: "2026-09-19", progress: 100, blocker: "None", daysInStatus: 10 },
    { id: "task-36", workArea: "Offline Persistence Layer", employee: "Aadarsh", team: "Team Alpha", status: "Completed", deadline: "2026-09-22", progress: 100, blocker: "None", daysInStatus: 7 },
    { id: "task-37", workArea: "Dead Letter Queue Processor", employee: "Maya Patel", team: "Team Delta", status: "Pending", deadline: "2026-10-03", progress: 15, blocker: "None", daysInStatus: 3 },
    { id: "task-38", workArea: "Microservice Health Pings", employee: "Lucas Silva", team: "Team Beta", status: "Completed", deadline: "2026-09-17", progress: 100, blocker: "None", daysInStatus: 12 },
    { id: "task-39", workArea: "Automated Mock API Generator", employee: "Vikram Mehta", team: "Team Gamma", status: "Completed", deadline: "2026-09-25", progress: 100, blocker: "None", daysInStatus: 4 },
    { id: "task-40", workArea: "Browser Accessibility WCAG", employee: "Ananya Roy", team: "Team Zeta", status: "Completed", deadline: "2026-09-23", progress: 100, blocker: "None", daysInStatus: 6 },
    { id: "task-41", workArea: "Cluster Auto-Repair Policies", employee: "Carlos Mendez", team: "Team Epsilon", status: "Completed", deadline: "2026-09-21", progress: 100, blocker: "None", daysInStatus: 8 },
    { id: "task-42", workArea: "Database Connection Pool Tuning", employee: "Rishabh", team: "Team Beta", status: "Completed", deadline: "2026-09-15", progress: 100, blocker: "None", daysInStatus: 14 },
    { id: "task-43", workArea: "Token Exchange Bridge", employee: "Rishabh", team: "Team Beta", status: "Completed", deadline: "2026-09-20", progress: 100, blocker: "None", daysInStatus: 9 },
    { id: "task-44", workArea: "Container Image Vulnerability Scan", employee: "Rachel Green", team: "Team Epsilon", status: "Completed", deadline: "2026-09-24", progress: 100, blocker: "None", daysInStatus: 5 },
    { id: "task-45", workArea: "Websocket Heartbeat Telemetry", employee: "Emma Watson", team: "Team Zeta", status: "Completed", deadline: "2026-09-25", progress: 100, blocker: "None", daysInStatus: 4 },
    { id: "task-46", workArea: "Distributed Trace Correlation", employee: "Lucas Silva", team: "Team Beta", status: "Completed", deadline: "2026-09-22", progress: 100, blocker: "None", daysInStatus: 7 },
    { id: "task-47", workArea: "Data Pipeline Backpressure Guard", employee: "Chloe Adams", team: "Team Gamma", status: "Completed", deadline: "2026-09-24", progress: 100, blocker: "None", daysInStatus: 5 },
    { id: "task-48", workArea: "UI FlowAI Drawer Architecture", employee: "Avni", team: "Team Alpha", status: "Completed", deadline: "2026-09-28", progress: 100, blocker: "None", daysInStatus: 1 },
    { id: "task-49", workArea: "End-to-End Encryption Transit", employee: "Kavita Nair", team: "Team Delta", status: "Completed", deadline: "2026-09-21", progress: 100, blocker: "None", daysInStatus: 8 },
    { id: "task-50", workArea: "Synthetic Load Generator", employee: "Arjun Kapoor", team: "Team Zeta", status: "Completed", deadline: "2026-09-25", progress: 100, blocker: "None", daysInStatus: 4 },
    { id: "task-51", workArea: "Edge CDN Caching Invalidation", employee: "Zack Taylor", team: "Team Gamma", status: "Completed", deadline: "2026-09-23", progress: 100, blocker: "None", daysInStatus: 6 },
    { id: "task-52", workArea: "Azure Bastion Host Setup", employee: "Nathan Drake", team: "Team Epsilon", status: "Pending", deadline: "2026-10-04", progress: 35, blocker: "None", daysInStatus: 3 },
    { id: "task-53", workArea: "Audit Trail Signature Verifier", employee: "Elena Rostova", team: "Team Alpha", status: "Completed", deadline: "2026-09-26", progress: 100, blocker: "None", daysInStatus: 3 },
    { id: "task-54", workArea: "Service Mesh MTLS Configuration", employee: "Carlos Mendez", team: "Team Epsilon", status: "Overdue", deadline: "2026-09-28", progress: 50, blocker: "None", daysInStatus: 4 }
  ],

  // Blockers Center Data
  blockers: [
    {
      id: "blocker-1",
      title: "API Access",
      team: "Team Alpha",
      teamId: "team-alpha",
      affectedWorkArea: "Software Integration",
      assignedEmployee: "Aadarsh",
      daysActive: 2,
      isRecurring: true, // IMPORTANT: consecutive days
      severity: "High",
      status: "Unresolved",
      sourceUpdateId: "digest-2",
      reportedDate: "2026-09-27",
      lastReported: "2026-09-29",
      consecutiveDays: 2,
      sourceExcerpt: "Software is not done because I don't have API access.",
      impact: "Blocks downstream microservices and client telemetry tests. Cross-team dependency detected."
    },
    {
      id: "blocker-rishabh-api",
      title: "API Access",
      team: "Team Beta",
      teamId: "team-beta",
      affectedWorkArea: "API Integration",
      assignedEmployee: "Rishabh",
      daysActive: 2,
      isRecurring: false,
      severity: "High",
      status: "Unresolved",
      sourceUpdateId: "digest-rishabh",
      reportedDate: "2026-09-28",
      lastReported: "2026-09-29",
      consecutiveDays: 2,
      sourceExcerpt: "API Integration is blocked waiting for token exchange bridge access.",
      impact: "Blocks downstream microservices and telemetry tests. Aadarsh has completed similar work.",
      canBeHelpedBy: "Aadarsh"
    },
    {
      id: "blocker-2",
      title: "API Access",
      team: "Team Gamma",
      teamId: "team-gamma",
      affectedWorkArea: "Data Pipeline & Gateway",
      assignedEmployee: "Chloe Adams",
      daysActive: 2,
      isRecurring: false,
      severity: "High",
      status: "Unresolved",
      sourceUpdateId: "digest-4",
      reportedDate: "2026-09-28",
      lastReported: "2026-09-29",
      consecutiveDays: 2,
      sourceExcerpt: "Awaiting API credentials to complete Azure KeyVault ingestion.",
      impact: "Common blocker affecting multiple teams (Team Alpha & Team Gamma)."
    },
    {
      id: "blocker-3",
      title: "Gateway Timeout",
      team: "Team Beta",
      teamId: "team-beta",
      affectedWorkArea: "Microservices Gateway",
      assignedEmployee: "Lucas Silva",
      daysActive: 4,
      isRecurring: false,
      severity: "Medium",
      status: "In Progress",
      sourceUpdateId: "digest-4",
      reportedDate: "2026-09-26",
      lastReported: "2026-09-29",
      consecutiveDays: 1,
      sourceExcerpt: "Experiencing gateway timeouts during mock handshake.",
      impact: "Intermittent network timeouts during RPC testing."
    },
    {
      id: "blocker-4",
      title: "Message Queue Throttling",
      team: "Team Delta",
      teamId: "team-delta",
      affectedWorkArea: "Event Gateway",
      assignedEmployee: "Maya Patel",
      daysActive: 1,
      isRecurring: false,
      severity: "Low",
      status: "In Progress",
      sourceUpdateId: "digest-5",
      reportedDate: "2026-09-29",
      lastReported: "2026-09-29",
      consecutiveDays: 1,
      sourceExcerpt: "Rate limiting on test queue partitions under high volume.",
      impact: "Minor delay on dead letter queue stress tests."
    }
  ],

  // Silent Delays (Consecutive status PENDING for ~7 days)
  silentDelays: [
    {
      id: "delay-1",
      team: "Team Beta",
      teamId: "team-beta",
      workArea: "Backend Integration",
      assignedEmployee: "Rishabh",
      status: "Pending",
      durationDays: 7,
      lastUpdateDate: "23 September 2026",
      detectionDate: "29 September 2026",
      statusHistory: ["Pending", "Pending", "Pending", "Pending", "Pending", "Pending", "Pending"],
      notes: "Work item status has remained in Pending state for 7 consecutive days without completion or active blocker flag. Affected member is also currently marked On Leave."
    }
  ],

  // Automatic Meeting Suggestion (Cross-team common blocker)
  suggestedMeetings: [
    {
      id: "meeting-sugg-1",
      issue: "API Access",
      affectedMembersCount: 4,
      affectedTeams: ["Team Alpha", "Team Gamma"],
      affectedMembers: ["Aadarsh", "Lucas Silva", "Chloe Adams", "Tara Chen"],
      suggestedParticipants: "Elena Rostova (Lead Alpha), Chen Wei (Lead Gamma), Aadarsh, Lucas Silva, Chloe Adams",
      agenda: "Cross-team API Credentials & Azure KeyVault Access Resolution Sync",
      proposedDuration: "25 minutes",
      suggestedTime: "Today at 3:30 PM IST",
      status: "Suggested", // Suggested | Created | Dismissed
      teamsLink: "https://teams.microsoft.com/l/meetup-join/19:meeting_mock_worknex_hackathon@thread.v2"
    }
  ],

  // Leave & Work Reassignment Suggestion
  leaveReassignments: [
    {
      id: "reassign-1",
      employee: "Rishabh",
      employeeId: "emp-rishabh",
      team: "Team Beta",
      status: "On Leave",
      affectedWork: "Backend Integration",
      suggestedAssignee: "Elena Rostova",
      suggestedAssigneeId: "emp-elena",
      suggestedAssigneeRole: "Principal Architect (Available capacity: 40%)",
      reason: "Rishabh is on leave due to hardware issue. Backend Integration has silent delay (7 days). Elena Rostova has completed current deliverables and holds matching backend architecture expertise.",
      statusState: "Pending Approval" // Pending Approval | Approved | Dismissed
    }
  ],

  // Attendance History for Aadarsh (Voluntary reporting via daily updates - Zero surveillance)
  aadarshAttendanceHistory: [
    { date: "1 Oct", status: "Present" },
    { date: "2 Oct", status: "Present" },
    { date: "3 Oct", status: "On Leave" },
    { date: "4 Oct", status: "Present" }
  ],

  // Employee Credits (Verified Collaboration Help Activities - Read-only)
  employeeCredits: [
    { id: "cred-aadarsh-1", employee: "Aadarsh", credits: 150, change: "+30", reason: "Helped Rishabh resolve API Integration blocker", date: "18 Sept 2026" },
    { id: "cred-aadarsh-2", employee: "Aadarsh", credits: 120, change: "+50", reason: "Helped another employee with Backend Integration", date: "14 Sept 2026" },
    { id: "cred-aadarsh-3", employee: "Aadarsh", credits: 70, change: "+70", reason: "Assisted Team Beta with Backend challenge", date: "10 Sept 2026" },
    { id: "cred-1", employee: "Rishabh", credits: 50, change: "+50", reason: "Assisted Team Beta with Core Service optimization", date: "15 Sept 2026" },
    { id: "cred-3", employee: "Avni", credits: 50, change: "+50", reason: "Helped resolve UI/UX challenge", date: "17 Sept 2026" },
    { id: "cred-4", employee: "Elena Rostova", credits: 75, change: "+75", reason: "Assisted Team Delta with Webhook testing", date: "16 Sept 2026" },
    { id: "cred-5", employee: "Vikram Mehta", credits: 80, change: "+80", reason: "Helped Team Gamma with Cache invalidation bug", date: "19 Sept 2026" },
    { id: "cred-6", employee: "Sneha Rao", credits: 120, change: "+120", reason: "Assisted Team Epsilon with Entra ID federation setup", date: "21 Sept 2026" },
    { id: "cred-7", employee: "Chen Wei", credits: 90, change: "+90", reason: "Guided Team Beta on CosmosDB sharding pattern", date: "18 Sept 2026" },
    { id: "cred-8", employee: "Priya Sharma", credits: 85, change: "+85", reason: "Assisted Team Alpha with automated E2E test setup", date: "22 Sept 2026" }
  ],

  // Employee Achievements (Read-only)
  employeeAchievements: [
    {
      id: "ach-aadarsh-1",
      employee: "Aadarsh",
      achievement: "Backend Milestone Completed",
      project: "Microsoft Hackathon",
      date: "20 September 2026",
      description: "Delivered high-throughput asynchronous payload pipeline on schedule with zero breaking API changes."
    },
    {
      id: "ach-aadarsh-2",
      employee: "Aadarsh",
      achievement: "Collaboration Achievement",
      project: "Cross-Team Unblocking",
      date: "18 September 2026",
      description: "Helped resolve API Integration blocker for peer backend engineer."
    },
    {
      id: "ach-1",
      employee: "Rishabh",
      achievement: "Successfully resolved API Integration challenge",
      project: "Microsoft Hackathon",
      date: "20 Sept 2026",
      description: "Architected a zero-dependency token exchange bridge to bypass proxy constraints, unblocking Team Alpha and Team Beta."
    },
    {
      id: "ach-3",
      employee: "Avni",
      achievement: "Completed UI/UX milestone",
      project: "Project Alpha",
      date: "17 Sept 2026",
      description: "Standardized Microsoft Fluent 2 enterprise design system tokens, responsive navigation shell, and dark-mode ready palette."
    },
    {
      id: "ach-4",
      employee: "Elena Rostova",
      achievement: "Zero-Downtime Migration Execution",
      project: "Azure Cloud Migration",
      date: "12 Sept 2026",
      description: "Successfully orchestrated migration of 14 core microservices to Azure Kubernetes with zero service downtime."
    },
    {
      id: "ach-5",
      employee: "Priya Sharma",
      achievement: "Automated E2E Regression Suite",
      project: "Microsoft Hackathon",
      date: "22 Sept 2026",
      description: "Constructed 100% automated regression test coverage matrix across all distributed microservices."
    },
    {
      id: "ach-6",
      employee: "Carlos Mendez",
      achievement: "Kubernetes Auto-Scaling Hardening",
      project: "Infrastructure Modernization",
      date: "05 Sept 2026",
      description: "Configured KEDA event-driven auto-scaling, reducing pod startup cold-latencies by 64%."
    }
  ],

  // Weekly Progress Data for interactive charts
  weeklyReports: {
    overallProgress: 78,
    completedWork: 42,
    pendingWork: 11,
    overdueWork: 3,
    unresolvedBlockers: 4,
    dailyVelocity: [
      { day: "Monday", progress: 62, completedCount: 28, blockersCount: 6 },
      { day: "Tuesday", progress: 68, completedCount: 33, blockersCount: 5 },
      { day: "Wednesday", progress: 71, completedCount: 37, blockersCount: 5 },
      { day: "Thursday", progress: 75, completedCount: 40, blockersCount: 4 },
      { day: "Friday", progress: 78, completedCount: 42, blockersCount: 4 }
    ],
    taskHealthDistribution: {
      completed: 60,
      inProgress: 25,
      pending: 10,
      blocked: 5
    },
    blockerTrend: [
      { day: "23 Sep", active: 7, resolved: 2 },
      { day: "24 Sep", active: 6, resolved: 3 },
      { day: "25 Sep", active: 5, resolved: 4 },
      { day: "26 Sep", active: 5, resolved: 2 },
      { day: "27 Sep", active: 4, resolved: 3 },
      { day: "28 Sep", active: 4, resolved: 2 },
      { day: "29 Sep", active: 4, resolved: 1 }
    ],
    velocityCumulative: [
      { date: "23 Sep", completed: 22 },
      { date: "24 Sep", completed: 28 },
      { date: "25 Sep", completed: 33 },
      { date: "26 Sep", completed: 37 },
      { date: "27 Sep", completed: 39 },
      { date: "28 Sep", completed: 41 },
      { date: "29 Sep", completed: 42 }
    ]
  },

  // Notification Center
  notifications: [
    {
      id: "notif-1",
      type: "recurring_blocker",
      severity: "critical", // RED
      title: "Recurring blocker detected",
      message: "API Access has appeared for 3 consecutive days.",
      relatedTeam: "Team Alpha",
      relatedWork: "Software Integration",
      timestamp: "Today, 09:15 AM",
      date: "2026-09-29",
      unread: true,
      actionRoute: "blockers",
      actionLabel: "View Blocker",
      badgeColor: "#EF4444"
    },
    {
      id: "notif-2",
      type: "silent_delay",
      severity: "warning", // ORANGE
      title: "Silent delay detected",
      message: "Backend Integration has remained pending for 7 days.",
      relatedTeam: "Team Beta",
      relatedWork: "Backend Integration",
      timestamp: "Today, 08:30 AM",
      date: "2026-09-29",
      unread: true,
      actionRoute: "dashboard",
      actionLabel: "Review Delay",
      badgeColor: "#F59E0B"
    },
    {
      id: "notif-3",
      type: "challenge",
      severity: "info", // BLUE
      title: "New challenge detected",
      message: "Team Alpha has encountered a challenge.",
      relatedTeam: "Team Alpha",
      relatedWork: "Software Integration",
      timestamp: "Yesterday, 04:45 PM",
      date: "2026-09-28",
      unread: false,
      actionRoute: "dashboard",
      actionLabel: "View Challenge",
      badgeColor: "#0284C7"
    },
    {
      id: "notif-4",
      type: "meeting_suggestion",
      severity: "ai", // PURPLE
      title: "Collaboration meeting suggested",
      message: "API Access affects multiple members.",
      relatedTeam: "Team Alpha & Gamma",
      relatedWork: "API Gateway",
      timestamp: "Today, 10:00 AM",
      date: "2026-09-29",
      unread: true,
      actionRoute: "dashboard",
      actionLabel: "Review Meeting",
      badgeColor: "#8B5CF6"
    },
    {
      id: "notif-5",
      type: "completion",
      severity: "success", // GREEN
      title: "Work completed",
      message: "UI/UX work completed by Team Alpha.",
      relatedTeam: "Team Alpha",
      relatedWork: "UI/UX Design System",
      timestamp: "Today, 11:20 AM",
      date: "2026-09-29",
      unread: false,
      actionRoute: "tasks",
      actionLabel: "View Task",
      badgeColor: "#10B981"
    }
  ],

  // Activity Log
  activityLogs: [
    { id: "act-1", date: "29 Sept 2026", time: "11:20 AM", action: "Collaboration meeting suggested", actor: "FlowAI Engine", related: "API Access (Team Alpha & Gamma)" },
    { id: "act-2", date: "29 Sept 2026", time: "10:45 AM", action: "Reassignment suggestion generated", actor: "FlowAI Engine", related: "Backend Integration (Rishabh on leave)" },
    { id: "act-3", date: "29 Sept 2026", time: "09:30 AM", action: "Recurring blocker flagged", actor: "FlowAI Engine", related: "API Access (3 consecutive days)" },
    { id: "act-4", date: "29 Sept 2026", time: "09:18 AM", action: "Avni viewed source", actor: "Avni (Manager)", related: "Aadarsh's update (Software Integration)" },
    { id: "act-5", date: "29 Sept 2026", time: "09:05 AM", action: "AI detected API blocker", actor: "FlowAI Engine", related: "Aadarsh's daily update processed" },
    { id: "act-6", date: "28 Sept 2026", time: "05:00 PM", action: "Silent delay flagged", actor: "FlowAI Engine", related: "Backend Integration (Day 6 pending)" },
    { id: "act-7", date: "28 Sept 2026", time: "02:30 PM", action: "Work completed logged", actor: "FlowAI Engine", related: "Visual Regression Tests (Team Zeta)" },
    { id: "act-8", date: "27 Sept 2026", time: "11:15 AM", action: "Blocker initially recorded", actor: "FlowAI Engine", related: "API Access (Team Alpha)" }
  ]
};

// Export to global scope
window.WORKNEX_INITIAL_DATA = WORKNEX_INITIAL_DATA;
