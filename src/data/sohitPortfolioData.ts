/**
 * SOHIT AARYA - Official Portfolio Content Configuration
 * High-performance, verified personal profile, services, projects, WIP tracker, and roadmap.
 */

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  techStack: string[];
  isVerifiedOffering: boolean;
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  image: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'BETA_ACTIVE';
  liveUrl?: string;
  githubUrl?: string;
  toolSlug?: string;
  techStack: string[];
  features: string[];
  year: string;
}

export interface ProgressItem {
  id: string;
  title: string;
  category: string;
  progressPercent: number;
  status: 'Planning' | 'In Progress' | 'Testing' | 'Awaiting Review' | 'Completed' | 'Paused';
  completedFeatures: string[];
  inDevelopmentFeatures: string[];
  nextMilestone: string;
  lastUpdated: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  username: string;
  url: string;
  description: string;
  iconName: 'youtube' | 'instagram' | 'linkedin' | 'github' | 'telegram' | 'twitter' | 'messageCircle' | 'globe';
  badgeText: string;
}

export interface TimelineMilestone {
  year: string;
  quarter: string;
  title: string;
  tagline: string;
  description: string;
  keyAchievements: string[];
  type: 'MILESTONE' | 'PROJECT_LAUNCH' | 'ROADMAP';
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const SOHIT_AARYA_DATA = {
  name: 'SOHIT AARYA',
  title: 'Full-Stack Developer, Creative Technologist & Digital Founder',
  tagline: 'BUILDING DIGITAL EXPERIENCES. CREATING WHAT’S NEXT.',
  subheadline: 'I explore technology, build digital products, develop useful tools and turn ideas into working projects.',
  quote: '“Dream Big, Build Bigger.”',
  signatureText: 'Sohit Aarya',
  motto: 'Innovate • Create • Grow',
  photoUrl: '/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
  email: 'sohitaarya98@gmail.com',
  website: 'https://multipledarknews.com',
  location: 'India • Global Reach',

  roles: [
    { title: 'Web Developer', icon: 'code', description: 'Next-gen responsive web apps & tool architectures' },
    { title: 'AI & Tech Enthusiast', icon: 'cpu', description: 'In-browser neural processing, WebAssembly & client engines' },
    { title: 'Digital Creator', icon: 'rocket', description: 'Founder of MultipleDarkNews & 331 tools ecosystem' }
  ],

  stats: [
    { label: 'Online In-Browser Tools', value: '331+', suffix: '' },
    { label: 'Tool Categories', value: '12', suffix: '' },
    { label: 'Server Upload Required', value: '0%', suffix: '' },
    { label: 'Open Ecosystem Uptime', value: '100%', suffix: '' }
  ],

  // Section 01: About
  about: {
    sectionNumber: '01',
    heading: 'WHO IS SOHIT AARYA?',
    intro: 'Sohit Aarya is a passionate technology developer, digital product architect, and creator driven by a singular philosophy: build tools and software that empower people without subscriptions, paywalls, or compromises.',
    paragraphs: [
      'From architecting full-stack web applications to engineering client-side WebAssembly and Canvas algorithms, Sohit blends deep technical execution with bold aesthetic design. He created the MultipleDarkNews 331-tool ecosystem to prove that powerful digital utilities—from PDF manipulation and image compression to cryptographic hashing and code formatting—can run 100% client-side in the user’s browser with zero cloud file storage.',
      'Constantly exploring the frontier of technology, AI integration, and high-performance frontend engineering, Sohit focuses on building fast, secure, and privacy-first digital platforms that make everyday tasks effortless for students, developers, and creators worldwide.'
    ],
    pillars: [
      {
        title: 'Privacy-First Architecture',
        description: 'Files and data stay inside the client browser. Zero remote tracking, zero surveillance, and complete user data sovereignty.'
      },
      {
        title: 'Scalable Engineering',
        description: 'Architecting modular, TypeScript-powered web systems with hardware-accelerated WebAssembly and HTML5 Canvas engines.'
      },
      {
        title: 'Zero-Cost Accessibility',
        description: 'Empowering millions with unwatermarked, free-forever digital utilities that require neither signup nor paid API keys.'
      }
    ],
    skills: {
      frontend: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js', 'HTML5 Canvas 2D', 'Three.js / WebGL', 'Framer Motion'],
      backendAndTools: ['Node.js', 'Express', 'WebSockets', 'WebAssembly (WASM)', 'Web Workers', 'Web Speech API', 'Web Crypto API'],
      digitalAndSEO: ['Technical SEO', 'Schema.org JSON-LD', 'XML Sitemaps Protocol', 'Google Search Console', 'Cloud Architecture']
    }
  },

  // Section 02: What I Do (8 Service Cards)
  services: [
    {
      id: 'web-dev',
      number: '01',
      title: 'Website Development',
      category: 'Core Engineering',
      description: 'Crafting bespoke, lightning-fast responsive websites with cinematic dark typography, accessible structure, and pixel-perfect responsiveness across all screen sizes.',
      features: ['Modern React & TypeScript', 'Responsive mobile-first layouts', 'Zero layout shift (CLS 0)', 'Performance optimization'],
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      isVerifiedOffering: true
    },
    {
      id: 'web-apps',
      number: '02',
      title: 'Web Applications',
      category: 'Full-Stack Development',
      description: 'Building interactive Single Page Applications (SPAs) and Progressive Web Apps (PWAs) featuring client-authoritative state, offline storage, and responsive UX.',
      features: ['Complex state management', 'Service Worker offline caching', 'REST & WebSocket integration', 'Enterprise architecture'],
      techStack: ['React', 'TypeScript', 'Express', 'PWA'],
      isVerifiedOffering: true
    },
    {
      id: 'ai-tech',
      number: '03',
      title: 'AI Tools & Technology',
      category: 'Intelligent Systems',
      description: 'Developing privacy-focused, in-browser neural and algorithmic tools including local speech dictation, procedural synthesis, and heuristic text processing without API key billing.',
      features: ['Web Speech Recognition', 'Canvas Neural Filters', 'Zero API-key dependencies', 'Instant in-memory execution'],
      techStack: ['Web Speech API', 'Canvas 2D', 'SpeechSynthesis', 'WASM'],
      isVerifiedOffering: true
    },
    {
      id: 'automation',
      number: '04',
      title: 'Automation Systems',
      category: 'Systems & Tooling',
      description: 'Engineering automated workflows, job processors, batch transformation pipelines, and automated search engine sitemap ping dispatchers for rapid indexation.',
      features: ['Browser background queues', 'Automated Google/Bing pings', 'Multi-file batch converters', 'Local scheduler daemons'],
      techStack: ['Web Workers', 'Node.js', 'Job Processor', 'REST APIs'],
      isVerifiedOffering: true
    },
    {
      id: 'seo-publishing',
      number: '05',
      title: 'SEO & Digital Publishing',
      category: 'Growth & Visibility',
      description: 'Architecting programmatic SEO engines, dynamic Schema.org JSON-LD structured data, XML sitemaps containing 325+ indexed URLs, and SERP simulation tools.',
      features: ['Programmatic sitemap engines', 'Automated crawler notifications', 'OpenGraph & Twitter cards', 'SERP snippet optimizers'],
      techStack: ['SEO Protocols', 'JSON-LD', 'XML Sitemaps', 'Meta Engine'],
      isVerifiedOffering: true
    },
    {
      id: 'product-dev',
      number: '06',
      title: 'Digital Product Development',
      category: 'End-to-End Products',
      description: 'Transforming conceptual product briefs into fully operational web suites, complete with design systems, administration controls, and user onboarding flows.',
      features: ['Product architecture & MVP', 'Role-based access locks', 'Component design systems', 'Telemetry-free governance'],
      techStack: ['Product Strategy', 'UI/UX Design', 'Full-Stack Stack'],
      isVerifiedOffering: true
    },
    {
      id: 'software-projects',
      number: '07',
      title: 'Software Projects',
      category: 'Specialized Utilities',
      description: 'Building specialized algorithmic tools—from PDF encryption/decryption and splitters to barcode/QR generators and mathematical calculation engines.',
      features: ['PDF-Lib stream processing', 'Cryptographic hash suites', 'Audio waveform trimmers', 'Financial EMI engines'],
      techStack: ['PDF-Lib', 'Web Crypto', 'QR Engine', 'WASM'],
      isVerifiedOffering: true
    },
    {
      id: 'creative-tech',
      number: '08',
      title: 'Creative Technology',
      category: 'Interactive Media',
      description: 'Designing high-impact interactive visual experiences, WebGL Three.js 3D viewers, dynamic audio visualizers, and procedural canvas graphics.',
      features: ['Three.js 3D WebGL scenes', 'Real-time audio oscilloscopes', 'Procedural generative art', 'Micro-interaction physics'],
      techStack: ['Three.js', 'WebGL', 'Web Audio API', 'Canvas 2D'],
      isVerifiedOffering: true
    }
  ],

  // Section 04: My Projects
  projects: [
    {
      id: 'mdn-tools',
      number: '01',
      title: 'MultipleDarkNews Tools Platform',
      subtitle: '331 In-Browser Online Tools Ecosystem',
      description: 'A flagship, production-ready online tools platform featuring 331 specialized client-side utilities across 12 distinct categories. Everything processes in local browser memory with zero file uploads, zero watermarks, and ₹0 server maintenance cost.',
      category: 'Ecosystem & Web App',
      image: '/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
      status: 'COMPLETED',
      liveUrl: 'https://multipledarknews.com/#tool/pdf-compressor',
      toolSlug: 'pdf-compressor',
      year: '2025–2026',
      techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'PDF-Lib', 'Canvas 2D', 'Three.js', 'Web Speech API', 'Web Crypto'],
      features: [
        '331 verified production-ready tools (PDF, Image, Developer, Calculators, SEO, Video, Audio)',
        '100% Client-side sandbox with zero cloud file storage',
        'Automated Google & Bing Sitemaps API ping dispatcher',
        'Password-protected Admin Governance Dashboard with SHA-256 passkey',
        'Full technical SEO with Schema.org JSON-LD for every tool'
      ]
    },
    {
      id: 'mdn-portal',
      number: '02',
      title: 'MultipleDarkNews.com',
      subtitle: 'Digital Publishing & Technology Ecosystem',
      description: 'Sohit Aarya’s premier digital news, technology analysis, and media ecosystem serving thousands of international readers with in-depth tech insights, software breakdowns, and tools.',
      category: 'Digital Publishing & Media',
      image: '/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
      status: 'BETA_ACTIVE',
      liveUrl: 'https://multipledarknews.com',
      year: '2024–2026',
      techStack: ['WordPress', 'Nginx', 'Cloudflare', 'PHP', 'SEO Optimization'],
      features: [
        'High-speed content delivery network',
        'Comprehensive tech news coverage & tutorials',
        'Integrated tools suite connection',
        'International readership across US, UK, and India'
      ]
    },
    {
      id: 'aarya-ai',
      number: '03',
      title: 'Aarya AI Systems',
      subtitle: 'Browser-Native Intelligent Assistant & Speech Tools',
      description: 'A suite of client-side intelligent tools and conversational speech interfaces engineered to run without external API key quotas, featuring real-time mic transcription, voice synthesis, and local knowledge synthesis.',
      category: 'AI & Speech Engineering',
      image: '/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
      status: 'IN_PROGRESS',
      liveUrl: '#tool/live-voice-chat',
      toolSlug: 'live-voice-chat',
      year: '2025–2026',
      techStack: ['Web Speech API', 'SpeechSynthesis', 'HTML5 Audio', 'Canvas 2D Waveform'],
      features: [
        'Live voice assistant with real-time audio oscilloscope animation',
        'Multi-language transcription (English, Hindi, Spanish, French, German)',
        'Zero API key configuration required',
        'Export transcripts to TXT and clipboard'
      ]
    },
    {
      id: 'examforge-ai',
      number: '04',
      title: 'ExamForge AI',
      subtitle: 'Next-Generation Student Revision & Exam Preparation Engine',
      description: 'An upcoming automated study suite providing timetable generation, formula sheet creators, GPA calculation, exam countdowns, and topic flashcard builders tailored for competitive and academic examinations.',
      category: 'Education Technology',
      image: '/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
      status: 'IN_PROGRESS',
      liveUrl: '#tool/gpa-calculator',
      toolSlug: 'gpa-calculator',
      year: '2026',
      techStack: ['React', 'TypeScript', 'LocalStorage', 'PDF Export'],
      features: [
        'Multi-grading scale GPA & CGPA calculation engine',
        'Interactive exam countdown with urgency visualizer',
        'Printable revision schedule generator',
        'Zero registration required'
      ]
    },
    {
      id: 'flov-platform',
      number: '05',
      title: 'Flov Ecosystem',
      subtitle: 'Next-Gen Massive 2,500 Online Tools Platform (In Progress)',
      description: 'An ambitious, next-generation web ecosystem currently under active development by Sohit Aarya, designed to scale the tools architecture to over 2,500 specialized online utilities with advanced modular client processing.',
      category: 'Next-Gen Ecosystem (2,500 Tools)',
      image: '/assets/aistudio/file_000000004bac821190c12f577f201882_6ffa78a1.png',
      status: 'IN_PROGRESS',
      year: '2026',
      techStack: ['React 19', 'TypeScript', 'Modular Registry', 'WASM'],
      features: [
        'Massive scaling target: 2,500 specialized online tools',
        'Advanced modular category indexing and instant search',
        'Zero-latency client-side execution sandbox',
        'Unified developer plugin architecture'
      ]
    }
  ],

