import { AIAnalysis, Ticket } from '../../types';
import { ClaudeProvider } from './claudeProvider';
import { FallbackProvider } from './fallbackProvider';

export class AIService {
  private static TIMEOUT_MS = 8000; // 8 seconds timeout for AI calls

  /**
   * Main entrypoint for analyzing support tickets.
   * Guaranteed NEVER to crash or throw. Will seamlessly switch to FallbackProvider
   * on timeout, missing key, invalid output, or network error.
   */
  public static async analyzeTicket(ticket: Partial<Ticket>, options?: { forceFallback?: boolean }): Promise<AIAnalysis> {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    const isForceFallback = options?.forceFallback || process.env.FORCE_FALLBACK_MODE === 'true';

    if (isForceFallback) {
      console.log(`[AIService] Forced fallback mode active. Using FallbackProvider for ticket #${ticket.id || 'new'}.`);
      return FallbackProvider.analyzeTicket(ticket);
    }

    if (!apiKey) {
      console.log(`[AIService] ANTHROPIC_API_KEY is not set or empty. Using FallbackProvider for ticket #${ticket.id || 'new'}.`);
      return FallbackProvider.analyzeTicket(ticket);
    }

    try {
      // Execute with timeout promise racing
      const aiPromise = ClaudeProvider.analyzeTicket(ticket, apiKey);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Provider timed out after 8 seconds')), this.TIMEOUT_MS)
      );

      const result = await Promise.race([aiPromise, timeoutPromise]);
      console.log(`[AIService] Ticket #${ticket.id || 'new'} successfully analyzed via ${result.providerName}.`);
      return result;

    } catch (error: any) {
      console.warn(`[AIService] Primary AI analysis failed/timed out: ${error?.message || error}. Falling back to deterministic rule engine.`);
      
      const fallbackResult = FallbackProvider.analyzeTicket(ticket);
      // Append warning note to fallback decision reasoning so agent UI clearly sees why fallback was triggered
      fallbackResult.decisionReasoning = `[Fallback Engaged: ${error?.message || 'AI API unavailable'}] ${fallbackResult.decisionReasoning}`;
      return fallbackResult;
    }
  }

  /**
   * Returns current AI Service configuration and health status
   */
  public static getStatus(): { hasApiKey: boolean; forceFallback: boolean; activeProvider: string } {
    const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    const forceFallback = process.env.FORCE_FALLBACK_MODE === 'true';

    let activeProvider = 'Deterministic Fallback Rule Engine';
    if (hasApiKey && !forceFallback) {
      activeProvider = 'Anthropic Claude 3.5 Sonnet';
    }

    return {
      hasApiKey,
      forceFallback,
      activeProvider
    };
  }
}
