import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysis, Ticket } from '../../types';

export class GeminiProvider {
  /**
   * Calls Google Gemini API (gemini-3.6-flash) to analyze ticket details and produce structured JSON analysis.
   */
  public static async analyzeTicket(ticket: Partial<Ticket>, apiKey: string): Promise<AIAnalysis> {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `Analyze the following customer support ticket and classify it accurately according to the JSON schema.

TICKET DETAILS:
- Customer Name: ${ticket.customerName || 'Unknown'}
- Customer Email: ${ticket.customerEmail || 'Unknown'}
- Subject: ${ticket.subject || 'No Subject'}
- Description: ${ticket.description || 'No Description'}
- Optional Category Hint: ${ticket.suggestedCategory || 'None'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are ResolveAI's expert customer support triaging AI.
Analyze tickets and return strict structured output adhering to the schema.
Mark isHighRisk as true if the issue involves financial refunds, billing disputes, unauthorized logins, security breaches, account deletion, or critical urgency.`,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "Must be one of: Billing, Account Access, Technical Support, Fraud/Security, Account Management, General Inquiry"
            },
            priority: {
              type: Type.STRING,
              description: "Must be one of: LOW, MEDIUM, HIGH, CRITICAL"
            },
            department: {
              type: Type.STRING,
              description: "Must be one of: Finance, Technical Support, Customer Support, Security, Operations"
            },
            sentiment: {
              type: Type.STRING,
              description: "Must be one of: Positive, Neutral, Frustrated, Urgent, Negative"
            },
            summary: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            draftResponse: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            confidenceScores: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.INTEGER },
                priority: { type: Type.INTEGER },
                department: { type: Type.INTEGER }
              }
            },
            isHighRisk: { type: Type.BOOLEAN },
            riskReason: { type: Type.STRING },
            decisionReasoning: { type: Type.STRING }
          },
          required: ["category", "priority", "department", "draftResponse"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API returned empty response content.');
    }

    let rawText = text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(rawText);

    if (!parsed.category || !parsed.priority || !parsed.department || !parsed.draftResponse) {
      throw new Error('Gemini response missing required fields in JSON.');
    }

    const validCategories = ['Billing', 'Account Access', 'Technical Support', 'Fraud/Security', 'Account Management', 'General Inquiry'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const validDepartments = ['Finance', 'Technical Support', 'Customer Support', 'Security', 'Operations'];

    const category = validCategories.includes(parsed.category) ? parsed.category : 'General Inquiry';
    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : 'MEDIUM';
    const department = validDepartments.includes(parsed.department) ? parsed.department : 'Customer Support';

    return {
      category: category as any,
      priority: priority as any,
      department: department as any,
      sentiment: parsed.sentiment || 'Neutral',
      summary: parsed.summary || 'Customer support inquiry submitted.',
      suggestedAction: parsed.suggestedAction || 'Review ticket details and process request.',
      draftResponse: parsed.draftResponse,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 90,
      confidenceScores: {
        category: parsed.confidenceScores?.category || 92,
        priority: parsed.confidenceScores?.priority || 88,
        department: parsed.confidenceScores?.department || 90,
        overall: typeof parsed.confidence === 'number' ? parsed.confidence : 90
      },
      isHighRisk: Boolean(parsed.isHighRisk),
      riskReason: parsed.riskReason || undefined,
      decisionReasoning: parsed.decisionReasoning || `Analyzed by Google Gemini 3.6 Flash. Flagged ${priority} priority for ${category}.`,
      usedFallback: false,
      providerName: 'Google Gemini 3.6 Flash',
      analyzedAt: new Date().toISOString()
    };
  }
}
