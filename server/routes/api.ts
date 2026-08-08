import { Router } from 'express';
import { AIService } from '../services/ai/aiService';
import { DBService } from '../services/db/dbService';
import { SupportTriageAgent } from '../agents/supportTriageAgent';

export const apiRouter = Router();
const supportTriageAgent = new SupportTriageAgent();

// Authentication & Role Middleware
apiRouter.use((req: any, res, next) => {
  const roleHeader = req.headers['x-user-role'] as string;
  const emailHeader = req.headers['x-user-email'] as string;
  const nameHeader = req.headers['x-user-name'] as string;

  if (roleHeader) {
    req.authUser = {
      role: roleHeader.toLowerCase(),
      email: emailHeader ? emailHeader.toLowerCase().trim() : '',
      name: nameHeader ? decodeURIComponent(nameHeader).trim() : ''
    };
  }
  next();
});

// Auth Registration Endpoint
apiRouter.post('/auth/register', (req: any, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Full name, email, password, and target role are required.' });
    }

    const newUser = DBService.registerUser({
      name,
      email,
      password,
      role: role.toLowerCase() as 'customer' | 'agent'
    });

    const userSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: `auth-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    };

    res.status(201).json({ message: 'Account created successfully', user: userSession });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Registration failed' });
  }
});

// Auth Login Endpoint
apiRouter.post('/auth/login', (req: any, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and target role are required.' });
    }

    const cleanRole = role.toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Authenticate via DBService
    try {
      const user = DBService.authenticateUser(cleanEmail, password, cleanRole);
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: `auth-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      };
      return res.json({ message: 'Authentication successful', user: userSession });
    } catch (authErr: any) {
      // Fallback for demo users if DB is freshly reloaded
      const DEMO_ACCOUNTS: Record<string, { name: string; role: 'customer' | 'agent'; pass: string }> = {
        'aarav.sharma@example.com': { name: 'Aarav Sharma', role: 'customer', pass: 'customer123' },
        'priya.patel@example.com': { name: 'Priya Patel', role: 'customer', pass: 'customer123' },
        'rohan.mehta@example.com': { name: 'Rohan Mehta', role: 'customer', pass: 'customer123' },
        'agent.sarah@resolveai.com': { name: 'Agent Sarah Jenkins', role: 'agent', pass: 'agent123' },
        'agent.marcus@resolveai.com': { name: 'Agent Marcus Vance', role: 'agent', pass: 'agent123' }
      };

      const demo = DEMO_ACCOUNTS[cleanEmail];
      if (demo && demo.role === cleanRole && demo.pass === password.trim()) {
        const userSession = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: demo.name,
          email: cleanEmail,
          role: cleanRole as 'customer' | 'agent',
          token: `auth-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        };
        return res.json({ message: 'Authentication successful', user: userSession });
      }

      return res.status(401).json({ error: authErr?.message || 'Authentication failed' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Authentication failed' });
  }
});

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

// Dashboard Statistics (Restricted to Support Agents)
apiRouter.get('/dashboard/stats', (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Access restricted to Support Agents.' });
    }
    const stats = DBService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch dashboard stats' });
  }
});

// Get tickets with role-based filtering
apiRouter.get('/tickets', (req: any, res) => {
  try {
    const { status, priority, category, search, highRisk } = req.query;
    
    let tickets = DBService.getTickets({
      status: status as string,
      priority: priority as string,
      category: category as string,
      search: search as string,
      isHighRisk: highRisk === 'true' ? true : highRisk === 'false' ? false : undefined
    });

    // CUSTOMER AUTHORIZATION: Filter tickets to ONLY those belonging to the authenticated customer
    if (req.authUser?.role === 'customer' && req.authUser.email) {
      tickets = tickets.filter(t => t.customerEmail.toLowerCase() === req.authUser.email.toLowerCase());
    }

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to list tickets' });
  }
});

// Get single ticket by ID with ownership verification
apiRouter.get('/tickets/:id', (req: any, res) => {
  try {
    const ticket = DBService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket #${req.params.id} not found` });
    }

    // CUSTOMER OWNERSHIP PROTECTION: Customers can ONLY access their own ticket
    if (req.authUser?.role === 'customer' && req.authUser.email) {
      if (ticket.customerEmail.toLowerCase() !== req.authUser.email.toLowerCase()) {
        return res.status(403).json({ error: 'Access Denied: You do not have permission to view this ticket.' });
      }
    }

    const auditLogs = DBService.getAuditLogs(req.params.id);
    res.json({ ticket, auditLogs });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to retrieve ticket' });
  }
});

// Ticket Invoice Verification & Details Endpoint
apiRouter.get('/tickets/:id/invoice', (req: any, res) => {
  try {
    const ticket = DBService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket #${req.params.id} not found` });
    }

    // Verify ownership if customer
    if (req.authUser?.role === 'customer' && req.authUser.email) {
      if (ticket.customerEmail.toLowerCase() !== req.authUser.email.toLowerCase()) {
        return res.status(403).json({ error: 'Access Denied: Cannot access invoice for a ticket you do not own.' });
      }
    }

    // Extract invoice charges if financial details exist
    const desc = ticket.description || '';
    const subject = ticket.subject || '';
    const text = `${subject} ${desc}`;
    let chargeAmount = '';

    const matches = text.match(/(₹|\$|USD|INR)\s?[\d,]+(\.\d{2})?/gi);
    if (matches && matches.length > 0) {
      chargeAmount = matches[0];
    }

    const invoiceData = {
      invoiceId: `INV-${ticket.id.replace('TCK-', '')}-${new Date(ticket.createdAt).getTime().toString().slice(-4)}`,
      ticketId: ticket.id,
      date: ticket.createdAt,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      department: ticket.department,
      status: ticket.status,
      resolution: ticket.humanReview?.finalResponse || ticket.aiAnalysis?.draftResponse || 'Ticket currently in review by ResolveAI support agent.',
      resolvedDate: ticket.humanReview?.reviewedAt || ticket.updatedAt,
      chargeAmount: chargeAmount || '0.00 (Standard Support Record)'
    };

    res.json(invoiceData);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to generate invoice record' });
  }
});

