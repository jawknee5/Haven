import { create } from 'zustand';
import { PackCategory, PackArticle } from '../types';
import { packApi } from '../api/packApi';

interface PackState {
  categories: PackCategory[];
  articlesByCategory: Record<string, PackArticle[]>;
  articleById: Record<string, PackArticle>;
  loading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
  loadArticles: (categoryId: string) => Promise<void>;
  loadArticle: (id: string) => Promise<PackArticle>;
}

export const usePackStore = create<PackState>((set, get) => ({
  categories: [],
  articlesByCategory: {},
  articleById: {},
  loading: false,
  error: null,

  async loadCategories() {
    set({ loading: true, error: null });
    try {
      const categories = await packApi.categories();
      set({ categories, loading: false });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load categories', loading: false });
    }
  },

  async loadArticles(categoryId) {
    set({ loading: true, error: null });
    try {
      const articles = await packApi.articles(categoryId);
      set({
        articlesByCategory: { ...get().articlesByCategory, [categoryId]: articles },
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load articles', loading: false });
    }
  },

  async loadArticle(id) {
    const existing = get().articleById[id];
    if (existing) return existing;
    const article = await packApi.article(id);
    set({ articleById: { ...get().articleById, [id]: article } });
    return article;
  },
}));
