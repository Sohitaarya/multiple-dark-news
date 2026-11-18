import React, { createContext, useContext } from 'react';

export type SupportedLangCode =
  | 'en'
  | 'hi'
  | 'es'
  | 'fr'
  | 'de'
  | 'ar'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'zh'
  | 'id'
  | 'bn';

export interface LanguageOption {
  code: SupportedLangCode;
  label: string;
  nativeName: string;
  ogLocale: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', ogLocale: 'en_US' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', ogLocale: 'hi_IN' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', ogLocale: 'es_ES' },
  { code: 'fr', label: 'French', nativeName: 'Français', ogLocale: 'fr_FR' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', ogLocale: 'de_DE' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', ogLocale: 'ar_AE', rtl: true },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', ogLocale: 'pt_BR' },
  { code: 'ru', label: 'Russian', nativeName: 'Русский', ogLocale: 'ru_RU' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', ogLocale: 'ja_JP' },
  { code: 'zh', label: 'Chinese', nativeName: '中文', ogLocale: 'zh_CN' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', ogLocale: 'id_ID' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', ogLocale: 'bn_BD' },
];

export interface UiDictionary {
  brandSubtitle: string;
  searchPlaceholder: string;
  categories: string;
  pdfTools: string;
  imageTools: string;
  audit: string;
  addToWebsite: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  exploreTools: string;
  founderBadge: string;
  founderSubtitle: string;
  founderCta: string;
  allCategoriesHeading: string;
  popularToolsHeading: string;
  privacyTitle: string;
  privacyDesc: string;
  freeTitle: string;
  freeDesc: string;
  fastTitle: string;
  fastDesc: string;
  popularCategories: string;
  moreCategories: string;
  platformLegal: string;
  notFoundBadge: string;
  notFoundTitle: string;
  notFoundBackHome: string;
  dropzonePrompt: string;
  executeBtn: string;
  downloadOutput: string;
  resetTool: string;
  homeLabel: string;
}

const EN_DICT: UiDictionary = {
  brandSubtitle: '331 FREE PRIVACY-FIRST TOOLS',
  searchPlaceholder: 'Search 331 tools...',
  categories: 'Categories',
  pdfTools: 'PDF Tools',
  imageTools: 'Image Tools',
  audit: 'Audit',
  addToWebsite: 'Add to Website',
  heroBadge: 'MULTIPLEDARKNEWS ECOSYSTEM • 331 IN-BROWSER TOOLS',
  heroTitle: '331 FREE & PRIVATE ONLINE TOOLS SUITE',
  heroSubtitle:
    'Compress PDFs, resize images, format JSON, test SEO, and convert units directly in your browser. Zero cloud upload. 100% private and free forever.',
  exploreTools: 'Explore',
  founderBadge: 'OFFICIAL FOUNDER & CREATOR',
  founderSubtitle: 'Explore the official 3D profile website, 331 tools ecosystem, and tech creations.',
  founderCta: 'Sohit Aarya',
  allCategoriesHeading: '12 Specialized Categories',
  popularToolsHeading: 'Most Popular Global Tools',
  privacyTitle: '100% Client-Side Privacy',
  privacyDesc: 'Files process locally. Zero server upload.',
  freeTitle: '₹0 Cost & No Watermarks',
  freeDesc: 'Always free forever. No sign-up required.',
  fastTitle: 'Ultra Fast Processing',
  fastDesc: 'Hardware accelerated browser engines.',
  popularCategories: 'Popular Categories',
  moreCategories: 'More Categories',
  platformLegal: 'Platform & Legal',
  notFoundBadge: '404 Page Not Found',
  notFoundTitle: 'Tool or Route Not Found',
  notFoundBackHome: 'Go to 331 Tools Suite',
  dropzonePrompt: 'Drop your file(s) here, or browse computer',
  executeBtn: 'Execute & Generate',
  downloadOutput: 'Download Output',
  resetTool: 'Reset Tool',
  homeLabel: 'Home',
};

const TRANSLATIONS: Record<SupportedLangCode, UiDictionary> = {
  en: EN_DICT,
  hi: {
    brandSubtitle: '331 मुफ़्त प्राइवेसी-फर्स्ट टूल्स',
    searchPlaceholder: '331 टूल्स खोजें...',
    categories: 'श्रेणियाँ',
    pdfTools: 'PDF टूल्स',
    imageTools: 'इमेज टूल्स',
    audit: 'ऑडिट',
    addToWebsite: 'वेबसाइट में जोड़ें',
    heroBadge: 'MULTIPLEDARKNEWS इकोसिस्टम • 331 ब्राउज़र टूल्स',
    heroTitle: '331 मुफ़्त और सुरक्षित ऑनलाइन टूल्स सूट',
    heroSubtitle:
      'PDF कंप्रेस करें, इमेज रीसाइज करें, JSON फॉर्मेट करें, SEO जांचें और यूनिट कन्वर्ट करें सीधे अपने ब्राउज़र में। बिना किसी क्लाउड अपलोड के।',
    exploreTools: 'खोजें',
    founderBadge: 'आधिकारिक संस्थापक और निर्माता',
    founderSubtitle: 'Sohit Aarya की आधिकारिक 3D प्रोफाइल, 331 टूल्स इकोसिस्टम और तकनीकी प्रोजेक्ट्स देखें।',
    founderCta: 'Sohit Aarya',
    allCategoriesHeading: '12 विशेष श्रेणियाँ',
    popularToolsHeading: 'सबसे लोकप्रिय टूल्स',
    privacyTitle: '100% ब्राउज़र प्राइवेसी',
    privacyDesc: 'फ़ाइलें आपके डिवाइस पर प्रोसेस होती हैं।',
    freeTitle: '₹0 शुल्क और बिना वॉटरमार्क',
    freeDesc: 'हमेशा मुफ़्त। साइन-अप की आवश्यकता नहीं।',
    fastTitle: 'अत्यंत तेज़ प्रोसेसिंग',
    fastDesc: 'हाई-स्पीड ब्राउज़र इंजन द्वारा संचालित।',
    popularCategories: 'लोकप्रिय श्रेणियाँ',
    moreCategories: 'अन्य श्रेणियाँ',
    platformLegal: 'प्लेटफ़ॉर्म और नियम',
    notFoundBadge: '404 पेज नहीं मिला',
    notFoundTitle: 'टूल या पेज उपलब्ध नहीं है',
    notFoundBackHome: '331 टूल्स पर वापस जाएं',
    dropzonePrompt: 'अपनी फ़ाइल यहाँ ड्रॉप करें या कंप्यूटर से चुनें',
    executeBtn: 'चलाएं और जनरेट करें',
    downloadOutput: 'आउटपुट डाउनलोड करें',
    resetTool: 'रीसेट करें',
    homeLabel: 'होम',
  },
  es: {
    ...EN_DICT,
    brandSubtitle: '331 HERRAMIENTAS GRATIS Y PRIVADAS',
    searchPlaceholder: 'Buscar entre 331 herramientas...',
    categories: 'Categorías',
    pdfTools: 'Herramientas PDF',
    imageTools: 'Imágenes',
    audit: 'Auditoría',
    addToWebsite: 'Añadir a tu Web',
    heroTitle: 'SUITE DE 331 HERRAMIENTAS ONLINE GRATIS',
    heroSubtitle:
      'Comprime PDF, redimensiona imágenes, formatea JSON, analiza SEO y convierte unidades directo en tu navegador. 100% privado.',
    exploreTools: 'Explorar',
    allCategoriesHeading: '12 Categorías Especializadas',
    popularToolsHeading: 'Herramientas Populares',
    privacyTitle: '100% Privacidad Local',
    privacyDesc: 'Procesamiento local sin subir archivos.',
    freeTitle: 'Gratis y Sin Marcas de Agua',
    freeDesc: 'Siempre gratis. Sin registro obligatorio.',
    fastTitle: 'Procesamiento Ultra Rápido',
    notFoundBadge: '404 Página No Encontrada',
    notFoundTitle: 'Herramienta o Ruta No Encontrada',
    notFoundBackHome: 'Ir a las 331 Herramientas',
    dropzonePrompt: 'Arrastra tus archivos aquí o selecciónalos',
    executeBtn: 'Ejecutar y Generar',
    downloadOutput: 'Descargar Resultado',
    resetTool: 'Reiniciar',
    homeLabel: 'Inicio',
  },
  fr: {
    ...EN_DICT,
    brandSubtitle: '331 OUTILS GRATUITS ET PRIVÉS',
    searchPlaceholder: 'Rechercher parmi 331 outils...',
    categories: 'Catégories',
    pdfTools: 'Outils PDF',
    imageTools: 'Outils Image',
    audit: 'Audit',
    addToWebsite: 'Intégrer au Site',
    heroTitle: 'SUITE DE 331 OUTILS EN LIGNE GRATUITS',
    heroSubtitle:
      'Compressez des PDF, redimensionnez des images, formatez du JSON et analysez le SEO directement dans votre navigateur.',
    exploreTools: 'Explorer',
    allCategoriesHeading: '12 Catégories Spécialisées',
    popularToolsHeading: 'Outils Populaires',
    privacyTitle: 'Confidentialité 100% Locale',
    freeTitle: 'Gratuit & Sans Filigrane',
    fastTitle: 'Traitement Ultra Rapide',
    notFoundBadge: '404 Page Introuvable',
    notFoundTitle: 'Outil ou Page Introuvable',
    notFoundBackHome: 'Retour aux 331 Outils',
    executeBtn: 'Exécuter et Générer',
    downloadOutput: 'Télécharger',
    resetTool: 'Réinitialiser',
    homeLabel: 'Accueil',
  },
  de: {
    ...EN_DICT,
    brandSubtitle: '331 KOSTENLOSE DATENSCHUTZ-TOOLS',
    searchPlaceholder: '331 Tools durchsuchen...',
    categories: 'Kategorien',
    pdfTools: 'PDF-Tools',
    imageTools: 'Bild-Tools',
    audit: 'Prüfbericht',
    addToWebsite: 'Auf Website einbetten',
    heroTitle: '331 KOSTENLOSE & PRIVATE ONLINE-TOOLS',
    heroSubtitle:
      'PDFs komprimieren, Bilder skalieren, JSON formatieren und SEO direkt im Browser prüfen – ohne Cloud-Upload.',
    exploreTools: 'Starten',
    allCategoriesHeading: '12 Spezialisierte Kategorien',
    popularToolsHeading: 'Beliebte Online-Tools',
    privacyTitle: '100% Lokaler Datenschutz',
    freeTitle: 'Kostenlos & Ohne Wasserzeichen',
    fastTitle: 'Ultraschnelle Verarbeitung',
    notFoundBadge: '404 Seite nicht gefunden',
    notFoundTitle: 'Tool oder Route nicht gefunden',
    notFoundBackHome: 'Zu den 331 Tools',
    executeBtn: 'Ausführen & Erzeugen',
    downloadOutput: 'Ergebnis Herunterladen',
    resetTool: 'Zurücksetzen',
    homeLabel: 'Startseite',
  },
  ar: {
    ...EN_DICT,
    brandSubtitle: '331 أداة مجانية تحفظ خصوصيتك',
    searchPlaceholder: 'ابحث في 331 أداة...',
    categories: 'التصنيفات',
    pdfTools: 'أدوات PDF',
    imageTools: 'أدوات الصور',
    audit: 'التدقيق',
    addToWebsite: 'أضف لموقعك',
    heroTitle: 'مجموعة 331 أداة مجانية وخاصة عبر الإنترنت',
    heroSubtitle:
      'ضغط ملفات PDF وتعديل الصور وتنسيق JSON وفحص السيو مباشرة في متصفحك بدون رفع أي ملفات للخادم.',
    exploreTools: 'استكشف',
    allCategoriesHeading: '12 تصنيفاً متخصصاً',
    popularToolsHeading: 'الأدوات الأكثر استخداماً',
    privacyTitle: 'خصوصية 100% داخل المتصفح',
    freeTitle: 'مجاني بالكامل وبدون علامة مائية',
    fastTitle: 'معالجة فائقة السرعة',
    notFoundBadge: '404 الصفحة غير موجودة',
    notFoundTitle: 'الأداة أو الصفحة غير موجودة',
    notFoundBackHome: 'العودة إلى 331 أداة',
    executeBtn: 'تنفيذ وإنشاء',
    downloadOutput: 'تحميل النتيجة',
    resetTool: 'إعادة ضبط',
    homeLabel: 'الرئيسية',
  },
  pt: {
    ...EN_DICT,
    brandSubtitle: '331 FERRAMENTAS GRÁTIS E PRIVADAS',
    searchPlaceholder: 'Pesquisar 331 ferramentas...',
    categories: 'Categorias',
    pdfTools: 'Ferramentas PDF',
    imageTools: 'Imagens',
    audit: 'Auditoria',
    addToWebsite: 'Adicionar ao Site',
    heroTitle: 'PACOTE COM 331 FERRAMENTAS ONLINE GRÁTIS',
    heroSubtitle:
      'Comprima PDFs, redimensione imagens, formate JSON e analise SEO diretamente no seu navegador. Sem upload na nuvem.',
    exploreTools: 'Explorar',
    notFoundBadge: '404 Página Não Encontrada',
    notFoundTitle: 'Ferramenta Não Encontrada',
    executeBtn: 'Executar e Gerar',
    downloadOutput: 'Baixar Resultado',
    resetTool: 'Reiniciar',
    homeLabel: 'Início',
  },
  ru: {
    ...EN_DICT,
    brandSubtitle: '331 БЕСПЛАТНЫЙ ИНСТРУМЕНТ',
    searchPlaceholder: 'Поиск среди 331 инструмента...',
    categories: 'Категории',
    pdfTools: 'PDF Инструменты',
    imageTools: 'Изображения',
    audit: 'Аудит',
    addToWebsite: 'Встроить на сайт',
    heroTitle: '331 БЕСПЛАТНЫЙ И ПРИВАТНЫЙ ОНЛАЙН-ИНСТРУМЕНТ',
    heroSubtitle:
      'Сжимайте PDF, изменяйте размер изображений, форматируйте JSON и проверяйте SEO прямо в браузере без загрузки на сервер.',
    exploreTools: 'Открыть',
    notFoundBadge: '404 Страница не найдена',
    notFoundTitle: 'Инструмент не найден',
    executeBtn: 'Выполнить',
    downloadOutput: 'Скачать',
    resetTool: 'Сбросить',
    homeLabel: 'Главная',
  },
  ja: {
    ...EN_DICT,
    brandSubtitle: '331の無料・完全プライバシー重視ツール',
    searchPlaceholder: '331個のツールを検索...',
    categories: 'カテゴリー',
    pdfTools: 'PDFツール',
    imageTools: '画像ツール',
    audit: '監査レポート',
    addToWebsite: 'サイトに追加',
    heroTitle: '331種類の無料オンラインツールスイート',
    heroSubtitle:
      'PDF圧縮、画像リサイズ、JSON整形、SEO診断をブラウザ内で直接処理。サーバーへのアップロード不要で完全無料。',
    exploreTools: '検索',
    notFoundBadge: '404 ページが見つかりません',
    notFoundTitle: 'ツールが見つかりません',
    executeBtn: '実行・生成',
    downloadOutput: 'ダウンロード',
    resetTool: 'リセット',
    homeLabel: 'ホーム',
  },
  zh: {
    ...EN_DICT,
    brandSubtitle: '331 款免费隐私优先在线工具',
    searchPlaceholder: '搜索 331 款工具...',
    categories: '工具分类',
    pdfTools: 'PDF 工具',
    imageTools: '图像工具',
    audit: '技术审计',
    addToWebsite: '嵌入网站',
    heroTitle: '331 款免费且隐私安全的在线工具套件',
    heroSubtitle: '直接在浏览器中压缩 PDF、调整图片大小、格式化 JSON、检测 SEO 与转换单位。零云端上传，永久免费。',
    exploreTools: '探索',
    notFoundBadge: '404 页面未找到',
    notFoundTitle: '未找到该工具或路由',
    executeBtn: '执行并生成',
    downloadOutput: '下载结果',
    resetTool: '重置工具',
    homeLabel: '首页',
  },
  id: {
    ...EN_DICT,
    brandSubtitle: '331 ALAT ONLINE GRATIS & PRIVAT',
    searchPlaceholder: 'Cari 331 alat...',
    categories: 'Kategori',
    pdfTools: 'Alat PDF',
    imageTools: 'Alat Gambar',
    audit: 'Audit',
    addToWebsite: 'Pasang di Situs',
    heroTitle: '331 ALAT ONLINE GRATIS & PRIVASI TERJAGA',
    heroSubtitle:
      'Kompres PDF, ubah ukuran gambar, format JSON, cek SEO, dan konversi satuan langsung di browser tanpa unggah ke server.',
    exploreTools: 'Jelajahi',
    notFoundBadge: '404 Halaman Tidak Ditemukan',
    notFoundTitle: 'Alat Tidak Ditemukan',
    executeBtn: 'Jalankan & Hasilkan',
    downloadOutput: 'Unduh Hasil',
    resetTool: 'Reset Alat',
    homeLabel: 'Beranda',
  },
  bn: {
    ...EN_DICT,
    brandSubtitle: '৩৩১টি ফ্রি ও প্রাইভেট অনলাইন টুলস',
    searchPlaceholder: '৩৩১টি টুল খুঁজুন...',
    categories: 'বিভাগসমূহ',
    pdfTools: 'PDF টুলস',
    imageTools: 'ইমেজ টুলস',
    audit: 'অডিট',
    addToWebsite: 'ওয়েবসাইটে যুক্ত করুন',
    heroTitle: '৩৩১টি ফ্রি এবং নিরাপদ অনলাইন টুলস',
    heroSubtitle:
      'সরাসরি ব্রাউজারেই PDF কমপ্রেস, ছবি রিসাইজ, JSON ফরম্যাট এবং SEO বিশ্লেষণ করুন। কোনো ফাইল সার্ভারে আপলোড হয় না।',
    exploreTools: 'খুঁজুন',
    notFoundBadge: '৪০৪ পেজ পাওয়া যায়নি',
    notFoundTitle: 'টুল বা পেজ পাওয়া যায়নি',
    executeBtn: 'চালান এবং তৈরি করুন',
    downloadOutput: 'ডাউনলোড করুন',
    resetTool: 'রিসেট করুন',
    homeLabel: 'হোম',
  },
};

export function normalizeLangCode(raw?: string | null): SupportedLangCode {
  if (!raw) return 'en';
  const base = raw.toLowerCase().trim().split(/[-_]/)[0];
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === base);
  return match ? match.code : 'en';
}

