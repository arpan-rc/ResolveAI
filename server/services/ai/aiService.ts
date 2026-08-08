import { AIAnalysis, Ticket } from '../../types';
import { ClaudeProvider } from './claudeProvider';
import { GeminiProvider } from './geminiProvider';
import { FallbackProvider } from './fallbackProvider';

export class AIService {
  private static TIMEOUT_MS = 8000; // 8 seconds timeout for AI calls

  /**
   * Main entrypoint for analyzing support tickets.
   * Guaranteed NEVER to crash or throw.
   * Tries Claude API if ANTHROPIC_API_KEY is present, and/or Gemini API if GEMINI_API_KEY is present.
   * Will seamlessly switch to FallbackProvider on timeout, missing keys, invalid output, or network error.
   */
  public static async analyzeTicket(ticket: Partial<Ticket>, options?: { forceFallback?: boolean }): Promise<AIAnalysis> {
    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const isForceFallback = options?.forceFallback || process.env.FORCE_FALLBACK_MODE === 'true';

    if (isForceFallback) {
      console.log(`[AIService] Forced fallback mode active. Using FallbackProvider for ticket #${ticket.id || 'new'}.`);
      return FallbackProvider.analyzeTicket(ticket);
    }

    if (!anthropicKey && !geminiKey) {
      console.log(`[AIService] Neither ANTHROPIC_API_KEY nor GEMINI_API_KEY is configured. Using FallbackProvider for ticket #${ticket.id || 'new'}.`);
      return FallbackProvider.analyzeTicket(ticket);
    }

    // Attempt 1: Try Anthropic Claude if key is set
    if (anthropicKey) {
      try {
        console.log(`[AIService] Attempting ticket #${ticket.id || 'new'} analysis via Anthropic Claude...`);
        const aiPromise = ClaudeProvider.analyzeTicket(ticket, anthropicKey);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Claude API timed out after 8s')), this.TIMEOUT_MS)
        );

        const result = await Promise.race([aiPromise, timeoutPromise]);
        console.log(`[AIService] Ticket #${ticket.id || 'new'} successfully analyzed via ${result.providerName}.`);
        return result;
      } catch (error: any) {
        console.warn(`[AIService] Claude AI provider failed/timed out: ${error?.message || error}. Falling over to backup providers.`);
      }
    }

    // Attempt 2: Try Google Gemini if key is set
    if (geminiKey) {
      try {
        console.log(`[AIService] Attempting ticket #${ticket.id || 'new'} analysis via Google Gemini...`);
        const aiPromise = GeminiProvider.analyzeTicket(ticket, geminiKey);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timed out after 8s')), this.TIMEOUT_MS)
        );

        const result = await Promise.race([aiPromise, timeoutPromise]);
        console.log(`[AIService] Ticket #${ticket.id || 'new'} successfully analyzed via ${result.providerName}.`);
        return result;
      } catch (error: any) {
        console.warn(`[AIService] Gemini AI provider failed/timed out: ${error?.message || error}.`);
      }
    }

    // Fallback if all AI calls failed or were unavailable
    console.warn(`[AIService] All configured AI providers failed/timed out. Falling back to deterministic rule engine.`);
    const fallbackResult = FallbackProvider.analyzeTicket(ticket);
    fallbackResult.decisionReasoning = `[Fallback Engaged: AI APIs unavailable] ${fallbackResult.decisionReasoning}`;
    return fallbackResult;
  }

  /**
   * Returns current AI Service configuration and health status
   */
  public static getStatus(): { hasApiKey: boolean; forceFallback: boolean; activeProvider: string } {
    const hasClaudeKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    const forceFallback = process.env.FORCE_FALLBACK_MODE === 'true';

    let activeProvider = 'Deterministic Fallback Rule Engine';
    if (!forceFallback) {
      if (hasClaudeKey && hasGeminiKey) {
        activeProvider = 'Anthropic Claude 3.5 Sonnet + Google Gemini 3.6 Flash';
      } else if (hasClaudeKey) {
        activeProvider = 'Anthropic Claude 3.5 Sonnet';
      } else if (hasGeminiKey) {
        activeProvider = 'Google Gemini 3.6 Flash';
      }
    }

    return {
      hasApiKey: hasClaudeKey || hasGeminiKey,
      forceFallback,
      activeProvider
    };
  }
}
