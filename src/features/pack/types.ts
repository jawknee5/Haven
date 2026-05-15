export interface PackCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  position: number;
}

export interface PackArticle {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  contentHtml: string;
  offlineAvailable: boolean;
  position: number;
}
