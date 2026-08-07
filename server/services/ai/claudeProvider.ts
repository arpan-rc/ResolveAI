import Anthropic from '@anthropic-ai/sdk';
import { AIAnalysis, Ticket } from '../../types';

export class ClaudeProvider {
  /**
   * Calls Anthropic Claude API to analyze ticket details and produce structured JSON analysis.
   */
  public static async analyzeTicket(ticket: Partial<Ticket>, apiKey: string): Promise<AIAnalysis> {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are ResolveAI's expert customer support triaging AI.
Analyze the following customer support ticket and return ONLY a strict valid JSON object (no markdown, no extra commentary).

TICKET DETAILS:
- Customer Name: ${ticket.customerName || 'Unknown'}
- Customer Email: ${ticket.customerEmail || 'Unknown'}
- Subject: ${ticket.subject || 'No Subject'}
- Description: ${ticket.description || 'No Description'}
- Optional Category Hint: ${ticket.suggestedCategory || 'None'}

EXPECTED JSON SCHEMA:
{
  "category": "Billing" | "Account Access" | "Technical Support" | "Fraud/Security" | "Account Management" | "General Inquiry",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "department": "Finance" | "Technical Support" | "Customer Support" | "Security" | "Operations",
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Urgent" | "Negative",
  "summary": "Concise 1-2 sentence executive summary of customer issue",
  "suggestedAction": "Clear recommended next action for support agent",
  "draftResponse": "Polite, empathetic professional customer response draft",
  "confidence": 85, // integer 0-100 overall confidence score
  "confidenceScores": {
    "category": 90,
    "priority": 85,
    "department": 88
  },
  "isHighRisk": true, // boolean - true if refund, financial dispute, account deletion, fraud, unauthorized access, or critical urgency
  "riskReason": "Brief explanation if high risk, e.g. Involves financial refund processing",
  "decisionReasoning": "Brief 1-sentence safe explanation of why priority and category were chosen (e.g., Marked HIGH because ticket mentions duplicate financial charge)."
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const contentBlock = response.content[0];
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new Error('Claude API returned non-text response content.');
    }

    let rawText = contentBlock.text.trim();
    // Clean up potential code block formatting if returned by model
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(rawText);

    // Validate required fields
    if (!parsed.category || !parsed.priority || !parsed.department || !parsed.draftResponse) {
      throw new Error('Claude response missing required fields in JSON.');
    }

    return {
      category: parsed.category,
      priority: parsed.priority,
      department: parsed.department,
      sentiment: parsed.sentiment || 'Neutral',
      summary: parsed.summary || 'Customer support inquiry submitted.',
      suggestedAction: parsed.suggestedAction || 'Review ticket details and process request.',
      draftResponse: parsed.draftResponse,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 88,
      confidenceScores: {
        category: parsed.confidenceScores?.category || 90,
        priority: parsed.confidenceScores?.priority || 85,
        department: parsed.confidenceScores?.department || 88,
        overall: typeof parsed.confidence === 'number' ? parsed.confidence : 88
      },
      isHighRisk: Boolean(parsed.isHighRisk),
      riskReason: parsed.riskReason || undefined,
      decisionReasoning: parsed.decisionReasoning || `Analyzed by Claude AI Sonnet. Flagged ${parsed.priority} priority for ${parsed.category}.`,
      usedFallback: false,
      providerName: 'Anthropic Claude 3.5 Sonnet',
      analyzedAt: new Date().toISOString()
    };
  }
}
