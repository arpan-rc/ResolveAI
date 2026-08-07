# ResolveAI — Human-in-the-Loop Customer Support Ticket Automation

> **Hackathon Submission:** Deploy or Die: HowToAlgo x GDG on Campus KIIT Hackathon  
> **Track:** Track A — Business Process Automation  
> **Tagline:** AI-powered support automation with human oversight.  
> **Core Principle:** *"AI recommends. Humans decide."*

---

## 🌟 Executive Summary

**ResolveAI** automates repetitive customer support ticket triaging, categorization, priority scoring, department routing, and response drafting — while enforcing strict **Human-in-the-Loop (HITL) verification** before any action or customer dispatch occurs.

AI does **NOT** have final authority. Every AI recommendation enters an **Awaiting Human Review** state where a human agent can **Approve**, **Edit & Approve**, **Reject**, or **Escalate** the decision.

---

## 📐 Architecture & Modular System Design

ResolveAI is designed with a **Modular AI Service Layer** and a **Deterministic Fallback Engine** to guarantee 100% application uptime. Even if the primary AI API is unavailable, rate-limited, times out, or receives no API key, **the application never crashes, loses data, or halts the workflow**.

```
                           ┌───────────────────────────┐
                           │    Customer Submits       │
                           │     Support Ticket        │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │      AI Service           │
                           │   (Timeout & Validation)  │
                           └─────────────┬─────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
         [AI Available & Key Set]                     [API Down / Timeout / No Key]
                   │                                           │
                   ▼                                           ▼
       ┌───────────────────────┐                  ┌────────────────────────┐
       │ Claude 3.5 Sonnet     │                  │ Deterministic Fallback │
       │ Provider (Anthropic)  │                  │ Keyword Rule Engine    │
       └───────────┬───────────┘                  └────────────┬───────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │   AI Recommendation       │
                           │ Category | Priority | Dept│
                           │ Confidence | Draft Response│
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │  🔴 MANDATORY HUMAN       │
                           │     VERIFICATION          │
                           └─────────────┬─────────────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
                   ▼                     ▼                     ▼
            [ Approve ]           [ Edit & Approve ]       [ Reject ]
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │ Verified Customer         │
                           │ Response & Audit Log      │
                           └───────────────────────────┘
```

---

## ✨ Key Features

1. **Human-in-the-Loop Safeguards:** Prominent visual banners flag high-risk actions (refunds, account deletions, fraud) requiring mandatory human sign-off.
2. **Modular Dual AI Engine:** Automatically uses **Claude 3.5 Sonnet** when an API key is present, and seamlessly transitions to the **Deterministic Rule Engine** if offline.
3. **Editable Decision Workspace:** Human agents can override category, priority, department, or response text before dispatch.
4. **Interactive Customer Email Simulator:** Real-time preview showing how the customer receives the verified response.
5. **Complete Audit Trail:** Every event is logged with timestamps, actors (`CUSTOMER`, `AI_SYSTEM`, `HUMAN_AGENT`), and details.
6. **Demo Mode Test Bench:** Built-in modal to force fallback mode or simulate AI failures in 1 click for judges.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Node.js, Express, tsx
- **AI Layer:** `@anthropic-ai/sdk` (Claude 3.5 Sonnet) + Custom Deterministic Keyword Engine
- **Database:** Local in-memory seed database with Supabase/PostgreSQL schema compatibility

---

## 📁 Folder Structure

```
├── server.ts                       # Express + Vite server entry point
├── server/
│   ├── routes/
│   │   └── api.ts                  # REST API endpoints (/api/tickets, /api/ai/status)
│   ├── services/
│   │   ├── ai/
│   │   │   ├── aiService.ts        # Central AI Orchestrator (Timeouts, Fallbacks)
│   │   │   ├── claudeProvider.ts   # Anthropic Claude 3.5 Sonnet Integration
│   │   │   └── fallbackProvider.ts # Deterministic Rule Engine
│   │   └── db/
│   │       └── dbService.ts        # Seed Database & Audit Logger
│   └── types/
│       └── index.ts                # TypeScript schemas
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Navbar & AI Status Pill
│   │   ├── AIBanner.tsx            # HITL Protocol Banner
│   │   ├── StatsCards.tsx          # Metric counters & filters
│   │   ├── TicketQueue.tsx         # Searchable & filterable ticket table
│   │   ├── TicketDetail.tsx        # Human Review & Override Workspace
│   │   ├── CustomerPortal.tsx      # Customer Submission & Preset Loader
│   │   ├── AnalyticsPanel.tsx      # Telemetry & Audit Feed
│   │   └── AIToggleModal.tsx       # AI Test Bench & Fallback Switch
│   ├── App.tsx                     # Main layout orchestrator
│   └── main.tsx                    # React DOM entry point
└── .env.example                    # Environment key declarations
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
The server will start at `http://0.0.0.0:3000`. Open your browser to view the application.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env`:

```env
# Optional Anthropic Claude API Key (If omitted, Fallback Engine is used automatically)
ANTHROPIC_API_KEY=""

# Optional Supabase PostgreSQL database
SUPABASE_URL=""
SUPABASE_ANON_KEY=""

# Force fallback mode for testing
FORCE_FALLBACK_MODE="false"

PORT=3000
```

---

## 🧪 10-Point Reliability Test Matrix

| Test Scenario | Condition | Expected System Behavior | Status |
| :--- | :--- | :--- | :---: |
| **TEST 1** | Ticket + AI Key Active | Analyzed via Claude 3.5 Sonnet | ✅ Pass |
| **TEST 2** | AI Key Omitted / Unavailable | Auto-switches to Fallback Rule Engine | ✅ Pass |
| **TEST 3** | Invalid AI API Key | Graceful fallback with clear UI warning | ✅ Pass |
| **TEST 4** | AI Network Timeout (>8s) | Timeout caught, fallback engaged | ✅ Pass |
| **TEST 5** | High-Risk Ticket (Refund/Fraud) | Displays 🔴 HIGH-RISK ACTION mandate | ✅ Pass |
| **TEST 6** | Human Edits AI Rec | System tracks overrides & marks EDITED_APPROVED | ✅ Pass |
| **TEST 7** | Human Rejects AI Rec | Ticket marked REJECTED, returned for rework | ✅ Pass |
| **TEST 8** | Human Approves AI Rec | Marked APPROVED, email dispatch simulated | ✅ Pass |
| **TEST 9** | Audit History Log | Complete timeline recorded for all actions | ✅ Pass |
| **TEST 10**| Full Demo Mode (No keys) | 100% operational with seed tickets out of box | ✅ Pass |

---

## 🏆 Hackathon Presentation Demo Flow (3 Minutes)

1. **Overview (30s):** Open Agent Dashboard. Highlight the banner `"AI RECOMMENDATION — HUMAN VERIFICATION REQUIRED"`.
2. **High-Risk Ticket Inspection (45s):** Select Ticket `#TCK-1042` (Duplicate Charge). Show red `🔴 HIGH-RISK ACTION` warning badge. Point out that refund execution requires mandatory human sign-off.
3. **Human Verification & Override (45s):** Modify priority from `HIGH` → `CRITICAL` or customize response. Click **Approve & Dispatch Response**. Observe status changing to `Edited & Approved`.
4. **Customer Portal Submission (30s):** Switch to Customer Portal. Click quick preset *"Security & Unauthorized Charge"*. Submit ticket and watch real-time AI triage.
5. **Fallback Test Bench (30s):** Click the **AI Status Pill** in top header. Toggle **Force Fallback Mode**. Submit another ticket to demonstrate zero-crash fallback reliability.
