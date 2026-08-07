export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Category = 
  | 'Billing'
  | 'Account Access'
  | 'Technical Support'
  | 'Fraud/Security'
  | 'Account Management'
  | 'General Inquiry';

export type Department = 
  | 'Finance'
  | 'Technical Support'
  | 'Customer Support'
  | 'Security'
  | 'Operations';

export type TicketStatus = 
  | 'NEW'
  | 'AWAITING_HUMAN_REVIEW'
  | 'APPROVED'
  | 'EDITED_APPROVED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'ESCALATED';

export type Sentiment = 'Positive' | 'Neutral' | 'Frustrated' | 'Urgent' | 'Negative';

export interface ConfidenceScores {
  category: number;
  priority: number;
  department: number;
  overall: number;
}

export interface AIAnalysis {
  category: Category;
  priority: Priority;
  department: Department;
  sentiment: Sentiment;
  summary: string;
  suggestedAction: string;
  draftResponse: string;
  confidence: number; // 0-100
  confidenceScores: ConfidenceScores;
  isHighRisk: boolean;
  riskReason?: string;
  decisionReasoning: string;
  usedFallback: boolean;
  providerName: string;
  analyzedAt: string;
}

export interface HumanReview {
  reviewer: string;
  originalCategory: Category;
  finalCategory: Category;
  originalPriority: Priority;
  finalPriority: Priority;
  originalDepartment: Department;
  finalDepartment: Department;
  originalResponse: string;
  finalResponse: string;
  decision: 'APPROVED' | 'EDITED_APPROVED' | 'REJECTED' | 'ESCALATED';
  rejectionReason?: string;
  escalationNote?: string;
  reviewedAt: string;
}

export interface AuditLog {
  id: string;
  ticketId: string;
  action: string;
  actor: string;
  actorRole: 'CUSTOMER' | 'AI_SYSTEM' | 'HUMAN_AGENT' | 'SYSTEM';
  details: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  suggestedCategory?: Category;
  category: Category;
  priority: Priority;
  department: Department;
  sentiment?: Sentiment;
  status: TicketStatus;
  aiAnalysis?: AIAnalysis;
  humanReview?: HumanReview;
  isHighRisk: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  pendingReview: number;
  highPriority: number;
  criticalPriority: number;
  approved: number;
  editedApproved: number;
  rejected: number;
  resolved: number;
  highRiskCount: number;
  aiAccuracyPercentage: number;
  avgResolutionTimeMinutes: number;
}
