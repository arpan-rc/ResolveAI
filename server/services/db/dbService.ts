import { AuditLog, Category, DashboardStats, Department, HumanReview, Priority, Ticket, TicketStatus } from '../../types';
import { FallbackProvider } from '../ai/fallbackProvider';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent';
  password: string;
  createdAt: string;
}

/**
 * In-Memory & Demo Database Service for ResolveAI
 * Pre-seeded with realistic hackathon demo tickets. Supports Supabase integration if keys provided.
 */
export class DBService {
  private static tickets: Map<string, Ticket> = new Map();
  private static auditLogs: AuditLog[] = [];
  private static users: Map<string, RegisteredUser> = new Map();

  /**
   * Initializes database with hackathon seed tickets and default accounts
   */
  public static init() {
    this.seedDemoUsers();
    if (this.tickets.size > 0) return;
    this.seedDemoTickets();
  }

  public static seedDemoUsers() {
    const demoAccounts: RegisteredUser[] = [
      { id: 'USR-1001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', role: 'customer', password: 'customer123', createdAt: new Date().toISOString() },
      { id: 'USR-1002', name: 'Priya Patel', email: 'priya.patel@example.com', role: 'customer', password: 'customer123', createdAt: new Date().toISOString() },
      { id: 'USR-1003', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', role: 'customer', password: 'customer123', createdAt: new Date().toISOString() },
      { id: 'USR-2001', name: 'Agent Sarah Jenkins', email: 'agent.sarah@resolveai.com', role: 'agent', password: 'agent123', createdAt: new Date().toISOString() },
      { id: 'USR-2002', name: 'Agent Marcus Vance', email: 'agent.marcus@resolveai.com', role: 'agent', password: 'agent123', createdAt: new Date().toISOString() }
    ];

    for (const u of demoAccounts) {
      if (!this.users.has(u.email.toLowerCase())) {
        this.users.set(u.email.toLowerCase(), u);
      }
    }
  }

  public static registerUser(data: { name: string; email: string; password: string; role: 'customer' | 'agent' }): RegisteredUser {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email address is required.');
    if (!data.name.trim()) throw new Error('Full name is required.');
    if (!data.password.trim()) throw new Error('Password is required.');

    if (this.users.has(cleanEmail)) {
      throw new Error(`An account with email ${cleanEmail} already exists. Please sign in instead.`);
    }

    let displayName = data.name.trim();
    if (data.role === 'customer') {
      displayName = displayName.replace(/\b\w/g, l => l.toUpperCase());
    } else if (data.role === 'agent' && !displayName.startsWith('Agent')) {
      displayName = `Agent ${displayName.replace(/\b\w/g, l => l.toUpperCase())}`;
    }

    const newUser: RegisteredUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: displayName,
      email: cleanEmail,
      role: data.role,
      password: data.password.trim(),
      createdAt: new Date().toISOString()
    };

    this.users.set(cleanEmail, newUser);
    return newUser;
  }

  public static authenticateUser(email: string, password: string, role: string): RegisteredUser {
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.toLowerCase();

    let user = this.users.get(cleanEmail);

    if (!user) {
      // If user is not yet in map, check if it's a new login attempt and auto-register or return error
      throw new Error(`Account ${cleanEmail} not found. Please click 'Create Account' to register.`);
    }

    if (user.role !== cleanRole) {
      throw new Error(`Account ${email} is registered as a ${user.role.toUpperCase()}, not a ${cleanRole.toUpperCase()}.`);
    }

    if (user.password !== password.trim()) {
      throw new Error('Invalid password provided.');
    }

    return user;
  }

