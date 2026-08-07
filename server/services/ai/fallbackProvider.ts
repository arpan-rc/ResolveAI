import { AIAnalysis, Category, Department, Priority, Sentiment, Ticket } from '../../types';

/**
 * Deterministic Rule-Based Fallback Provider for ResolveAI
 * Ensures 100% reliability if the AI API is down, rate-limited, times out, or receives no API key.
 */
export class FallbackProvider {
  public static analyzeTicket(ticket: Partial<Ticket>): AIAnalysis {
    const text = `${ticket.subject || ''} ${ticket.description || ''}`.toLowerCase();
    
    // 1. Detect Category & Department
    let category: Category = 'General Inquiry';
    let department: Department = 'Customer Support';
    let categoryConfidence = 82;

    if (this.containsAny(text, ['hack', 'hacked', 'fraud', 'unauthorized', 'stolen', 'suspicious', 'breach', 'scam', 'phishing', 'compromised'])) {
      category = 'Fraud/Security';
      department = 'Security';
      categoryConfidence = 96;
    } else if (this.containsAny(text, ['charge', 'charged', 'refund', 'subscription', 'payment', 'billing', 'invoice', 'credit card', 'duplicate', 'money', 'price', 'plan', 'fee', 'receipt'])) {
      category = 'Billing';
      department = 'Finance';
      categoryConfidence = 94;
    } else if (this.containsAny(text, ['password', 'login', 'sign in', 'log in', 'access', 'reset', 'auth', 'account locked', 'two-factor', '2fa', 'verification code'])) {
      category = 'Account Access';
      department = 'Technical Support';
      categoryConfidence = 91;
    } else if (this.containsAny(text, ['crash', 'bug', 'error', 'broken', 'not working', 'upload', 'failed', 'slow', 'freeze', 'glitch', 'exception', 'app store'])) {
      category = 'Technical Support';
      department = 'Technical Support';
      categoryConfidence = 89;
    } else if (this.containsAny(text, ['email', 'change email', 'profile', 'address', 'setting', 'preferences', 'username', 'avatar', 'delete account', 'close account'])) {
      category = 'Account Management';
      department = 'Customer Support';
      categoryConfidence = 87;
    }

    // 2. Detect Priority
    let priority: Priority = 'LOW';
    let priorityConfidence = 85;

    if (this.containsAny(text, ['urgent', 'fraud', 'hacked', 'unauthorized', 'stolen', 'emergency', 'security breach', 'critical'])) {
      priority = 'CRITICAL';
      priorityConfidence = 95;
    } else if (this.containsAny(text, ['charged twice', 'duplicate payment', 'refund', 'crash', 'broken', 'cannot access', 'cannot log in', 'money stolen', 'asap', 'overcharge'])) {
      priority = 'HIGH';
      priorityConfidence = 90;
    } else if (this.containsAny(text, ['error', 'password', 'login', 'issue', 'not working', 'slow'])) {
      priority = 'MEDIUM';
      priorityConfidence = 86;
    }

    // 3. Detect High Risk Action requirement
    const isHighRisk = this.containsAny(text, [
      'refund', 'charged twice', 'duplicate payment', 'fraud', 'unauthorized', 
      'hacked', 'delete account', 'wire transfer', 'payout', 'suspension', 'dispute'
    ]) || priority === 'CRITICAL';

    let riskReason = '';
    if (isHighRisk) {
      if (this.containsAny(text, ['refund', 'charged twice', 'duplicate payment'])) {
        riskReason = 'Involves financial refund or dispute processing.';
      } else if (this.containsAny(text, ['fraud', 'unauthorized', 'hacked'])) {
        riskReason = 'Involves critical security or unauthorized account activity.';
      } else if (this.containsAny(text, ['delete account'])) {
        riskReason = 'Involves permanent loss of user account data.';
      } else {
        riskReason = 'Flagged as high priority critical support request.';
      }
    }

    // 4. Sentiment Detection
    let sentiment: Sentiment = 'Neutral';
    if (this.containsAny(text, ['hacked', 'stolen', 'fraud', 'urgent', 'immediately', 'furious'])) {
      sentiment = 'Urgent';
    } else if (this.containsAny(text, ['charged twice', 'frustrated', 'angry', 'terrible', 'upset', 'ridiculous', 'horrible'])) {
      sentiment = 'Frustrated';
    } else if (this.containsAny(text, ['issue', 'problem', 'broken', 'error'])) {
      sentiment = 'Negative';
    } else if (this.containsAny(text, ['thanks', 'thank you', 'love', 'great', 'help'])) {
      sentiment = 'Positive';
    }

    // 5. Summary & Action
    let summary = `Customer reported issue regarding ${category.toLowerCase()}.`;
    if (ticket.subject) {
      summary = `Customer (${ticket.customerName || 'User'}) reported: "${ticket.subject}". Details highlight ${category.toLowerCase()} concern.`;
    }

    let suggestedAction = 'Review ticket details and respond to customer.';
    if (category === 'Billing') {
      suggestedAction = 'Verify transaction ledger for duplicate records and prepare refund authorisation if confirmed.';
    } else if (category === 'Account Access') {
      suggestedAction = 'Verify account ownership and send secure password/auth recovery link.';
    } else if (category === 'Fraud/Security') {
      suggestedAction = 'Immediately lock suspicious account sessions, review IP audit trail, and contact security officer.';
    } else if (category === 'Technical Support') {
      suggestedAction = 'Check application status logs for reported crash/error pattern and provide troubleshooting workaround.';
    } else if (category === 'Account Management') {
      suggestedAction = 'Guide customer through account self-service settings or assist with verified manual update.';
    }

    // 6. Draft Response Generator
    const draftResponse = this.generateDraftResponse(category, ticket.customerName || 'Customer', suggestedAction, isHighRisk);

    // 7. Decision Reasoning Explanation (Safe, concise)
    const decisionReasoning = `Analyzed using deterministic pattern matching. Classed as ${category} (${priority} priority) because description matches key indicators (${this.extractMatchedKeywords(text).slice(0, 3).join(', ')}).`;

    const overallConfidence = Math.round((categoryConfidence + priorityConfidence + 88) / 3);

    return {
      category,
      priority,
      department,
      sentiment,
      summary,
      suggestedAction,
      draftResponse,
      confidence: overallConfidence,
      confidenceScores: {
        category: categoryConfidence,
        priority: priorityConfidence,
        department: 90,
        overall: overallConfidence
      },
      isHighRisk,
      riskReason: isHighRisk ? riskReason : undefined,
      decisionReasoning,
      usedFallback: true,
      providerName: 'Deterministic Fallback Rule Engine',
      analyzedAt: new Date().toISOString()
    };
  }

