import { projectId, publicAnonKey } from './supabase/info';
import { supabaseClient } from './supabase/client';

export interface QuestionVotes {
  questionId: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
}

export interface UserVote {
  questionId: string;
  userId: string;
  voteType: 'up' | 'down';
  timestamp: string;
}

class VotingService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;
  
  // Get votes for a specific question
  async getQuestionVotes(questionId: string): Promise<QuestionVotes> {
    try {
      const response = await fetch(`${this.baseUrl}/votes/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch votes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching question votes:', error);
      return {
        questionId,
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0
      };
    }
  }

  // Get votes for multiple questions
  async getMultipleQuestionVotes(questionIds: string[]): Promise<{ [questionId: string]: QuestionVotes }> {
    try {
      const response = await fetch(`${this.baseUrl}/votes/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questionIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bulk votes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bulk votes:', error);
      // Return empty vote data for all questions
      const emptyVotes: { [questionId: string]: QuestionVotes } = {};
      questionIds.forEach(id => {
        emptyVotes[id] = {
          questionId: id,
          upvotes: 0,
          downvotes: 0,
          totalVotes: 0
        };
      });
      return emptyVotes;
    }
  }

  // Submit a vote (for logged-in users)
  async submitVote(questionId: string, voteType: 'up' | 'down', accessToken: string): Promise<{ success: boolean; votes: QuestionVotes }> {
    try {
      const response = await fetch(`${this.baseUrl}/votes/${questionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit vote: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  // Submit anonymous vote (for non-logged-in users)
  async submitAnonymousVote(questionId: string, voteType: 'up' | 'down', sessionId: string): Promise<{ success: boolean; votes: QuestionVotes }> {
    try {
      const response = await fetch(`${this.baseUrl}/votes/${questionId}/anonymous`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType, sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit anonymous vote: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting anonymous vote:', error);
      throw error;
    }
  }

  // Get user's vote for a question (for logged-in users)
  async getUserVote(questionId: string, accessToken: string): Promise<UserVote | null> {
    try {
      const response = await fetch(`${this.baseUrl}/votes/${questionId}/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No vote found
        }
        throw new Error(`Failed to fetch user vote: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      return null;
    }
  }

  // Get user's votes for multiple questions (for logged-in users)
  async getUserVotes(questionIds: string[], accessToken: string): Promise<{ [questionId: string]: UserVote | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/votes/user/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questionIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user votes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user votes:', error);
      // Return null votes for all questions
      const emptyVotes: { [questionId: string]: UserVote | null } = {};
      questionIds.forEach(id => {
        emptyVotes[id] = null;
      });
      return emptyVotes;
    }
  }

  // Generate or get session ID for anonymous users
  getSessionId(): string {
    let sessionId = localStorage.getItem('servicenext_session_id');
    if (!sessionId) {
      sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('servicenext_session_id', sessionId);
    }
    return sessionId;
  }

  // Get anonymous user's votes from local storage
  getAnonymousVotes(): { [questionId: string]: 'up' | 'down' } {
    try {
      const stored = localStorage.getItem('servicenext_anonymous_votes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Store anonymous user's vote in local storage
  storeAnonymousVote(questionId: string, voteType: 'up' | 'down') {
    try {
      const votes = this.getAnonymousVotes();
      votes[questionId] = voteType;
      localStorage.setItem('servicenext_anonymous_votes', JSON.stringify(votes));
    } catch (error) {
      console.error('Error storing anonymous vote:', error);
    }
  }

  // Remove anonymous user's vote from local storage
  removeAnonymousVote(questionId: string) {
    try {
      const votes = this.getAnonymousVotes();
      delete votes[questionId];
      localStorage.setItem('servicenext_anonymous_votes', JSON.stringify(votes));
    } catch (error) {
      console.error('Error removing anonymous vote:', error);
    }
  }
}

export const votingService = new VotingService();