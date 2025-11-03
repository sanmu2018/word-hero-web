import axios from 'axios';
import { Word, ApiResponse, Stats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class VocabularyService {
  async getWords(pageNum: number = 1, pageSize: number = 12): Promise<ApiResponse<{ items: Word[], total: number }>> {
    try {
      const response = await api.get('/api/words', {
        params: {
          pageNum,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch words');
    }
  }

  async searchWords(query: string, pageNum: number = 1, pageSize: number = 12): Promise<ApiResponse<{ items: Word[], total: number }>> {
    try {
      const response = await api.get('/api/search', {
        params: {
          q: query,
          pageNum,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to search words');
    }
  }

  async getStats(): Promise<ApiResponse<Stats>> {
    try {
      const response = await api.get('/api/word-tags/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch stats');
    }
  }

  async markWord(wordId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/api/word-tags/mark', {
        wordId: wordId
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark word as known');
    }
  }

  async unmarkWord(wordId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete('/api/word-tags/unmark', {
        data: {
          wordId: wordId
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark word as unknown');
    }
  }

  async getKnownWords(): Promise<ApiResponse<{ words: Array<{ id: string }>, totalCount: number }>> {
    try {
      const response = await api.post('/api/word-tags/known');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get known words');
    }
  }

  async resetKnownWords(wordIds?: string[]): Promise<ApiResponse<void>> {
    try {
      let response;
      if (wordIds && wordIds.length > 0) {
        // Forget specific words
        response = await api.post('/api/word-tags/forget-words', {
          wordIds: wordIds
        });
      } else {
        // Forget all words
        response = await api.post('/api/word-tags/forget-all', {
          confirm: true
        });
      }
      return response.data;
    } catch (error) {
      throw new Error('Failed to reset known words');
    }
  }
}