  // Section 05: Work In Progress (WIP Tracker)
  progressList: [
    {
      id: 'p1',
      title: '331 Tools Platform - Production Polish & Admin Security',
      category: 'Core Platform',
      progressPercent: 100,
      status: 'Completed',
      completedFeatures: [
        'Built all 331 tools with 100% in-browser execution',
        'Admin Dashboard SHA-256 passkey authorization & lockout gate',
        'Automated Google & Bing Sitemaps API ping dispatcher',
        'Zero API-key reliance for 100% free hosting'
      ],
      inDevelopmentFeatures: [
        'Subdomain DNS automated verification assistance'
      ],
      nextMilestone: 'Deploy to Cloud Run production subdomain',
      lastUpdated: 'November 2026'
    },
    {
      id: 'p2',
      title: 'Aarya AI Speech & Interactive Voice Assistant',
      category: 'AI Engine',
      progressPercent: 90,
      status: 'Testing',
      completedFeatures: [
        'Browser-native Web Speech API dictation',
        'Interactive real-time oscilloscope canvas animation',
        'Local conversational heuristics & speech synthesis'
      ],
      inDevelopmentFeatures: [
        'Offline speech-to-text model fallback via ONNX Runtime Web'
      ],
      nextMilestone: 'Add custom accent pitch modifier',
      lastUpdated: 'November 2026'
    },
    {
      id: 'p3',
      title: 'ExamForge AI - Exam Prep & Flashcards Workflow',
      category: 'Education Platform',
      progressPercent: 75,
      status: 'In Progress',
      completedFeatures: [
        'GPA & CGPA calculation algorithms',
        'Exam countdown timer with study reminders',
        'Study timetable template builder'
      ],
      inDevelopmentFeatures: [
        'Spaced-repetition flashcard generator with local storage persistence',
        'PDF formula cheat-sheet exporter'
      ],
      nextMilestone: 'Launch dedicated ExamForge study mode',
      lastUpdated: 'November 2026'
    },
    {
      id: 'p4',
      title: 'PWA Offline Mode & Native Desktop Installation',
      category: 'Progressive Web App',
      progressPercent: 60,
      status: 'In Progress',
      completedFeatures: [
        'Service Worker caching manifests',
        'Mobile web application manifest configuration'
      ],
      inDevelopmentFeatures: [
        'Offline background asset synchronization',
        'Native desktop shortcut installation banner'
      ],
      nextMilestone: '100% offline functionality across all PDF tools',
      lastUpdated: 'November 2026'
    },
    {
      id: 'p5',
      title: 'Flov Ecosystem - 2,500 Online Tools Platform',
      category: 'Next-Gen Platform',
      progressPercent: 45,
      status: 'In Progress',
      completedFeatures: [
        'Architecture blueprint for 2,500 specialized tools',
        'Modular client-side registry design',
        'High-performance WASM sandboxing model'
      ],
      inDevelopmentFeatures: [
        'Automated code generation pipelines for tool templates',
        'Bulk UI component optimization'
      ],
      nextMilestone: 'Release first batch of 500 core tools on Flov preview',
      lastUpdated: 'November 2026'
    }
  ] as ProgressItem[],

