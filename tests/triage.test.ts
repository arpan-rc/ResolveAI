import { describe, it, expect, beforeEach } from 'vitest';
import { FallbackProvider } from '../server/services/ai/fallbackProvider';
import { SupportTriageAgent } from '../server/agents/supportTriageAgent';
import { DBService } from '../server/services/db/dbService';
import { AIService } from '../server/services/ai/aiService';

describe('ResolveAI Support Ticket Triage Suite', () => {

  beforeEach(() => {
    DBService.seedDemoTickets();
  });

  describe('1. Fallback Provider AI Triage Engine', () => {
    it('should correctly classify billing tickets with duplicate charges as HIGH priority and High Risk', () => {
      const ticket = {
        subject: 'Charged twice on subscription',
        description: 'I was charged $49 twice for my plan today. Please refund the duplicate payment.'
      };

      const analysis = FallbackProvider.analyzeTicket(ticket);

      expect(analysis.category).toBe('Billing');
      expect(analysis.department).toBe('Finance');
      expect(analysis.priority).toBe('HIGH');
      expect(analysis.isHighRisk).toBe(true);
      expect(analysis.usedFallback).toBe(true);
      expect(analysis.draftResponse).toContain('finance department');
    });

    it('should classify unauthorized access / security breach as Fraud/Security, CRITICAL priority and High Risk', () => {
      const ticket = {
        subject: 'Unauthorized login detected from unknown location',
        description: 'Someone hacked my account and tried to change my email password. This is urgent!'
      };

      const analysis = FallbackProvider.analyzeTicket(ticket);

      expect(analysis.category).toBe('Fraud/Security');
      expect(analysis.department).toBe('Security');
      expect(analysis.priority).toBe('CRITICAL');
      expect(analysis.isHighRisk).toBe(true);
      expect(analysis.sentiment).toBe('Urgent');
    });

    it('should classify password reset issues as Account Access', () => {
      const ticket = {
        subject: 'Password reset code not received',
        description: 'I forgot my password and the 2FA verification code is not arriving.'
      };

      const analysis = FallbackProvider.analyzeTicket(ticket);

      expect(analysis.category).toBe('Account Access');
      expect(analysis.department).toBe('Technical Support');
      expect(analysis.priority).toBe('MEDIUM');
    });
  });

  describe('2. Support Triage Agent', () => {
    it('should process ticket and enforce Human-in-the-Loop review requirement', async () => {
      const agent = new SupportTriageAgent();
      const ticket = {
        id: 'TEST-1001',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        subject: 'System crash on photo upload',
        description: 'The app crashes whenever I try uploading a profile image.'
      };

      const result = await agent.processTicket(ticket, { forceFallback: true });

      expect(result.agentName).toBe('Support Triage Agent');
      expect(result.requiresHumanReview).toBe(true);
      expect(result.analysis.category).toBe('Technical Support');
      expect(result.analysis.draftResponse).toBeDefined();
    });
  });

  describe('3. DB Service State Transitions & Audit Log Integrity', () => {
    it('should create a new ticket and record ticket creation audit log', () => {
      const ticket = DBService.createTicket({
        customerName: 'Alex Mercer',
        customerEmail: 'alex@example.com',
        subject: 'Invoice request',
        description: 'Please send my official invoice for tax purposes.'
      });

      expect(ticket.id).toBeDefined();
      expect(ticket.status).toBe('NEW');

      const logs = DBService.getAuditLogs(ticket.id);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].action).toBe('TICKET_SUBMITTED');
    });

    it('should update ticket with AI analysis and record AI audit log', () => {
      const ticket = DBService.createTicket({
        customerName: 'Sam Vance',
        customerEmail: 'sam@example.com',
        subject: 'Cannot log in',
        description: 'Password reset fails.'
      });

      const analysis = FallbackProvider.analyzeTicket(ticket);
      const updated = DBService.updateTicketAIAnalysis(ticket.id, analysis);

      expect(updated.aiAnalysis).toBeDefined();
      expect(updated.category).toBe('Account Access');
      expect(updated.status).toBe('AWAITING_HUMAN_REVIEW');

      const logs = DBService.getAuditLogs(ticket.id);
      const aiLog = logs.find(l => l.action === 'AI_ANALYSIS_COMPLETED');
      expect(aiLog).toBeDefined();
      expect(aiLog?.actorRole).toBe('AI_SYSTEM');
    });

    it('should approve ticket when human agent executes approval action', () => {
      const ticketId = 'TCK-1042'; // seeded ticket

      const approved = DBService.approveTicket(ticketId, {
        reviewer: 'Agent Sarah Jenkins',
        category: 'Billing',
        priority: 'CRITICAL',
        department: 'Finance',
        finalResponse: 'Refund has been processed successfully.'
      });

      expect(approved.status).toBe('EDITED_APPROVED');
      expect(approved.humanReview).toBeDefined();
      expect(approved.humanReview?.decision).toBe('EDITED_APPROVED');

      const logs = DBService.getAuditLogs(ticketId);
      const approveLog = logs.find(l => l.action === 'HUMAN_EDITED_APPROVED');
      expect(approveLog).toBeDefined();
      expect(approveLog?.actorRole).toBe('HUMAN_AGENT');
    });

    it('should reject AI recommendation when human agent rejects', () => {
      const ticketId = 'TCK-1041';

      const rejected = DBService.rejectTicket(
        ticketId,
        'Agent Sarah Jenkins',
        'Category misclassified by AI'
      );

      expect(rejected.status).toBe('REJECTED');

      const logs = DBService.getAuditLogs(ticketId);
      const rejectLog = logs.find(l => l.action === 'HUMAN_REJECTED');
      expect(rejectLog).toBeDefined();
    });
  });

  describe('4. AI Service Fallback Safeguards', () => {
    it('should report correct status and support forcing fallback mode', () => {
      process.env.FORCE_FALLBACK_MODE = 'true';
      const status = AIService.getStatus();

      expect(status.forceFallback).toBe(true);
      expect(status.activeProvider).toBe('Deterministic Fallback Rule Engine');

      process.env.FORCE_FALLBACK_MODE = 'false';
    });
  });

});
