import { projectId, publicAnonKey } from './supabase/info';
import { Question } from '../data/questions';

export interface SearchResult {
  questionId: string;
  title: string;
  category: string;
  difficulty: string;
  similarity: number;
}

export interface SearchSuggestion {
  questionId: string;
  title: string;
  category: string;
  difficulty: string;
  similarity?: number;
  matchType: 'text' | 'vector';
}

class SearchService {
  private baseUrl: string;
  private headers: HeadersInit;
  private aiSearchSupported: boolean = false;
  private checkedSupport: boolean = false;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
  }

  // Check if AI search is supported by the server
  private async checkAISupport(): Promise<boolean> {
    if (this.checkedSupport) {
      return this.aiSearchSupported;
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.headers,
      });

      if (response.ok) {
        const healthData = await response.json();
        this.aiSearchSupported = healthData.features?.vectorSearch === true;
      }
    } catch (error) {
      console.warn('Could not check AI search support:', error);
      this.aiSearchSupported = false;
    }

    this.checkedSupport = true;
    return this.aiSearchSupported;
  }

  // Enhanced text-based search with better scoring
  private performTextSearch(questions: Question[], query: string, limit: number = 10): SearchResult[] {
    const searchTerm = query.toLowerCase().trim();
    const searchWords = searchTerm.split(' ').filter(w => w.length > 1);
    const results: SearchResult[] = [];

    for (const question of questions) {
      let score = 0;
      const titleLower = question.title.toLowerCase();
      const descLower = question.description.toLowerCase();
      const categoryLower = question.category.toLowerCase();

      // Exact phrase matches get highest priority
      if (titleLower.includes(searchTerm)) {
        score += titleLower === searchTerm ? 1.0 : 0.9;
      }
      if (descLower.includes(searchTerm)) {
        score += 0.7;
      }
      if (categoryLower.includes(searchTerm)) {
        score += 0.6;
      }

      // Individual word matches
      for (const word of searchWords) {
        if (titleLower.includes(word)) {
          score += 0.5;
        }
        if (descLower.includes(word)) {
          score += 0.3;
        }
        if (categoryLower.includes(word)) {
          score += 0.2;
        }
      }

      // Boost for difficulty level matches
      if (question.difficulty.toLowerCase().includes(searchTerm)) {
        score += 0.4;
      }

      // Boost for word proximity in title
      if (searchWords.length > 1) {
        const titleWords = titleLower.split(' ');
        let proximityBoost = 0;
        for (let i = 0; i < titleWords.length - 1; i++) {
          if (searchWords.includes(titleWords[i]) && searchWords.includes(titleWords[i + 1])) {
            proximityBoost += 0.3;
          }
        }
        score += proximityBoost;
      }

      if (score > 0) {
        results.push({
          questionId: question.id,
          title: question.title,
          category: question.category,
          difficulty: question.difficulty,
          similarity: Math.min(score, 1.0),
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Enhanced text-based suggestions
  private getTextSuggestions(questions: Question[], query: string, limit: number = 5): SearchSuggestion[] {
    const searchTerm = query.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];

    // Create a map to avoid duplicates and score matches
    const matches = new Map<string, { question: Question; score: number }>();

    for (const question of questions) {
      const titleLower = question.title.toLowerCase();
      const categoryLower = question.category.toLowerCase();
      const descLower = question.description.toLowerCase();
      let score = 0;

      if (titleLower.includes(searchTerm)) {
        score += titleLower.startsWith(searchTerm) ? 1.0 : 0.8;
      }
      if (categoryLower.includes(searchTerm)) {
        score += 0.6;
      }
      if (descLower.includes(searchTerm)) {
        score += 0.4;
      }

      if (score > 0) {
        matches.set(question.id, { question, score });
      }
    }

    // Convert to suggestions and sort by score
    const sortedMatches = Array.from(matches.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedMatches.map(({ question }) => ({
      questionId: question.id,
      title: question.title,
      category: question.category,
      difficulty: question.difficulty,
      matchType: 'text' as const,
    }));
  }

  async initializeEmbeddings(questions: Question[]): Promise<{ success: boolean; results?: any[]; error?: string }> {
    const aiSupported = await this.checkAISupport();
    
    if (!aiSupported) {
      return {
        success: false,
        error: 'AI search is not available in this deployment. Text-based search is fully functional.'
      };
    }

    // This shouldn't be reached in the current deployment, but keeping for completeness
    try {
      const response = await fetch(`${this.baseUrl}/initialize-embeddings`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ questions }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'AI search initialization failed. Using text-based search.'
      };
    }
  }

  async searchQuestions(
    query: string, 
    questions: Question[], 
    limit: number = 10, 
    threshold: number = 0.7
  ): Promise<SearchResult[]> {
    // Always use text-based search since AI search is not supported
    return this.performTextSearch(questions, query, limit);
  }

  async getSearchSuggestions(
    query: string, 
    questions: Question[], 
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Always use text-based suggestions since AI search is not supported
    return this.getTextSuggestions(questions, query, limit);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.headers,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async isAISearchAvailable(): Promise<boolean> {
    return await this.checkAISupport();
  }

  isEmbeddingsAvailable(): boolean {
    return false; // Always false in this deployment
  }
}

export const searchService = new SearchService();