  // Section 06: Verified Social Media Accounts
  socialLinks: [
    {
      id: 'linkedin',
      platform: 'LinkedIn',
      username: 'Sohit Aarya',
      url: 'https://www.linkedin.com/in/sohit-aarya-81704a321?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      description: 'Professional updates, tech entrepreneurship, and industry networking.',
      iconName: 'linkedin',
      badgeText: 'Professional'
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      username: '@sohit__aarya',
      url: 'https://www.instagram.com/sohit__aarya?dlrf=NWZsYjNsZnZ3ZWdm',
      description: 'Behind the scenes, developer lifestyle, and tech project reels.',
      iconName: 'instagram',
      badgeText: 'Official Creator'
    },
    {
      id: 'youtube',
      platform: 'YouTube',
      username: '@thynkova',
      url: 'https://youtube.com/@thynkova?si=9diIjidVgHqqTixg',
      description: 'Tech tutorials, digital product development, and software tools showcases.',
      iconName: 'youtube',
      badgeText: 'Video Content'
    },
    {
      id: 'pinterest',
      platform: 'Pinterest',
      username: 'Sohit Aarya',
      url: 'https://pin.it/1yvzB0klX',
      description: 'Design inspirations, UI mockups, aesthetics, and digital moodboards.',
      iconName: 'pinterest',
      badgeText: 'Visual Pins'
    },
    {
      id: 'facebook',
      platform: 'Facebook',
      username: 'Sohit Aarya',
      url: 'https://www.facebook.com/share/1A1CNnw6VY/',
      description: 'Personal community, updates, and direct peer connections.',
      iconName: 'facebook',
      badgeText: 'Community'
    },
    {
      id: 'github',
      platform: 'GitHub',
      username: 'Sohitaarya',
      url: 'https://github.com/Sohitaarya',
      description: 'Open source tools, algorithms, repositories, and experimental code.',
      iconName: 'github',
      badgeText: 'Open Source'
    },
    {
      id: 'telegram',
      platform: 'Telegram',
      username: '@sohitaarya',
      url: 'https://t.me',
      description: 'Direct community broadcasts, tech news alerts, and tool updates.',
      iconName: 'telegram',
      badgeText: 'Channel'
    }
  ] as SocialLinkItem[],