export function detectPreferredLanguage(
  search = typeof window !== 'undefined' ? window.location.search : '',
  navigatorLangs: readonly string[] = typeof navigator !== 'undefined'
    ? navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || 'en']
    : ['en']
): SupportedLangCode {
  try {
    if (search) {
      const sp = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
      const qLang = sp.get('lang') || sp.get('hl');
      if (qLang) {
        const normalized = normalizeLangCode(qLang);
        if (typeof localStorage !== 'undefined') localStorage.setItem('mdn_preferred_lang', normalized);
        return normalized;
      }
    }
  } catch {
    // ignore URL errors
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mdn_preferred_lang');
      if (saved) return normalizeLangCode(saved);
    }
  } catch {
    // ignore storage errors
  }

  for (const tag of navigatorLangs) {
    const code = normalizeLangCode(tag);
    if (code !== 'en' || tag.toLowerCase().startsWith('en')) {
      return code;
    }
  }
  return 'en';
}

export function getTranslations(lang: SupportedLangCode): UiDictionary {
  return TRANSLATIONS[lang] || EN_DICT;
}

export interface I18nContextValue {
  lang: SupportedLangCode;
  setLang: (code: SupportedLangCode) => void;
  t: UiDictionary;
  langMeta: LanguageOption;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: EN_DICT,
  langMeta: SUPPORTED_LANGUAGES[0],
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