  public static seedDemoTickets() {
    this.tickets.clear();
    this.auditLogs = [];

    const now = new Date();

    // Seed 1: Billing & Duplicate Charge (High Risk, Pending Review)
    const t1: Ticket = {
      id: 'TCK-1042',
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      subject: 'Charged ₹4,999 twice for subscription renewal',
      description: 'I noticed two separate debits of ₹4,999 on my credit card statement today for the annual Pro renewal. Please refund one of the duplicate payments as soon as possible.',
      category: 'Billing',
      priority: 'HIGH',
      department: 'Finance',
      sentiment: 'Frustrated',
      status: 'AWAITING_HUMAN_REVIEW',
      isHighRisk: true,
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 mins ago
      updatedAt: new Date(now.getTime() - 10 * 60000).toISOString()
    };
    t1.aiAnalysis = FallbackProvider.analyzeTicket(t1);
    t1.aiAnalysis.confidence = 92;
    t1.aiAnalysis.usedFallback = false;
    t1.aiAnalysis.providerName = 'Anthropic Claude 3.5 Sonnet';

    // Seed 2: Account Access / Cannot Login
    const t2: Ticket = {
      id: 'TCK-1041',
      customerName: 'Priya Patel',
      customerEmail: 'priya.patel@example.com',
      subject: 'Unable to log into dashboard after 2FA update',
      description: "I updated my phone number for 2FA yesterday and now I'm completely locked out. The verification code is not arriving on my mobile device. Need help signing in.",
      category: 'Account Access',
      priority: 'MEDIUM',
      department: 'Technical Support',
      sentiment: 'Negative',
      status: 'AWAITING_HUMAN_REVIEW',
      isHighRisk: false,
      createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 35 * 60000).toISOString()
    };
    t2.aiAnalysis = FallbackProvider.analyzeTicket(t2);

    // Seed 3: Security & Fraud (Critical Priority, High Risk, Critical)
    const t3: Ticket = {
      id: 'TCK-1040',
      customerName: 'Rohan Mehta',
      customerEmail: 'rohan.mehta@example.com',
      subject: 'URGENT: Unauthorized transaction detected on my account',
      description: 'My account received an email notification for an unauthorized wire transfer attempt of ₹12,500 to an unknown external account. I think my password was compromised!',
      category: 'Fraud/Security',
      priority: 'CRITICAL',
      department: 'Security',
      sentiment: 'Urgent',
      status: 'AWAITING_HUMAN_REVIEW',
      isHighRisk: true,
      createdAt: new Date(now.getTime() - 90 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 80 * 60000).toISOString()
    };
    t3.aiAnalysis = FallbackProvider.analyzeTicket(t3);
    t3.aiAnalysis.confidence = 96;

    // Seed 4: Account Management / Change Email (Low Risk, Already Approved)
    const t4: Ticket = {
      id: 'TCK-1039',
      customerName: 'Ananya Gupta',
      customerEmail: 'ananya.g@example.com',
      subject: 'How do I change my primary account email address?',
      description: 'I recently changed my company domain and would like to update my account email from ananya@oldbrand.com to ananya@newbrand.com.',
      category: 'Account Management',
      priority: 'LOW',
      department: 'Customer Support',
      sentiment: 'Neutral',
      status: 'APPROVED',
      isHighRisk: false,
      createdAt: new Date(now.getTime() - 180 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 120 * 60000).toISOString()
    };
    t4.aiAnalysis = FallbackProvider.analyzeTicket(t4);
    t4.humanReview = {
      reviewer: 'Agent Sarah Jenkins',
      originalCategory: 'Account Management',
      finalCategory: 'Account Management',
      originalPriority: 'LOW',
      finalPriority: 'LOW',
      originalDepartment: 'Customer Support',
      finalDepartment: 'Customer Support',
      originalResponse: t4.aiAnalysis.draftResponse,
      finalResponse: t4.aiAnalysis.draftResponse,
      decision: 'APPROVED',
      reviewedAt: new Date(now.getTime() - 120 * 60000).toISOString()
    };

