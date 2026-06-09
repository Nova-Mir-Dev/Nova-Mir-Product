// Search utility — configure your search provider below

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  score: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string>;
}

export async function search(_options: SearchOptions): Promise<SearchResult[]> {
  // TODO: Implement with your search provider
  // For PostgreSQL: use tsvector + tsquery
  // For external: use Algolia, Meilisearch, or Typesense
  throw new Error("Search provider not configured. Implement search() with your chosen provider.");
}