  private static generateDraftResponse(category: Category, customerName: string, action: string, isHighRisk: boolean): string {
    const greeting = `Hello ${customerName},\n\nThank you for contacting ResolveAI Support.`;
    const closing = `\n\nIf you have any further questions, please reply to this message.\n\nBest regards,\nResolveAI Support Team`;

    if (category === 'Billing') {
      return `${greeting}\n\nWe apologize for the inconvenience regarding your billing inquiry. Our finance department is reviewing your account to verify any duplicate transactions.\n\n${isHighRisk ? 'A support specialist is verifying the transaction details before finalizing any credit or refund.' : 'We will update your account status shortly.'}${closing}`;
    }

    if (category === 'Account Access') {
      return `${greeting}\n\nWe understand you are experiencing difficulties signing in. We have initiated a secure account verification check for your email address.\n\nPlease follow the password reset link sent to your inbox or let us know if you need further multi-factor authentication assistance.${closing}`;
    }

    if (category === 'Fraud/Security') {
      return `${greeting}\n\nWe treat security matters with the highest urgency. Our security team has logged your report and is conducting an immediate review of unauthorized account access attempts.\n\nAs a precaution, we recommend changing passwords on related accounts and securing your device.${closing}`;
    }

    if (category === 'Technical Support') {
      return `${greeting}\n\nWe're sorry to hear about the technical issue you encountered. Our engineering team has logged this diagnostic report and is working to resolve it.\n\nIn the meantime, please try clearing your browser cache or updating to the latest application version.${closing}`;
    }

    return `${greeting}\n\nWe have received your ticket regarding your inquiry. ${action}\n\nWe appreciate your patience while our team works on your request.${closing}`;
  }

  private static containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }

  private static extractMatchedKeywords(text: string): string[] {
    const pool = ['charged twice', 'refund', 'password', 'login', 'hacked', 'fraud', 'crash', 'bug', 'urgent', 'duplicate', 'unauthorized'];
    return pool.filter(kw => text.includes(kw));
  }
}
