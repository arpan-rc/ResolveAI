import { AIAnalysis, Ticket } from '../types';
import { FallbackProvider } from '../services/ai/fallbackProvider';

/**
 * Ticket Triage Skill Procedure Execution
 * Encapsulates the 9-step procedural logic for support ticket triaging.
 */
export class TicketTriageSkill {
  /**
   * Executes the 9-step Ticket Triage Skill workflow on a raw ticket input.
   */
  public static execute(ticket: Partial<Ticket>): AIAnalysis {
    // Step 1: Read Ticket
    // Step 2-8: Execute deterministic keyword and pattern rule matching
    const analysis = FallbackProvider.analyzeTicket(ticket);

    // Step 9: Enforce high-risk escalation rules
    if (analysis.isHighRisk || analysis.priority === 'CRITICAL' || analysis.priority === 'HIGH') {
      analysis.riskReason = analysis.riskReason || 'Flagged for mandatory human review due to elevated risk profile.';
    }

    return analysis;
  }
}