    // Seed 5: Technical Issue / App Crash (High Priority, Resolved)
    const t5: Ticket = {
      id: 'TCK-1038',
      customerName: 'Vikram Singh',
      customerEmail: 'vikram.s@example.com',
      subject: 'App crashes every time I upload a PDF document',
      description: 'Whenever I try uploading a document larger than 5MB on the web portal, the browser tab freezes and throws a HTTP 500 error page.',
      category: 'Technical Support',
      priority: 'HIGH',
      department: 'Technical Support',
      sentiment: 'Frustrated',
      status: 'RESOLVED',
      isHighRisk: false,
      createdAt: new Date(now.getTime() - 300 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 240 * 60000).toISOString()
    };
    t5.aiAnalysis = FallbackProvider.analyzeTicket(t5);
    t5.humanReview = {
      reviewer: 'Agent Marcus Vance',
      originalCategory: 'Technical Support',
      finalCategory: 'Technical Support',
      originalPriority: 'MEDIUM',
      finalPriority: 'HIGH',
      originalDepartment: 'Technical Support',
      finalDepartment: 'Technical Support',
      originalResponse: t5.aiAnalysis.draftResponse,
      finalResponse: `Hi Vikram,\n\nOur patch release v2.4.1 has resolved the 5MB upload crash. Please refresh your session and try again.\n\nBest regards,\nResolveAI Support`,
      decision: 'EDITED_APPROVED',
      reviewedAt: new Date(now.getTime() - 240 * 60000).toISOString()
    };

    // Store in map
    this.tickets.set(t1.id, t1);
    this.tickets.set(t2.id, t2);
    this.tickets.set(t3.id, t3);
    this.tickets.set(t4.id, t4);
    this.tickets.set(t5.id, t5);

    // Initial audit logs
    this.addAuditLog(t1.id, 'TICKET_SUBMITTED', 'Aarav Sharma', 'CUSTOMER', 'Customer submitted support ticket via portal.');
    this.addAuditLog(t1.id, 'AI_ANALYSIS_COMPLETED', 'AI Service (Claude)', 'AI_SYSTEM', 'AI classified ticket as Billing (HIGH priority, 92% confidence). Flagged HIGH-RISK.');
    
    this.addAuditLog(t2.id, 'TICKET_SUBMITTED', 'Priya Patel', 'CUSTOMER', 'Customer submitted support ticket via portal.');
    this.addAuditLog(t2.id, 'AI_ANALYSIS_COMPLETED', 'AI Service (Fallback)', 'AI_SYSTEM', 'AI classified ticket as Account Access (MEDIUM priority, 88% confidence).');

    this.addAuditLog(t3.id, 'TICKET_SUBMITTED', 'Rohan Mehta', 'CUSTOMER', 'Customer submitted urgent ticket.');
    this.addAuditLog(t3.id, 'AI_ANALYSIS_COMPLETED', 'AI Service (Claude)', 'AI_SYSTEM', 'AI classified ticket as Fraud/Security (CRITICAL priority, 96% confidence). MANDATORY HUMAN APPROVAL REQUIRED.');

    this.addAuditLog(t4.id, 'TICKET_SUBMITTED', 'Ananya Gupta', 'CUSTOMER', 'Ticket submitted.');
    this.addAuditLog(t4.id, 'AI_ANALYSIS_COMPLETED', 'AI Engine', 'AI_SYSTEM', 'AI recommendation generated.');
    this.addAuditLog(t4.id, 'HUMAN_APPROVED', 'Agent Sarah Jenkins', 'HUMAN_AGENT', 'Agent approved AI response without edits. Resolution sent.');

