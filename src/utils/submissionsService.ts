import { projectId, publicAnonKey } from './supabase/info';

export interface Submission {
  id: string;
  questionId: string;
  userId: string;
  code: string;
  isCorrect: boolean;
  submissionTime: string;
  executionTime?: number;
  testsPassed?: number;
  totalTests?: number;
}

export interface SubmissionsResponse {
  success: boolean;
  submissions?: Submission[];
  error?: string;
}

export interface SubmitCodeResponse {
  success: boolean;
  submission?: Submission;
  error?: string;
}

class SubmissionsService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;

  async getUserSubmissions(questionId: string, accessToken: string): Promise<SubmissionsResponse> {
    try {
      if (!accessToken || accessToken.trim() === '') {
        return {
          success: false,
          error: 'No valid access token provided'
        };
      }

      const response = await fetch(`${this.baseUrl}/submissions/${questionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse the error response, keep the generic message
        }
        
        if (response.status === 401) {
          errorMessage = 'Authorization required - please sign in again';
        } else if (response.status === 404) {
          // 404 is expected for users with no submissions
          return {
            success: true,
            submissions: []
          };
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch submissions'
      };
    }
  }

  async submitCode(
    questionId: string, 
    code: string, 
    isCorrect: boolean,
    executionTime?: number,
    testsPassed?: number,
    totalTests?: number,
    accessToken?: string
  ): Promise<SubmitCodeResponse> {
    try {
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          code,
          isCorrect,
          executionTime,
          testsPassed,
          totalTests
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit code'
      };
    }
  }
}

export const submissionsService = new SubmissionsService();