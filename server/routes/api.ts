import { Router } from 'express';
import { AIService } from '../services/ai/aiService';
import { DBService } from '../services/db/dbService';
import { SupportTriageAgent } from '../agents/supportTriageAgent';

export const apiRouter = Router();
const supportTriageAgent = new SupportTriageAgent();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Service Status & Config
apiRouter.get('/ai/status', (req, res) => {
  res.json(AIService.getStatus());
});

// Toggle forced fallback mode for testing/demo
apiRouter.post('/ai/toggle-fallback', (req, res) => {
  const { force } = req.body;
  if (typeof force === 'boolean') {
    process.env.FORCE_FALLBACK_MODE = force ? 'true' : 'false';
  } else {
    process.env.FORCE_FALLBACK_MODE = process.env.FORCE_FALLBACK_MODE === 'true' ? 'false' : 'true';
  }
  res.json(AIService.getStatus());
});

// Reset / Seed Demo Tickets
apiRouter.post('/demo/seed', (req, res) => {
  DBService.seedDemoTickets();
  res.json({ message: 'Demo tickets successfully re-seeded.', stats: DBService.getDashboardStats() });
});

// Dashboard Statistics
apiRouter.get('/dashboard/stats', (req, res) => {
  try {
    const stats = DBService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch dashboard stats' });
  }
});

// Get all tickets with filters
apiRouter.get('/tickets', (req, res) => {
  try {
    const { status, priority, category, search, highRisk } = req.query;
    
    const tickets = DBService.getTickets({
      status: status as string,
      priority: priority as string,
      category: category as string,
      search: search as string,
      isHighRisk: highRisk === 'true' ? true : highRisk === 'false' ? false : undefined
    });

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to list tickets' });
  }
});

// Get single ticket by ID
apiRouter.get('/tickets/:id', (req, res) => {
  try {
    const ticket = DBService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket #${req.params.id} not found` });
    }

    const auditLogs = DBService.getAuditLogs(req.params.id);
    res.json({ ticket, auditLogs });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to retrieve ticket' });
  }
});

// Submit a new customer support ticket
apiRouter.post('/tickets', async (req, res) => {
  try {
    const { customerName, customerEmail, subject, description, suggestedCategory, autoAnalyze } = req.body;

    if (!customerName || !customerEmail || !subject || !description) {
      return res.status(400).json({ error: 'Missing required ticket fields: customerName, customerEmail, subject, description' });
    }

    const ticket = DBService.createTicket({
      customerName,
      customerEmail,
      subject,
      description,
      suggestedCategory
    });

    // Auto trigger AI analysis unless explicitly disabled
    if (autoAnalyze !== false) {
      const forceFallback = req.body.forceFallback === true;
      const agentResult = await supportTriageAgent.processTicket(ticket, { forceFallback });
      const updatedTicket = DBService.updateTicketAIAnalysis(ticket.id, agentResult.analysis);
      return res.status(201).json(updatedTicket);
    }

    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create ticket' });
  }
});

// Trigger / Re-run AI Analysis on ticket
apiRouter.post('/tickets/:id/analyze', async (req, res) => {
  try {
    const ticket = DBService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket #${req.params.id} not found` });
    }

    const forceFallback = req.body.forceFallback === true;
    const agentResult = await supportTriageAgent.processTicket(ticket, { forceFallback });
    const updatedTicket = DBService.updateTicketAIAnalysis(ticket.id, agentResult.analysis);

    res.json({
      ticket: updatedTicket,
      aiAnalysis: agentResult.analysis,
      agentName: agentResult.agentName,
      requiresHumanReview: agentResult.requiresHumanReview,
      auditLogs: DBService.getAuditLogs(ticket.id)
    });
  } catch (error: any) {
    // Guaranteed non-crash fallback response
    res.status(500).json({ 
      error: error?.message || 'AI Analysis error occurred',
      message: 'AI Service failed gracefully. Ticket remains intact.'
    });
  }
});

// Human Approval & Response Action
apiRouter.post('/tickets/:id/approve', (req, res) => {
  try {
    const { reviewer, category, priority, department, finalResponse } = req.body;

    if (!category || !priority || !department || !finalResponse) {
      return res.status(400).json({ error: 'Missing review fields: category, priority, department, finalResponse' });
    }

    const updatedTicket = DBService.approveTicket(req.params.id, {
      reviewer: reviewer || 'Human Support Agent',
      category,
      priority,
      department,
      finalResponse
    });

    res.json({
      ticket: updatedTicket,
      auditLogs: DBService.getAuditLogs(req.params.id),
      message: 'Ticket successfully approved and resolution response dispatched.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to approve ticket' });
  }
});

// Human Rejection
apiRouter.post('/tickets/:id/reject', (req, res) => {
  try {
    const { reviewer, rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const updatedTicket = DBService.rejectTicket(
      req.params.id,
      reviewer || 'Human Support Agent',
      rejectionReason
    );

    res.json({
      ticket: updatedTicket,
      auditLogs: DBService.getAuditLogs(req.params.id),
      message: 'AI recommendation rejected. Ticket returned for manual rework.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to reject ticket' });
  }
});

// Human Escalation (Day 2 Hackathon Twist capability)
apiRouter.post('/tickets/:id/escalate', (req, res) => {
  try {
    const { reviewer, escalationNote } = req.body;

    const updatedTicket = DBService.escalateTicket(
      req.params.id,
      reviewer || 'Human Support Agent',
      escalationNote || 'Escalated to Tier-2 Operations Lead.'
    );

    res.json({
      ticket: updatedTicket,
      auditLogs: DBService.getAuditLogs(req.params.id)
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to escalate ticket' });
  }
});

// Get Audit Logs
apiRouter.get('/tickets/:id/audit', (req, res) => {
  try {
    const logs = DBService.getAuditLogs(req.params.id);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch audit logs' });
  }
});