  // Section 07: My Journey
  journey: [
    {
      year: '2023',
      quarter: 'Q2–Q4',
      title: 'The Foundation & Vision',
      tagline: 'Coding First Principles & Exploring Digital Publishing',
      description: 'Started deep exploration of modern web development, TypeScript systems, and digital journalism. Founded the concept of MultipleDarkNews as an independent digital news and tech platform.',
      keyAchievements: [
        'Mastered modern JavaScript/TypeScript, React architecture, and web systems',
        'Launched MultipleDarkNews digital platform foundation',
        'Began researching privacy-first client-side web tools'
      ],
      type: 'MILESTONE'
    },
    {
      year: '2024',
      quarter: 'Q1–Q4',
      title: 'MultipleDarkNews Expansion',
      tagline: 'Scaling Digital Publishing & Tool Architecture',
      description: 'Expanded the publishing platform and identified the severe flaw in existing online tool sites: heavy watermarks, intrusive ads, and file uploads to unknown servers. Conceived the idea of a 100% in-browser tools ecosystem.',
      keyAchievements: [
        'Scaled digital publishing reach across international audiences',
        'Built initial prototypes for client-side PDF and image manipulators',
        'Formulated the strict ₹0 hosting and zero-API-key architecture'
      ],
      type: 'MILESTONE'
    },
    {
      year: '2025',
      quarter: 'Q1–Q4',
      title: 'Architecting 331 Tools',
      tagline: 'Engineering the Massive Browser-Based Utility Suite',
      description: 'Authored and verified 331 online tools across 12 categories—PDF, Image, Video, Audio, Developer, Text, Calculators, Converters, SEO, Security, Social Media, and Education—all running in client memory.',
      keyAchievements: [
        'Achieved 100% PRODUCTION_READY status across 331 registered tools',
        'Engineered procedural Canvas art and Web Speech dictation engines',
        'Implemented automated Google and Bing Sitemaps API ping dispatcher'
      ],
      type: 'PROJECT_LAUNCH'
    },
    {
      year: '2026',
      quarter: 'Current & Future',
      title: 'Next-Gen Ecosystem & AI Frontiers',
      tagline: 'Unified Digital Identity, ExamForge AI, and Ecosystem Scaling',
      description: 'Launching Sohit Aarya’s premier cinematic digital portfolio, integrating ExamForge AI for students, and establishing full Subdomain/Cloud Run deployment for global scale.',
      keyAchievements: [
        'Built flagship cinematic black-and-red personal portfolio website',
        'Protected governance with SHA-256 administrative lock screen',
        'Expanding ExamForge AI student study suite and PWA offline mode'
      ],
      type: 'ROADMAP'
    }
  ] as TimelineMilestone[],

