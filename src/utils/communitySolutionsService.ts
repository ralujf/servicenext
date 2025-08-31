import { projectId, publicAnonKey } from './supabase/info';

interface CommunitySolution {
  id: string;
  userId: string;
  userName: string;
  code: string;
  language: string;
  submittedAt: string;
}

interface CommunitySolutionsResponse {
  solutions: CommunitySolution[];
}

interface SubmitSolutionResponse {
  success: boolean;
  solution?: CommunitySolution;
  error?: string;
}

export class CommunitySolutionsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;
  }

  async getCommunitySolutions(questionId: string): Promise<CommunitySolution[]> {
    try {
      const response = await fetch(`${this.baseUrl}/community-solutions/${questionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch community solutions: ${response.statusText}`);
      }

      const data: CommunitySolutionsResponse = await response.json();
      return data.solutions;
    } catch (error) {
      console.error('Error fetching community solutions:', error);
      return [];
    }
  }

  async submitSolution(
    questionId: string, 
    code: string, 
    accessToken: string,
    language: string = 'javascript'
  ): Promise<SubmitSolutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/community-solutions/${questionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to submit solution' };
      }

      return data;
    } catch (error) {
      console.error('Error submitting community solution:', error);
      return { success: false, error: 'Failed to submit solution' };
    }
  }
}

export const communitySolutionsService = new CommunitySolutionsService();
export type { CommunitySolution };