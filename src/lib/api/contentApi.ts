import { api } from "./client";

export interface SiteContent {
  key: string;
  value: string;
  updated_at: string;
}

export interface ContentItem {
  key: string;
  value: string;
}

// Admin: list all content blocks.
export const listContent = () => api.get<SiteContent[]>("/content");

// Admin: bulk upsert; returns the full updated list.
export const saveContent = (items: ContentItem[]) => api.put<SiteContent[]>("/content", { items });
