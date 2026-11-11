export type ToolCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'text'
  | 'developer'
  | 'calculator'
  | 'unit-converter'
  | 'seo'
  | 'security'
  | 'education'
  | 'social-media';

export type ToolStatus =
  | 'PLANNED'
  | 'IN_DEVELOPMENT'
  | 'FUNCTIONAL'
  | 'TESTING'
  | 'VERIFIED'
  | 'PRODUCTION_READY'
  | 'BLOCKED'
  | 'DEPRECATED';

export type ProcessingLocation = 'browser' | 'server' | 'hybrid';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  longDescription?: string;
  inputFormats: string[];
  outputFormats: string[];
  processingEngine: string;
  processingLocation: ProcessingLocation;
  maxFileSizeMB: number;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  faq: ToolFAQ[];
  relatedToolSlugs: string[];
  status: ToolStatus;
  version: string;
  testCoverage: number; // percentage 0 - 100
  isPopular?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export type JobStatus =
  | 'QUEUED'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface ProcessingJob {
  id: string;
  toolId: string;
  status: JobStatus;
  progress: number; // 0 - 100
  statusMessage: string;
  startTime: number;
  endTime?: number;
  inputFileName?: string;
  inputFileSize?: number;
  outputFileName?: string;
  outputFileSize?: number;
  outputUrl?: string;
  outputBlob?: Blob;
  error?: string;
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  slug: string;
  shortDescription: string;
  iconName: string;
  badgeColor: string;
  toolCount: number;
}
