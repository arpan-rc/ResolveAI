import { AIAnalysis, Ticket } from '../types';
import { AIService } from '../services/ai/aiService';
import { TicketTriageSkill } from '../skills/ticketTriageSkill';

/**
 * Support Triage Agent
 * 
 * Purpose: Analyze incoming support tickets and produce structured recommendations
 * for category, priority, department, risk level, and response drafts.
 * 
 * CORE CONSTITUTIONAL RULE:
 * The Support Triage Agent NEVER makes autonomous final decisions or dispatches customer emails directly.
 * Human verification is 100% mandatory before any action is executed.
 */
export class SupportTriageAgent {
  public readonly agentName = 'Support Triage Agent';
  public readonly version = '1.0.0';

  /**
   * Primary entrypoint for the Support Triage Agent.
   * Runs AI analysis, validates structured recommendations, flags high-risk scenarios,
   * and enforces human verification gating.
   */
  public async processTicket(ticket: Partial<Ticket>, options?: { forceFallback?: boolean }): Promise<{
    agentName: string;
    analysis: AIAnalysis;
    requiresHumanReview: boolean;
    highRiskFlagged: boolean;
  }> {
    console.log(`[Support Triage Agent] Processing ticket #${ticket.id || 'new'} ("${ticket.subject || 'No Subject'}")`);

    // 1. Execute AI Service analysis (Primary Claude or Fallback Engine)
    let analysis: AIAnalysis;
    try {
      analysis = await AIService.analyzeTicket(ticket, options);
    } catch (err) {
      console.warn(`[Support Triage Agent] Primary AI execution failed. Invoking Ticket Triage Skill fallback procedure.`);
      analysis = TicketTriageSkill.execute(ticket);
    }

    // 2. Validate structured output integrity
    this.validateAnalysisSchema(analysis);

    // 3. Enforce Mandatory Human Review policy
    const requiresHumanReview = true; // Constitutional invariant: AI recommends, humans decide.
    const highRiskFlagged = Boolean(analysis.isHighRisk);

    if (highRiskFlagged) {
      console.log(`[Support Triage Agent] 🔴 HIGH-RISK ACTION DETECTED: ${analysis.riskReason || 'Sensitive operation'}`);
    }

    return {
      agentName: this.agentName,
      analysis,
      requiresHumanReview,
      highRiskFlagged
    };
  }

  /**
   * Validates that the AI recommendation complies with required schema bounds.
   */
  private validateAnalysisSchema(analysis: AIAnalysis): void {
    const validCategories = ['Billing', 'Account Access', 'Technical Support', 'Fraud/Security', 'Account Management', 'General Inquiry'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const validDepartments = ['Finance', 'Technical Support', 'Customer Support', 'Security', 'Operations'];

    if (!validCategories.includes(analysis.category)) {
      analysis.category = 'General Inquiry';
    }
    if (!validPriorities.includes(analysis.priority)) {
      analysis.priority = 'MEDIUM';
    }
    if (!validDepartments.includes(analysis.department)) {
      analysis.department = 'Customer Support';
    }
    if (!analysis.draftResponse || analysis.draftResponse.trim().length === 0) {
      analysis.draftResponse = 'Hello, thank you for reaching out to support. A human specialist is reviewing your ticket and will update you shortly.';
    }
  }
}
