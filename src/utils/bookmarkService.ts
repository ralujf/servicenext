import { projectId, publicAnonKey } from './supabase/info';

export interface BookmarkedQuestion {
  id: string;
  userId: string;
  questionId: string;
  bookmarkedAt: string;
}

export class BookmarkService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
  }

  async getUserBookmarks(userId: string, accessToken?: string): Promise<string[]> {
    try {
      const headers: Record<string, string> = { ...this.headers } as Record<string, string>;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/bookmarks/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.bookmarks || [];
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }
  }

  async toggleBookmark(userId: string, questionId: string, accessToken?: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = { ...this.headers } as Record<string, string>;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/bookmarks/toggle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          questionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle bookmark: ${response.statusText}`);
      }

      const data = await response.json();
      return data.bookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  async addBookmark(userId: string, questionId: string, accessToken?: string): Promise<void> {
    try {
      const headers: Record<string, string> = { ...this.headers } as Record<string, string>;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/bookmarks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          questionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add bookmark: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(userId: string, questionId: string, accessToken?: string): Promise<void> {
    try {
      const headers: Record<string, string> = { ...this.headers } as Record<string, string>;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/bookmarks`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          userId,
          questionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove bookmark: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }
}

export const bookmarkService = new BookmarkService();