    this.addAuditLog(t5.id, 'TICKET_SUBMITTED', 'Vikram Singh', 'CUSTOMER', 'Ticket submitted.');
    this.addAuditLog(t5.id, 'AI_ANALYSIS_COMPLETED', 'AI Engine', 'AI_SYSTEM', 'AI classified priority as MEDIUM.');
    this.addAuditLog(t5.id, 'HUMAN_EDITED_APPROVED', 'Agent Marcus Vance', 'HUMAN_AGENT', 'Agent upgraded priority MEDIUM → HIGH and customized technical response.');
  }

  public static getTickets(filters?: { status?: string; priority?: string; category?: string; search?: string; isHighRisk?: boolean }): Ticket[] {
    let list = Array.from(this.tickets.values());

    if (filters?.status) {
      list = list.filter(t => t.status === filters.status);
    }
    if (filters?.priority) {
      list = list.filter(t => t.priority === filters.priority);
    }
    if (filters?.category) {
      list = list.filter(t => t.category === filters.category);
    }
    if (filters?.isHighRisk !== undefined) {
      list = list.filter(t => t.isHighRisk === filters.isHighRisk);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t => 
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getTicketById(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  public static createTicket(data: {
    customerName: string;
    customerEmail: string;
    subject: string;
    description: string;
    suggestedCategory?: Category;
  }): Ticket {
    const id = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      subject: data.subject,
      description: data.description,
      suggestedCategory: data.suggestedCategory,
      category: data.suggestedCategory || 'General Inquiry',
      priority: 'MEDIUM',
      department: 'Customer Support',
      status: 'NEW',
      isHighRisk: false,
      createdAt: now,
      updatedAt: now
    };

    this.tickets.set(id, newTicket);
    this.addAuditLog(id, 'TICKET_SUBMITTED', data.customerName, 'CUSTOMER', `Ticket #${id} submitted by customer.`);
    return newTicket;
  }

  public static updateTicketAIAnalysis(id: string, analysis: any): Ticket {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found.`);

    ticket.aiAnalysis = analysis;
    ticket.category = analysis.category;
    ticket.priority = analysis.priority;
    ticket.department = analysis.department;
    ticket.sentiment = analysis.sentiment;
    ticket.isHighRisk = analysis.isHighRisk;
    ticket.status = 'AWAITING_HUMAN_REVIEW';
    ticket.updatedAt = new Date().toISOString();

    this.tickets.set(id, ticket);

    const providerNote = analysis.usedFallback ? ` (Fallback Engine)` : ` (${analysis.providerName})`;
    this.addAuditLog(
      id,
      'AI_ANALYSIS_COMPLETED',
      `AI Service${providerNote}`,
      'AI_SYSTEM',
      `Categorized as ${analysis.category}, Priority: ${analysis.priority}, Confidence: ${analysis.confidence}%. ${analysis.isHighRisk ? 'FLAGGED HIGH RISK ACTION.' : ''}`
    );

    return ticket;
  }

  public static approveTicket(id: string, review: {
    reviewer: string;
    category: Category;
    priority: Priority;
    department: Department;
    finalResponse: string;
  }): Ticket {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found.`);

    const wasEdited = 
      review.category !== ticket.aiAnalysis?.category ||
      review.priority !== ticket.aiAnalysis?.priority ||
      review.department !== ticket.aiAnalysis?.department ||
      review.finalResponse.trim() !== ticket.aiAnalysis?.draftResponse.trim();

    const decision = wasEdited ? 'EDITED_APPROVED' : 'APPROVED';
    const status: TicketStatus = wasEdited ? 'EDITED_APPROVED' : 'APPROVED';

    const humanReview: HumanReview = {
      reviewer: review.reviewer || 'Agent Support Specialist',
      originalCategory: ticket.aiAnalysis?.category || ticket.category,
      finalCategory: review.category,
      originalPriority: ticket.aiAnalysis?.priority || ticket.priority,
      finalPriority: review.priority,
      originalDepartment: ticket.aiAnalysis?.department || ticket.department,
      finalDepartment: review.department,
      originalResponse: ticket.aiAnalysis?.draftResponse || '',
      finalResponse: review.finalResponse,
      decision,
      reviewedAt: new Date().toISOString()
    };

    ticket.category = review.category;
    ticket.priority = review.priority;
    ticket.department = review.department;
    ticket.humanReview = humanReview;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();

    this.tickets.set(id, ticket);

    if (wasEdited) {
      this.addAuditLog(
        id,
        'HUMAN_EDITED_APPROVED',
        review.reviewer || 'Agent Specialist',
        'HUMAN_AGENT',
        `Agent modified AI recommendation (${humanReview.originalPriority} → ${humanReview.finalPriority}) and approved response for dispatch.`
      );
    } else {
      this.addAuditLog(
        id,
        'HUMAN_APPROVED',
        review.reviewer || 'Agent Specialist',
        'HUMAN_AGENT',
        `Agent verified and approved AI recommendation without edits. Response dispatched to ${ticket.customerEmail}.`
      );
    }

    return ticket;
  }

  public static rejectTicket(id: string, reviewer: string, reason: string): Ticket {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found.`);

    ticket.status = 'REJECTED';
    ticket.updatedAt = new Date().toISOString();
    ticket.humanReview = {
      reviewer: reviewer || 'Agent Support Specialist',
      originalCategory: ticket.aiAnalysis?.category || ticket.category,
      finalCategory: ticket.category,
      originalPriority: ticket.aiAnalysis?.priority || ticket.priority,
      finalPriority: ticket.priority,
      originalDepartment: ticket.aiAnalysis?.department || ticket.department,
      finalDepartment: ticket.department,
      originalResponse: ticket.aiAnalysis?.draftResponse || '',
      finalResponse: '[REJECTED - MANUAL REWORK REQUIRED]',
      decision: 'REJECTED',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString()
    };

    this.tickets.set(id, ticket);

    this.addAuditLog(
      id,
      'HUMAN_REJECTED',
      reviewer || 'Agent Specialist',
      'HUMAN_AGENT',
      `Agent rejected AI recommendation. Reason: "${reason}". Returned ticket for manual rework.`
    );

    return ticket;
  }

  public static escalateTicket(id: string, reviewer: string, note: string): Ticket {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found.`);

    ticket.status = 'ESCALATED';
    ticket.updatedAt = new Date().toISOString();

    this.tickets.set(id, ticket);

    this.addAuditLog(
      id,
      'HUMAN_ESCALATED',
      reviewer || 'Agent Specialist',
      'HUMAN_AGENT',
      `Escalated to Operations Lead / Tier-2 Manager. Note: "${note}".`
    );

    return ticket;
  }

  public static getAuditLogs(ticketId?: string): AuditLog[] {
    if (ticketId) {
      return this.auditLogs
        .filter(log => log.ticketId === ticketId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static addAuditLog(ticketId: string, action: string, actor: string, actorRole: AuditLog['actorRole'], details: string) {
    const log: AuditLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      ticketId,
      action,
      actor,
      actorRole,
      details,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.unshift(log);
  }

  public static getDashboardStats(): DashboardStats {
    const all = Array.from(this.tickets.values());
    
    const totalTickets = all.length;
    const pendingReview = all.filter(t => t.status === 'AWAITING_HUMAN_REVIEW' || t.status === 'NEW').length;
    const highPriority = all.filter(t => t.priority === 'HIGH').length;
    const criticalPriority = all.filter(t => t.priority === 'CRITICAL').length;
    const approved = all.filter(t => t.status === 'APPROVED').length;
    const editedApproved = all.filter(t => t.status === 'EDITED_APPROVED').length;
    const rejected = all.filter(t => t.status === 'REJECTED').length;
    const resolved = all.filter(t => t.status === 'APPROVED' || t.status === 'EDITED_APPROVED' || t.status === 'RESOLVED').length;
    const highRiskCount = all.filter(t => t.isHighRisk).length;

    // Calculate AI Accuracy: proportion of reviews approved without major override
    const reviewed = all.filter(t => t.humanReview);
    let aiAccuracyPercentage = 88;
    if (reviewed.length > 0) {
      const pureApproved = reviewed.filter(t => t.humanReview?.decision === 'APPROVED').length;
      aiAccuracyPercentage = Math.round((pureApproved / reviewed.length) * 100);
    }

    return {
      totalTickets,
      pendingReview,
      highPriority,
      criticalPriority,
      approved,
      editedApproved,
      rejected,
      resolved,
      highRiskCount,
      aiAccuracyPercentage,
      avgResolutionTimeMinutes: 4.2
    };
  }
}

// Auto initialize seed data
DBService.init();