  // FAQ Section
  faqs: [
    {
      question: 'Who is Sohit Aarya?',
      answer: 'Sohit Aarya is a full-stack developer, digital creator, and founder of MultipleDarkNews. He specializes in high-performance web development, in-browser tool ecosystems, client-side algorithms, and digital publishing.'
    },
    {
      question: 'What is the 331 Tools Ecosystem?',
      answer: 'It is a comprehensive online tools suite comprising 331 utilities across 12 categories (PDF, Image, Developer, SEO, Video, Audio, Calculators, Converters, etc.). Crucially, all 331 tools execute 100% inside your browser using WebAssembly and HTML5 Canvas with zero file uploads and zero cost.'
    },
    {
      question: 'Why do all tools run in-browser without server upload?',
      answer: 'Privacy and speed. Your confidential documents, photos, and code never leave your device, eliminating data breach risks. Furthermore, processing in local browser memory avoids network latency and allows the platform to operate forever without expensive server bills.'
    },
    {
      question: 'What projects are currently in progress?',
      answer: 'Currently in active development: ExamForge AI (an automated revision and exam preparation suite), enhanced WebAssembly offline engines for video and audio processing, and progressive web app (PWA) desktop installation capabilities.'
    },
    {
      question: 'How can someone get in touch or collaborate with Sohit Aarya?',
      answer: 'You can connect directly via the Contact Section on this portfolio, send an email to sohitaarya98@gmail.com, or reach out across his verified social channels on LinkedIn, YouTube, Instagram, and GitHub.'
    }
  ] as FaqItem[]
};