// Submit a new customer support ticket
apiRouter.post('/tickets', async (req: any, res) => {
  try {
    let { customerName, customerEmail, subject, description, suggestedCategory, autoAnalyze } = req.body;

    // CUSTOMER IDENTIFICATION SECURITY: Obtain customer email/name directly from authenticated session header
    if (req.authUser?.role === 'customer') {
      if (!req.authUser.email) {
        return res.status(401).json({ error: 'Unauthorized: Valid authenticated customer email required.' });
      }
      customerEmail = req.authUser.email.toLowerCase().trim();
      if (req.authUser.name) {
        customerName = req.authUser.name.trim();
      }
    }

    if (!customerEmail || !customerName || !subject || !description) {
      return res.status(400).json({ error: 'Missing required ticket fields: customerName, customerEmail, subject, description' });
    }

    const ticket = DBService.createTicket({
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
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

// Trigger / Re-run AI Analysis on ticket (Restricted to Support Agents)
apiRouter.post('/tickets/:id/analyze', async (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Only Support Agents can re-trigger AI analysis.' });
    }

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
    res.status(500).json({ 
      error: error?.message || 'AI Analysis error occurred',
      message: 'AI Service failed gracefully. Ticket remains intact.'
    });
  }
});

// Human Approval & Response Action (Restricted to Support Agents)
apiRouter.post('/tickets/:id/approve', (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Customer accounts cannot execute ticket reviews or approvals.' });
    }

    const { reviewer, category, priority, department, finalResponse } = req.body;

    if (!category || !priority || !department || !finalResponse) {
      return res.status(400).json({ error: 'Missing review fields: category, priority, department, finalResponse' });
    }

    const updatedTicket = DBService.approveTicket(req.params.id, {
      reviewer: reviewer || req.authUser?.name || 'Human Support Agent',
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

// Human Rejection (Restricted to Support Agents)
apiRouter.post('/tickets/:id/reject', (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Support Agent permissions required.' });
    }

    const { reviewer, rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const updatedTicket = DBService.rejectTicket(
      req.params.id,
      reviewer || req.authUser?.name || 'Human Support Agent',
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

// Human Escalation (Restricted to Support Agents)
apiRouter.post('/tickets/:id/escalate', (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Support Agent permissions required.' });
    }

    const { reviewer, escalationNote } = req.body;

    const updatedTicket = DBService.escalateTicket(
      req.params.id,
      reviewer || req.authUser?.name || 'Human Support Agent',
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

// Bulk Approve Tickets (Restricted to Support Agents)
apiRouter.post('/tickets/bulk-approve', (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Support Agent permissions required.' });
    }

    const { ids, reviewer } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of ticket IDs is required' });
    }

    const reviewerName = reviewer || req.authUser?.name || 'Agent Sarah Jenkins (Bulk)';
    let approvedCount = 0;

    for (const id of ids) {
      const ticket = DBService.getTicketById(id);
      if (ticket) {
        const category = ticket.aiAnalysis?.category || ticket.category;
        const priority = ticket.aiAnalysis?.priority || ticket.priority;
        const department = ticket.aiAnalysis?.department || ticket.department;
        const finalResponse = ticket.aiAnalysis?.draftResponse || 'Approved and processed via bulk verification.';

        DBService.approveTicket(id, {
          reviewer: reviewerName,
          category,
          priority,
          department,
          finalResponse
        });
        approvedCount++;
      }
    }

    res.json({
      message: `Successfully bulk approved ${approvedCount} ticket(s).`,
      approvedCount,
      tickets: DBService.getTickets(),
      stats: DBService.getDashboardStats()
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to bulk approve tickets' });
  }
});

// Bulk Escalate Tickets (Restricted to Support Agents)
apiRouter.post('/tickets/bulk-escalate', (req: any, res) => {
  try {
    if (req.authUser?.role === 'customer') {
      return res.status(403).json({ error: 'Forbidden: Support Agent permissions required.' });
    }

    const { ids, reviewer, escalationNote } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of ticket IDs is required' });
    }

    const reviewerName = reviewer || req.authUser?.name || 'Agent Sarah Jenkins (Bulk)';
    const note = escalationNote || 'Bulk escalated by support agent to Tier-2 Operations Lead.';
    let escalatedCount = 0;

    for (const id of ids) {
      const ticket = DBService.getTicketById(id);
      if (ticket) {
        DBService.escalateTicket(id, reviewerName, note);
        escalatedCount++;
      }
    }

    res.json({
      message: `Successfully bulk escalated ${escalatedCount} ticket(s).`,
      escalatedCount,
      tickets: DBService.getTickets(),
      stats: DBService.getDashboardStats()
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to bulk escalate tickets' });
  }
});

// Get Audit Logs
apiRouter.get('/tickets/:id/audit', (req: any, res) => {
  try {
    const ticket = DBService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket #${req.params.id} not found` });
    }

    if (req.authUser?.role === 'customer' && req.authUser.email) {
      if (ticket.customerEmail.toLowerCase().trim() !== req.authUser.email.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Access Denied: You do not have permission to view audit logs for this ticket.' });
      }
    }

    const logs = DBService.getAuditLogs(req.params.id);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch audit logs' });
  }
});

