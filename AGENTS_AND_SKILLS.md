# ResolveAI — Custom Agents & Custom Skills Documentation

This document defines the custom AI Agents and custom Skills implemented in the ResolveAI platform.

---

## 🤖 CUSTOM AGENT: Support Triage Agent

### 1. Overview & Purpose
The **Support Triage Agent** is a specialized backend autonomous agent responsible for evaluating incoming customer support tickets, detecting financial or security risk levels, determining SLA priority, and generating candidate responses.

### 2. Core Rule & Human-in-the-Loop Constitution
> **CONSTITUTIONAL RULE:**  
> The Support Triage Agent is strictly advisory (**"AI recommends. Humans decide."**).  
> It is **NEVER** authorized to perform autonomous final actions, execute financial refunds, delete user accounts, or dispatch customer emails without explicit human agent review and approval.

### 3. When It Is Used
- **On Ticket Submission:** Automatically triggered whenever a new customer support ticket is posted via `/api/tickets`.
- **On Manual Re-Analysis:** Invoked when a support agent clicks "Re-Analyze Ticket with AI" in the workstation workspace.
- **In Offline / Fallback Mode:** Interacts seamlessly with the Fallback Provider if the primary Anthropic Claude API is down or missing API keys.

### 4. Inputs & Outputs
- **Input:**
  - `ticket`: Object containing `customerName`, `customerEmail`, `subject`, `description`, and optional `suggestedCategory`.
  - `options`: Optional flags such as `forceFallback`.
- **Output:**
  - `agentName`: `"Support Triage Agent"`
  - `analysis`: Structured `AIAnalysis` object containing:
    - `category`: Assigned category (e.g. `Billing`, `Fraud/Security`)
    - `priority`: Escalation priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
    - `department`: Target department (`Finance`, `Security`, etc.)
    - `sentiment`: Customer emotion classification
    - `isHighRisk`: Boolean flag for high-risk operations
    - `riskReason`: Explanation of detected high-risk factors
    - `draftResponse`: Proposed draft response text
  - `requiresHumanReview`: `true` (enforced invariant)
  - `highRiskFlagged`: Boolean indicating if high-risk flags were activated

### 5. Implementation File
`server/agents/supportTriageAgent.ts`

---

## 🛠️ CUSTOM SKILL: Ticket Triage Skill

### 1. Purpose
The **Ticket Triage Skill** provides a standardized, repeatable 9-step procedure for analyzing customer support requests and converting unstructured text into validated operational metadata.

### 2. The 9-Step Procedure
1. **Read Ticket Data**: Extract subject, text body, customer metadata, and hints.
2. **Identify Core Issue**: Extract key entities, intent indicators, and emotion triggers.
3. **Determine Category**: Assign standard category (`Billing`, `Account Access`, `Fraud/Security`, `Technical Support`, `Account Management`, `General Inquiry`).
4. **Determine Priority**: Assign SLA priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
5. **Determine Department**: Route to correct team (`Finance`, `Technical Support`, `Customer Support`, `Security`, `Operations`).
6. **Detect High-Risk Situations**: Flag tickets involving refunds, financial charges, fraud, unauthorized access, or account deletion.
7. **Generate Concise Recommendation**: Produce executive summary and agent next step.
8. **Produce Structured Output**: Format output adhering to the strict JSON schema.
9. **Escalate to Human Review**: Set ticket status to `Awaiting Review` and flag `isHighRisk`.

### 3. Implementation Files
- **Skill Definition & Rules:** `skills/ticket_triage/SKILL.md`
- **Code Execution Helper:** `server/skills/ticketTriageSkill.ts`
