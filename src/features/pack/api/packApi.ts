import { PackCategory, PackArticle } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const packApi = {
  categories: (): Promise<PackCategory[]> =>
    fetch(`${API_BASE}/pack/categories`, { credentials: 'include' }).then((r) => r.json()),

  articles: (categoryId: string): Promise<PackArticle[]> =>
    fetch(`${API_BASE}/pack/articles?category=${encodeURIComponent(categoryId)}`, {
      credentials: 'include',
    }).then((r) => r.json()),

  article: (id: string): Promise<PackArticle> =>
    fetch(`${API_BASE}/pack/articles/${id}`, { credentials: 'include' }).then((r) => r.json()),
};
