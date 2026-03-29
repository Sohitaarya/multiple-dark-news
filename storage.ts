// Local storage utility for saving posts
export interface SavedPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: string;
  source: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = "multiple_dark_news_posts";

export function savePost(post: Omit<SavedPost, "id" | "createdAt">): SavedPost {
  const posts = getPosts();
  const newPost: SavedPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  posts.unshift(newPost); // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return newPost;
}

export function getPosts(): SavedPost[] {
  if (typeof window === "undefined") return [];
  const posts = localStorage.getItem(STORAGE_KEY);
  return posts ? JSON.parse(posts) : [];
}

export function getPostsByCategory(category: string): SavedPost[] {
  return getPosts().filter((post) => post.category === category);
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((post) => post.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function clearAllPosts(): void {
  localStorage.removeItem(STORAGE_KEY);
}