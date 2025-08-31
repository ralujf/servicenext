import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;

export interface UserProgress {
  userId: string;
  completedQuestions: string[];
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
}

export interface ProgressStats {
  totalQuestions: number;
  completedQuestions: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  currentStreak: number;
  longestStreak: number;
}

class ProgressService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      const progress = await this.makeRequest(`/progress/${userId}`);
      
      // Ensure the progress has the correct format
      return {
        userId: progress.userId || userId,
        completedQuestions: Array.isArray(progress.completedQuestions) ? progress.completedQuestions : [],
        easyCompleted: progress.easyCompleted || 0,
        mediumCompleted: progress.mediumCompleted || 0,
        hardCompleted: progress.hardCompleted || 0,
        currentStreak: progress.currentStreak || 0,
        longestStreak: progress.longestStreak || 0,
        lastCompletionDate: progress.lastCompletionDate || null,
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      
      // Return default progress if API fails
      return {
        userId,
        completedQuestions: [],
        easyCompleted: 0,
        mediumCompleted: 0,
        hardCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      };
    }
  }

  async completeQuestion(userId: string, questionId: string, difficulty: string): Promise<UserProgress> {
    try {
      const progress = await this.makeRequest(`/progress/${userId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ questionId, difficulty }),
      });
      
      // Ensure the progress has the correct format
      return {
        userId: progress.userId || userId,
        completedQuestions: Array.isArray(progress.completedQuestions) ? progress.completedQuestions : [],
        easyCompleted: progress.easyCompleted || 0,
        mediumCompleted: progress.mediumCompleted || 0,
        hardCompleted: progress.hardCompleted || 0,
        currentStreak: progress.currentStreak || 0,
        longestStreak: progress.longestStreak || 0,
        lastCompletionDate: progress.lastCompletionDate || null,
      };
    } catch (error) {
      console.error('Error completing question:', error);
      throw error;
    }
  }

  async resetProgress(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/progress/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }

  convertToProgressStats(
    userProgress: UserProgress,
    totalEasy: number,
    totalMedium: number,
    totalHard: number
  ): ProgressStats {
    return {
      totalQuestions: totalEasy + totalMedium + totalHard,
      completedQuestions: userProgress.completedQuestions.length,
      easyCompleted: userProgress.easyCompleted,
      mediumCompleted: userProgress.mediumCompleted,
      hardCompleted: userProgress.hardCompleted,
      totalEasy,
      totalMedium,
      totalHard,
      currentStreak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
    };
  }
}

export const progressService = new ProgressService();