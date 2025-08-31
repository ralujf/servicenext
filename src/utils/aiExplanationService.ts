import { projectId, publicAnonKey } from './supabase/info';

export interface AIExplanationResponse {
  success: boolean;
  explanation?: string;
  cached?: boolean;
  error?: string;
  message?: string;
  submissionCount?: number;
  required?: number;
}

class AIExplanationService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;

  async getExplanation(
    questionId: string,
    questionTitle: string,
    questionDescription: string,
    userCode: string,
    isCorrect: boolean,
    accessToken: string
  ): Promise<AIExplanationResponse> {
    try {
      if (!accessToken || !accessToken.trim()) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.baseUrl}/ai-explanation/${questionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionTitle,
          questionDescription,
          userCode,
          isCorrect
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to get AI explanation',
          message: data.message,
          submissionCount: data.submissionCount,
          required: data.required
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI explanation'
      };
    }
  }
}

export const aiExplanationService = new AIExplanationService();