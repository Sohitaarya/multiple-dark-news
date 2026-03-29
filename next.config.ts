import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_CX: process.env.GOOGLE_CX,
    TECHSPECS_API_ID: process.env.TECHSPECS_API_ID,
    TECHSPECS_API_KEY: process.env.TECHSPECS_API_KEY,
    ADZUNA_API_KEY: process.env.ADZUNA_API_KEY,
    ADZUNA_APP_ID: process.env.ADZUNA_APP_ID,
  },
};

export default nextConfig;
