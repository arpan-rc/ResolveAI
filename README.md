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
2. **Modular Dual AI Engine:** Automatically uses **Claude 3.5 Sonnet / Gemini** when an API key is present, and seamlessly transitions to the **Deterministic Rule Engine** if offline.
3. **Role-Based Authentication & Authorization:** Two distinct roles (**Customer** and **Support Agent**) with secured frontend routes and backend header validation (`x-user-role`, `x-user-email`).
4. **Dynamic PDF Generator:** Customers can generate and download official **Invoice PDFs** for financial transactions or **Support Resolution PDFs** for general inquiries.
5. **Universal Theme System:** Seamless ☀ **Light Mode** & 🌙 **Dark Mode** toggle with instant reactivity and `localStorage` persistence.
6. **Editable Decision Workspace:** Human agents can override category, priority, department, or response text before dispatch.
7. **Complete Audit Trail:** Every event is logged with timestamps, actors (`CUSTOMER`, `AI_SYSTEM`, `HUMAN_AGENT`), and details.

---

## 🛠️ Tech Stack & Systems

### 🟩 Frontend

| Technology / Library | Role / Usage |
| :--- | :--- |
| **React 19** | User interface framework & reactive component state |
| **Vite 6** | Modern ESM dev server & fast application bundling |
| **Tailwind CSS v4** | Utility-first styling & high-contrast dark theme design system |
| **Lucide React** | Scalable vector icon system for enterprise UI components |
| **Motion** | Fluid animations, slide-overs & transition effects |

### 🟩 Backend

| Technology | Role / Usage |
| :--- | :--- |
| **Node.js** | Server-side runtime environment |
| **Express.js** | REST API endpoints (`/api/tickets`, `/api/ai/status`) & middleware |
| **tsx / esbuild** | TypeScript execution engine & production bundling |
| **Vitest** | Automated unit test suite (`npm test`) with zero network dependency |

### 🤖 AI Service & Intelligence Layer

| Library / Provider | Model / Capability | Usage |
| :--- | :--- | :--- |
| **@google/genai** | Google Gemini 2.5 / Flash | Intelligent ticket categorization, sentiment extraction & multi-modal support |
| **@anthropic-ai/sdk** | Anthropic Claude 3.5 Sonnet | LLM triage, policy compliance analysis & draft response synthesis |
| **Deterministic Rule Engine** | Offline Keyword Engine | Multi-tier fallback provider ensuring zero downtime during API latency or outages |

### 💾 Database & Audit Logging

| Technology | Usage |
| :--- | :--- |
| **In-Memory Session Store** | Fast local ticket state management & demo data resets |
| **PostgreSQL / Supabase** | Relational data schema & immutable human audit trail logging |

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

> 💡 **Prerequisite Notice:** If running terminal commands shows `'npm' is not recognized as an internal or external command`, Node.js is not installed on your laptop yet. Follow Step 1 below to download Node.js first.

### Setup Steps & Prerequisites Matrix

| Step | Required Action | Link / Command | Description |
| :---: | :--- | :--- | :--- |
| **01** | **Download Node.js & npm** | 📥 [nodejs.org (LTS Version)](https://nodejs.org/) | **Required first!** Install Node.js v18+ to enable `npm` in CMD/Terminal. Restart terminal after installation. |
| **02** | **Install Dependencies** | `npm install` | Downloads all frontend and backend project packages. |
| **03** | **Start Development Server** | `npm run dev` | Launches local server on `http://localhost:3000`. |

---

### Step-by-Step Setup Guide

#### 1. Download Node.js (If `'npm' is not recognized`)
If running `npm install` on a laptop throws `'npm' is not recognized as an internal or external command`:
1. Open your browser and go to **[https://nodejs.org/](https://nodejs.org/)**.
2. Download and run the **LTS (Long Term Support)** installer for Windows, macOS, or Linux.
3. Follow installer defaults (ensure *"Add to PATH"* is checked).
4. **Important:** Close and restart your Command Prompt / Terminal window after installation completes.
5. Confirm installation by typing:
   ```bash
   node -v
   npm -v
   ```

#### 2. Install Project Dependencies
```bash
npm install
```

#### 3. Run Application Locally
```bash
npm run dev
```
The server will start at `http://localhost:3000`. Open your browser to view the live app.

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

## 11. Public Demo

- **Customer Portal (Client Machine View):** 
  https://ais-pre-i2yrdz6sj2snl437hfbevr-414977834671.asia-southeast1.run.app/customer

- **Support Agent Station View:** 
  https://ais-pre-i2yrdz6sj2snl437hfbevr-414977834671.asia-southeast1.run.app/agent

- **Prototype Navigation Hub:** 
  https://ais-pre-i2yrdz6sj2snl437hfbevr-414977834671.asia-southeast1.run.app

### Demo Access Instructions
- Opening the **Customer Portal** link locks the session into a clean self-service ticket submission interface.
- Opening the **Agent Station** link directly opens the agent queue with human-in-the-loop review controls, bulk approval actions, and AI triage breakdowns.

---

## 🏆 Hackathon Presentation Demo Flow (3 Minutes)

1. **Overview (30s):** Open Agent Dashboard. Highlight the banner `"AI RECOMMENDATION — HUMAN VERIFICATION REQUIRED"`.
2. **High-Risk Ticket Inspection (45s):** Select Ticket `#TCK-1042` (Duplicate Charge). Show red `🔴 HIGH-RISK ACTION` warning badge. Point out that refund execution requires mandatory human sign-off.
3. **Human Verification & Override (45s):** Modify priority from `HIGH` → `CRITICAL` or customize response. Click **Approve & Dispatch Response**. Observe status changing to `Edited & Approved`.
4. **Customer Portal Submission (30s):** Switch to Customer Portal. Click quick preset *"Security & Unauthorized Charge"*. Submit ticket and watch real-time AI triage.
5. **Fallback Test Bench (30s):** Click the **AI Status Pill** in top header. Toggle **Force Fallback Mode**. Submit another ticket to demonstrate zero-crash fallback reliability.
