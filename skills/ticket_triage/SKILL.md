---
name: Ticket Triage Skill
description: Standardized procedural skill for analyzing customer support tickets, detecting financial or security risks, assigning category/priority/department, and generating structured AI recommendations for human verification.
---

# Ticket Triage Skill

The **Ticket Triage Skill** provides a deterministic and structured 9-step procedure for analyzing incoming customer support tickets in ResolveAI.

## Procedure Overview

When a new ticket is received or re-analyzed:

1. **Read Ticket Data**: Extract ticket subject, description, customer metadata, and any suggested category hints.
2. **Identify Core Issue**: Extract key entities, intent indicators, and emotional triggers (e.g., duplicate charges, login failures, unauthorized access).
3. **Determine Category**: Assign one of six strict operational categories:
   - `Billing`
   - `Account Access`
   - `Fraud/Security`
   - `Technical Support`
   - `Account Management`
   - `General Inquiry`
4. **Determine Priority**: Assign an operational SLA urgency score:
   - `CRITICAL` (Immediate attention, security threats, fraud, emergency)
   - `HIGH` (Financial disputes, account lockouts, app outages)
   - `MEDIUM` (General technical glitches, non-blocking errors)
   - `LOW` (Feedback, documentation inquiries)
5. **Determine Routing Department**: Select target operational team:
   - `Finance`
   - `Technical Support`
   - `Security`
   - `Customer Support`
   - `Operations`
6. **Detect High-Risk Situations**: Flag tickets requiring mandatory Human-in-the-Loop approval before dispatch if:
   - Financial transactions or refunds are involved (e.g., duplicate charge, credit card dispute).
   - Unauthorized access or security breaches are reported.
   - Permanent account deletion or data loss is requested.
   - Priority is flagged as `CRITICAL`.
7. **Generate Concise Recommendation**: Produce an executive 1-2 sentence issue summary and recommended agent action.
8. **Produce Structured Output**: Format the analysis into a strict JSON payload matching the `AIAnalysis` interface.
9. **Escalate to Human Review**: Set ticket status to `Awaiting Review` and flag `isHighRisk` whenever risk conditions or low confidence thresholds are triggered.

## Structured Output Schema

```json
{
  "category": "Billing | Account Access | Technical Support | Fraud/Security | Account Management | General Inquiry",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "department": "Finance | Technical Support | Customer Support | Security | Operations",
  "sentiment": "Positive | Neutral | Frustrated | Urgent | Negative",
  "summary": "String",
  "suggestedAction": "String",
  "draftResponse": "String",
  "confidence": 92,
  "confidenceScores": {
    "category": 95,
    "priority": 90,
    "department": 92,
    "overall": 92
  },
  "isHighRisk": true,
  "riskReason": "String",
  "decisionReasoning": "String",
  "usedFallback": false,
  "providerName": "String",
  "analyzedAt": "ISO Timestamp"
}
```

## Integration in ResolveAI

The **Support Triage Agent** executes this skill whenever `/api/tickets` receives a new ticket submission or when `/api/tickets/:id/analyze` is called.
