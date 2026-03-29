// Movie Types
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  homepage: string;
  imdb_id: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
}

// News Types
export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Search Result Types
export interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet?: string;
  htmlTitle?: string;
  pagemap?: {
    cse_thumbnail?: { src: string; width: string; height: string }[];
    cse_image?: { src: string }[];
    metatags?: Record<string, string>[];
  };
}

// Tool Types
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

// Post Types
export interface PostData {
  id: string;
  title: string;
  content: string;
  image?: string;
  source: string;
  category: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Job Types
export interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedDate?: string;
  salary?: string;
}

// Automobile Types
export interface Automobile {
  title: string;
  brand: string;
  model: string;
  year?: string;
  price?: string;
  description: string;
  image?: string;
  url: string;
  specs?: Record<string, string>;
}

// Tech Product Types
export interface TechProduct {
  title: string;
  brand: string;
  category: string;
  description: string;
  image?: string;
  url: string;
  specs?: Record<string, string>;
  price?: string;
}

// Result Types
export interface ExamResult {
  title: string;
  examName: string;
  organization: string;
  resultDate?: string;
  description: string;
  url: string;
  status?: string;
}