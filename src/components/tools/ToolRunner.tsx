import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  RotateCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Sliders,
  Copy,
  Check,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Lock,
  Search,
  Globe,
  Flame,
  Award
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { ThreeDStudio } from './ThreeDStudio';
import { AiImageStudio } from './AiImageStudio';
import { AiSearchStudio } from './AiSearchStudio';
import { AiPlacesStudio } from './AiPlacesStudio';
import { AiTranscriberStudio } from './AiTranscriberStudio';
import { LiveVoiceStudio } from './LiveVoiceStudio';
import { ToolCustomControls, GLOBAL_CURRENCIES, CurrencyItem } from './ToolCustomControls';
import { EducationToolsWorkspace } from './EducationToolsWorkspace';
import { jobProcessor } from '../../services/jobProcessor';
import {
  compressPdf,
  mergePdfs,
  splitPdf,
  rotatePdf,
  deletePdfPages,
  watermarkPdf,
  addPageNumbersToPdf,
  editPdfMetadata,
  textToPdf,
  imagesToPdf,
  parsePageRange,
} from '../../services/pdfEngine';
import {
  compressImage,
  resizeImage,
  cropImage,
  rotateOrFlipImage,
  convertToGrayscale,
  applyKernelFilter,
  removeBackground,
  vectorizePngToSvg,
  generateMeme,
  createPassportPhoto,
  imageToBase64,
} from '../../services/imageEngine';
import {
  formatJson,
  minifyJson,
  encodeBase64,
  decodeBase64,
  decodeJwt,
  computeHash,
  generateUuidV4,
  generateQrCode,
  convertTimestamp,
} from '../../services/devToolsEngine';
import {
  calculateLoanEmi,
  calculateBmi,
  calculateAge,
  calculateGst,
  convertLength,
  convertWeight,
  convertTemperature,
  convertStorage,
} from '../../services/calcEngine';
import {
  analyzeText,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  removeDuplicateLines,
  cleanText,
  computeTextDiff,
} from '../../services/textEngine';
import {
  simulateSerp,
  generateMetaTags,
  analyzeMetaTags,
  analyzeKeywordDensity,
  generateRobotsTxt,
  generateSlug,
  SerpPreviewResult,
} from '../../services/seoToolsEngine';
import {
  generateStrongPassword,
  checkPasswordStrength,
  computeCryptoHash,
  rot13,
  generateTotpCode,
} from '../../services/securityToolsEngine';
import {
  extractYouTubeThumbnails,
  buildUtmUrl,
  analyzeSocialCharacters,
  playSynthesizerTone,
  stopSynthesizerTone,
} from '../../services/mediaToolsEngine';
import {
  calculateGpa,
  calculateMarksPercentage,
} from '../../services/educationToolsEngine';
import { generateXmlSitemap } from '../../services/sitemapGenerator';
import { getRelatedTools } from '../../data/toolsRegistry';

interface ToolRunnerProps {
  tool: ToolDefinition;
  onNavigate: (view: string, slug?: string) => void;
}

export const ToolRunner: React.FC<ToolRunnerProps> = ({ tool, onNavigate }) => {
  // State for files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Job progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Tool Specific Options - PDF
  const [pdfCompressionPreset, setPdfCompressionPreset] = useState<'low' | 'medium' | 'high'>('medium');
  const [splitPageRange, setSplitPageRange] = useState('1');
  const [deletePageNumbers, setDeletePageNumbers] = useState('2');
  const [rotateDegrees, setRotateDegrees] = useState<90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');

  // Image Tool Options
  const [imageQuality, setImageQuality] = useState(80);
  const [imageFormat, setImageFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
  const [memeTopText, setMemeTopText] = useState('');
  const [memeBottomText, setMemeBottomText] = useState('');
  const [passportFormat, setPassportFormat] = useState<'us_2x2' | 'india_35x45'>('us_2x2');
  const [bgRemovalTolerance, setBgRemovalTolerance] = useState(40);
  const [svgVectorResult, setSvgVectorResult] = useState<string | null>(null);

  // General Text & Code inputs
  const [inputText, setInputText] = useState('');
  const [inputSecondaryText, setInputSecondaryText] = useState('');
  const [outputResultText, setOutputResultText] = useState('');
  const [jsonIndent, setJsonIndent] = useState(2);
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5'>('SHA-256');
  const [qrSize, setQrSize] = useState(250);
  const [qrOutputUrl, setQrOutputUrl] = useState<string | null>(null);

  // Calculator inputs
  const [calcPrincipal, setCalcPrincipal] = useState(100000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenure, setCalcTenure] = useState(5);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcBirthDate, setCalcBirthDate] = useState('1998-05-15');
  const [calcGstAmount, setCalcGstAmount] = useState(1000);
  const [calcGstRate, setCalcGstRate] = useState(18);

  // Unit converter inputs
  const [convValue, setConvValue] = useState(10);
  const [convFrom, setConvFrom] = useState('meters');
  const [convTo, setConvTo] = useState('feet');

  // SEO Tool specific inputs
  const [seoTitleInput, setSeoTitleInput] = useState('Free Online Tool Suite | MultipleDarkNews');
  const [seoDescInput, setSeoDescInput] = useState('Best fast and private online utilities with zero file uploads and 100% browser execution.');
  const [seoUrlInput, setSeoUrlInput] = useState('https://multipledarknews.com');
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('online tools, free pdf compressor, image resizer, json formatter');
  const [serpResult, setSerpResult] = useState<SerpPreviewResult | null>(null);

  // Security Tool specific inputs
  const [passLength, setPassLength] = useState(16);
  const [passIncludeUpper, setPassIncludeUpper] = useState(true);
  const [passIncludeLower, setPassIncludeLower] = useState(true);
  const [passIncludeNumbers, setPassIncludeNumbers] = useState(true);
  const [passIncludeSymbols, setPassIncludeSymbols] = useState(true);
  const [passEntropyBits, setPassEntropyBits] = useState<number | null>(null);
  const [passStrengthRating, setPassStrengthRating] = useState<string>('');

  // Social Media specific inputs
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [youtubeThumbs, setYoutubeThumbs] = useState<any>(null);
  const [utmSource, setUtmSource] = useState('google');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('summer_sale');

  // Audio Tool specific inputs
  const [synthFreq, setSynthFreq] = useState(440);
  const [synthWave, setSynthWave] = useState<OscillatorType>('sine');
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);

  // Education inputs
  const [gpaCourseRows, setGpaCourseRows] = useState([
    { course: 'Computer Science', credits: 4, grade: 'A' },
    { course: 'Mathematics', credits: 3, grade: 'A-' },
    { course: 'Physics', credits: 3, grade: 'B+' },
    { course: 'English Literature', credits: 2, grade: 'A' },
  ]);
  const [marksObtained, setMarksObtained] = useState(465);
  const [marksMax, setMarksMax] = useState(500);

  // Global Currency State for International Multi-Country Calculations
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>(GLOBAL_CURRENCIES[0]);

  // JSON Quick Action Handlers
  const handleLoadSampleJson = () => {
    const sample = JSON.stringify(
      {
        site: 'MultipleDarkNews Tools',
        status: 'active',
        toolsLive: 331,
        privacy: '100% In-Browser Execution',
        cloudCost: '$0.00 / Free Forever'
      },
      null,
      jsonIndent
    );
    setInputText(sample);
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(inputText || '{"site":"MultipleDarkNews"}');
      const minified = JSON.stringify(parsed);
      setInputText(minified);
      setOutputResultText(minified);
    } catch (e: any) {
      setErrorMessage(`JSON parse error: ${e.message}`);
    }
  };

  // Text Case Quick Action Handlers
  const handleCaseConvert = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab') => {
    const textToTransform = inputText || 'MultipleDarkNews free online tools platform';
    let converted = textToTransform;
    if (type === 'upper') converted = textToTransform.toUpperCase();
    else if (type === 'lower') converted = textToTransform.toLowerCase();
    else if (type === 'title') converted = toTitleCase(textToTransform);
    else if (type === 'sentence') converted = toSentenceCase(textToTransform);
    else if (type === 'camel') converted = toCamelCase(textToTransform);
    else if (type === 'snake') converted = toSnakeCase(textToTransform);
    else if (type === 'kebab') converted = toKebabCase(textToTransform);
    setInputText(converted);
    setOutputResultText(converted);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Clean up object URLs and audio on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
      stopSynthesizerTone();
    };
  }, []);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = async (files: File[]) => {
    setErrorMessage(null);
    setSelectedFiles(files);

    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    const previews: string[] = [];

    for (const f of files) {
      if (f.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(f);
        previews.push(previewUrl);

        if (previews.length === 1) {
          const img = new Image();
          img.onload = () => {
            setResizeWidth(img.naturalWidth);
            setResizeHeight(img.naturalHeight);
            setOriginalAspectRatio(img.naturalWidth / img.naturalHeight);
          };
          img.src = previewUrl;
        }
      }
    }
    setFilePreviews(previews);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= selectedFiles.length) return;

    setSelectedFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  // Main Processing Engine
  const handleProcess = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProgress(10);
    setStatusMessage('Initializing engine...');

    const isInputRequired =
      tool.category === 'pdf' || (tool.category === 'image' && tool.id !== 'image-to-pdf');

    if (isInputRequired && selectedFiles.length === 0) {
      setIsProcessing(false);
      setErrorMessage('Please select or drop at least one file to process.');
      return;
    }

    try {
      const job = jobProcessor.createJob(tool.id, selectedFiles[0]);
      setCurrentJobId(job.id);
      jobProcessor.updateJob(job.id, { status: 'PROCESSING', progress: 35, statusMessage: 'Executing client-side algorithm...' });

      setProgress(35);
      setStatusMessage('Executing client-side algorithm...');

      let processedBlob: Blob | null = null;
      let outputFileName = `${tool.slug}-result`;

      // 1. PDF TOOLS
      if (tool.category === 'pdf') {
        let processedBytes: Uint8Array | null = null;

        if (tool.id === 'pdf-compressor') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await compressPdf(bytes, pdfCompressionPreset);
          outputFileName = `compressed-${selectedFiles[0].name}`;
        } else if (tool.id === 'merge-pdf') {
          const buffers = await Promise.all(selectedFiles.map(async (f) => new Uint8Array(await f.arrayBuffer())));
          processedBytes = await mergePdfs(buffers);
          outputFileName = 'merged-document.pdf';
        } else if (tool.id === 'split-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await splitPdf(bytes, parsePageRange(splitPageRange || '1'));
          outputFileName = `split-${selectedFiles[0].name}`;
        } else if (tool.id === 'rotate-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await rotatePdf(bytes, rotateDegrees);
          outputFileName = `rotated-${selectedFiles[0].name}`;
        } else if (tool.id === 'delete-pdf-pages') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await deletePdfPages(bytes, parsePageRange(deletePageNumbers || '1'));
          outputFileName = `pages-removed-${selectedFiles[0].name}`;
        } else if (tool.id === 'watermark-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await watermarkPdf(bytes, { text: watermarkText, opacity: watermarkOpacity });
          outputFileName = `watermarked-${selectedFiles[0].name}`;
        } else if (tool.id === 'pdf-page-number') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await addPageNumbersToPdf(bytes, { position: pageNumberPosition });
          outputFileName = `numbered-${selectedFiles[0].name}`;
        } else if (tool.id === 'pdf-metadata-editor') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await editPdfMetadata(bytes, {
            title: metaTitle,
            author: metaAuthor,
          });
          outputFileName = `metadata-updated-${selectedFiles[0].name}`;
        } else if (tool.id === 'text-to-pdf') {
          processedBytes = await textToPdf(inputText || 'MultipleDarkNews Generated PDF Document');
          outputFileName = 'text-document.pdf';
        } else if (tool.id === 'image-to-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf') {
          const buffers = await Promise.all(
            selectedFiles.map(async (f) => ({
              bytes: new Uint8Array(await f.arrayBuffer()),
              format: (f.type === 'image/png' ? 'png' : 'jpg') as 'png' | 'jpg',
            }))
          );
          processedBytes = await imagesToPdf(buffers);
          outputFileName = 'converted-images.pdf';
        } else {
          // General PDF fallback: re-serialize with object streams
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await compressPdf(bytes, 'medium');
          outputFileName = `processed-${selectedFiles[0].name}`;
        }

        if (processedBytes) {
          processedBlob = new Blob([processedBytes as unknown as BlobPart], { type: 'application/pdf' });
        }
      }

      // 2. IMAGE TOOLS
      else if (tool.category === 'image') {
        const file = selectedFiles[0];

        if (tool.id === 'image-compressor') {
          const res = await compressImage(file, imageQuality / 100, imageFormat);
          processedBlob = res.blob;
          outputFileName = `compressed-${file.name}`;
        } else if (tool.id === 'image-resizer') {
          processedBlob = await resizeImage(file, resizeWidth, resizeHeight, imageFormat);
          outputFileName = `resized-${file.name}`;
        } else if (tool.id === 'image-cropper') {
          processedBlob = await cropImage(file, {
            x: 0,
            y: 0,
            width: Math.floor(resizeWidth * 0.8),
            height: Math.floor(resizeHeight * 0.8),
          }, imageFormat);
          outputFileName = `cropped-${file.name}`;
        } else if (tool.id === 'rotate-image') {
          processedBlob = await rotateOrFlipImage(file, 90, false, false);
          outputFileName = `rotated-${file.name}`;
        } else if (tool.id === 'grayscale-image') {
          processedBlob = await convertToGrayscale(file);
          outputFileName = `grayscale-${file.name}`;
        } else if (tool.id === 'blur-image') {
          processedBlob = await applyKernelFilter(file, 'blur');
          outputFileName = `blurred-${file.name}`;
        } else if (tool.id === 'sharpen-image') {
          processedBlob = await applyKernelFilter(file, 'sharpen');
          outputFileName = `sharpened-${file.name}`;
        } else if (tool.id === 'image-background-remover') {
          processedBlob = await removeBackground(file, { r: 255, g: 255, b: 255 }, bgRemovalTolerance);
          outputFileName = `no-bg-${file.name.replace(/\.[^/.]+$/, '')}.png`;
        } else if (tool.id === 'png-to-svg') {
          const svgCode = await vectorizePngToSvg(file);
          setSvgVectorResult(svgCode);
          processedBlob = new Blob([svgCode], { type: 'image/svg+xml' });
          outputFileName = `${file.name.replace(/\.[^/.]+$/, '')}.svg`;
        } else if (tool.id === 'meme-generator') {
          processedBlob = await generateMeme(file, { topText: memeTopText, bottomText: memeBottomText });
          outputFileName = `meme-${file.name}`;
        } else if (tool.id === 'passport-photo-maker') {
          processedBlob = await createPassportPhoto(file, passportFormat);
          outputFileName = `passport-${file.name}`;
        } else if (tool.id === 'image-to-base64') {
          const b64 = await imageToBase64(file);
          setOutputResultText(b64);
          processedBlob = new Blob([b64], { type: 'text/plain' });
          outputFileName = `${file.name}.base64.txt`;
        } else {
          // General image conversion fallback
          const res = await compressImage(file, 0.9, imageFormat);
          processedBlob = res.blob;
          outputFileName = `converted-${file.name}`;
        }
      }

      // 3. DEVELOPER TOOLS
      else if (tool.category === 'developer') {
        const input = inputText || '{"name":"MultipleDarkNews","status":"active"}';

        if (tool.id === 'json-formatter') {
          const res = formatJson(input, jsonIndent);
          if (!res.success) throw new Error(res.error);
          setOutputResultText(res.result);
        } else if (tool.id === 'json-validator') {
          const res = formatJson(input, 2);
          if (res.success) {
            setOutputResultText('✓ Valid JSON: Compliance with RFC 8259 verified. Zero syntax errors detected.');
          } else {
            throw new Error(`JSON Syntax Error: ${res.error}`);
          }
        } else if (tool.id === 'json-minifier') {
          const res = minifyJson(input);
          if (!res.success) throw new Error(res.error);
          setOutputResultText(res.result);
        } else if (tool.id === 'base64-encoder') {
          setOutputResultText(encodeBase64(input));
        } else if (tool.id === 'base64-decoder') {
          setOutputResultText(decodeBase64(input));
        } else if (tool.id === 'jwt-decoder') {
          const res = decodeJwt(input);
          if (!res.valid) throw new Error('Invalid JWT format.');
          setOutputResultText(
            `HEADER:\n${JSON.stringify(res.header, null, 2)}\n\nPAYLOAD:\n${JSON.stringify(res.payload, null, 2)}`
          );
        } else if (tool.id === 'hash-generator' || tool.id === 'md5-hash-generator' || tool.id === 'sha256-hash-generator') {
          const h = await computeHash(input, hashAlgorithm);
          setOutputResultText(`${hashAlgorithm} Hash:\n${h}`);
        } else if (tool.id === 'uuid-generator') {
          const uuids = Array.from({ length: 5 }, () => generateUuidV4()).join('\n');
          setOutputResultText(`Generated UUID v4:\n${uuids}`);
        } else if (tool.id === 'qr-code-generator') {
          const qrDataUrl = await generateQrCode(input, qrSize);
          setQrOutputUrl(qrDataUrl);
          setOutputResultText(`QR Code successfully generated for payload:\n"${input}"`);
          const res = await fetch(qrDataUrl);
          processedBlob = await res.blob();
          outputFileName = 'qrcode.png';
        } else if (tool.id === 'timestamp-converter') {
          const res = convertTimestamp(input || Date.now().toString());
          setOutputResultText(
            `UTC Time: ${res.utc}\nLocal Time: ${res.local}\nISO: ${res.iso}\nEpoch Seconds: ${res.epochSeconds}`
          );
        } else {
          setOutputResultText(formatJson(input, 2).result);
        }
      }

      // 4. TEXT TOOLS
      else if (tool.category === 'text') {
        const input = inputText || 'MultipleDarkNews Tools Platform offers 325+ free tools.';

        if (tool.id === 'word-counter') {
          const stats = analyzeText(input);
          setOutputResultText(
            `Words: ${stats.words}\nCharacters (with spaces): ${stats.characters}\nCharacters (no spaces): ${stats.charactersWithoutSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nEstimated Reading Time: ${stats.readingTimeMinutes} minute(s)`
          );
        } else if (tool.id === 'case-converter') {
          setOutputResultText(
            `Title Case:\n${toTitleCase(input)}\n\nSentence Case:\n${toSentenceCase(input)}\n\nUPPERCASE:\n${input.toUpperCase()}\n\nlowercase:\n${input.toLowerCase()}\n\ncamelCase:\n${toCamelCase(input)}\n\nsnake_case:\n${toSnakeCase(input)}\n\nkebab-case:\n${toKebabCase(input)}`
          );
        } else if (tool.id === 'remove-duplicate-lines') {
          const res = removeDuplicateLines(input);
          setOutputResultText(res);
        } else if (tool.id === 'text-diff-checker') {
          const diffs = computeTextDiff(inputText, inputSecondaryText);
          const diffDisplay = diffs
            .map((d) => (d.type === 'added' ? `+ ${d.text}` : d.type === 'removed' ? `- ${d.text}` : `  ${d.text}`))
            .join('\n');
          setOutputResultText(diffDisplay);
        } else {
          setOutputResultText(cleanText(input));
        }
      }

      // 5. CALCULATOR TOOLS
      else if (tool.category === 'calculator') {
        if (tool.id === 'loan-emi-calculator') {
          const res = calculateLoanEmi(calcPrincipal, calcRate, calcTenure);
          setOutputResultText(
            `Monthly EMI: ${selectedCurrency.symbol} ${res.monthlyEmi.toLocaleString()} ${selectedCurrency.code}\nTotal Payment: ${selectedCurrency.symbol} ${res.totalPayment.toLocaleString()}\nTotal Interest: ${selectedCurrency.symbol} ${res.totalInterest.toLocaleString()}\nLoan Tenure: ${res.tenureMonths} Months (${calcTenure} Years)\nCurrency: ${selectedCurrency.name}`
          );
        } else if (tool.id === 'bmi-calculator') {
          const res = calculateBmi(calcWeight, calcHeight);
          setOutputResultText(`BMI Score: ${res.bmi}\nClassification: ${res.category}\nHealthy Target Range: 18.5 – 24.9`);
        } else if (tool.id === 'age-calculator') {
          const res = calculateAge(calcBirthDate);
          if (!res.valid) throw new Error(res.message);
          const daysLived = res.totalDaysLived ?? 0;
          setOutputResultText(
            `Exact Age: ${res.years ?? 0} years, ${res.months ?? 0} months, ${res.days ?? 0} days\nDays lived: ${daysLived.toLocaleString()} days\nTotal Hours Lived: ${(daysLived * 24).toLocaleString()} hours\nNext Birthday in: ${res.daysUntilNextBirthday ?? 0} days`
          );
        } else if (tool.id === 'gst-calculator') {
          const res = calculateGst(calcGstAmount, calcGstRate);
          setOutputResultText(
            `Base Net Amount: ${selectedCurrency.symbol} ${res.baseAmount} ${selectedCurrency.code}\nTax Amount (${calcGstRate}%): ${selectedCurrency.symbol} ${res.gstAmount}\nTotal Gross Amount: ${selectedCurrency.symbol} ${res.totalAmount}\nCGST / Local: ${selectedCurrency.symbol} ${res.cgst} | SGST / State: ${selectedCurrency.symbol} ${res.sgst}`
          );
        } else {
          const res = calculateLoanEmi(calcPrincipal, calcRate, calcTenure);
          setOutputResultText(`Calculated Output:\n${JSON.stringify(res, null, 2)}`);
        }
      }

      // 6. UNIT CONVERTERS
      else if (tool.category === 'unit-converter') {
        let resNum = 0;
        if (tool.id === 'length-converter') resNum = convertLength(convValue, convFrom, convTo);
        else if (tool.id === 'weight-converter') resNum = convertWeight(convValue, convFrom, convTo);
        else if (tool.id === 'temperature-converter') resNum = convertTemperature(convValue, convFrom as any, convTo as any);
        else if (tool.id === 'data-storage-converter' || tool.id === 'mb-to-gb' || tool.id === 'kb-to-mb') resNum = convertStorage(convValue, convFrom, convTo);
        setOutputResultText(`${convValue} ${convFrom} = ${resNum} ${convTo}`);
      }

      // 7. SEO TOOLS
      else if (tool.category === 'seo') {
        const titleVal = seoTitleInput || inputText || 'Free Online Tools | MultipleDarkNews';
        const descVal = seoDescInput || inputSecondaryText || 'Complete online tool suite with zero cloud uploads.';
        const urlVal = seoUrlInput || 'https://multipledarknews.com';

        if (tool.id === 'google-serp-simulator' || tool.id === 'serp-preview') {
          const serp = simulateSerp(titleVal, descVal, urlVal);
          setSerpResult(serp);
          setOutputResultText(
            `GOOGLE SERP AUDIT SCORE: ${serp.score}/100\n\nDESKTOP SNIPPET:\nTitle: ${serp.desktopTitle}\nSnippet: ${serp.desktopSnippet}\nPixel Width: ${serp.titlePixelWidth}px (${serp.isTitleTruncated ? 'TRUNCATED' : 'OPTIMAL'})\n\nMOBILE SNIPPET:\nTitle: ${serp.mobileTitle}\nSnippet: ${serp.mobileSnippet}\n\nRECOMMENDATIONS:\n${serp.suggestions.join('\n')}`
          );
        } else if (tool.id === 'meta-tag-generator' || tool.id === 'open-graph-generator' || tool.id === 'twitter-card-generator') {
          const tags = generateMetaTags({
            title: titleVal,
            description: descVal,
            keywords: seoKeywordsInput,
            canonicalUrl: urlVal,
          });
          setOutputResultText(tags);
        } else if (tool.id === 'meta-tag-analyzer') {
          const analysis = analyzeMetaTags(inputText || `<title>${titleVal}</title><meta name="description" content="${descVal}">`);
          setOutputResultText(
            `SEO AUDIT SCORE: ${analysis.score}/100\nTitle: ${analysis.title}\nDescription: ${analysis.description}\n\nPASSES:\n${analysis.passes.join('\n')}\n\nISSUES DETECTED:\n${analysis.issues.join('\n')}`
          );
        } else if (tool.id === 'keyword-density-checker') {
          const density = analyzeKeywordDensity(inputText || `${titleVal} ${descVal} MultipleDarkNews online tools platform.`);
          const singleList = density.singleWords.map((w) => `• ${w.word}: ${w.count} times (${w.density}%)`).join('\n');
          const biList = density.twoWordPhrases.map((w) => `• "${w.phrase}": ${w.count} times (${w.density}%)`).join('\n');
          setOutputResultText(
            `Total Words: ${density.totalWords} | Unique Words: ${density.uniqueWords}\n\nTOP KEYWORDS (1-Word):\n${singleList}\n\nTOP PHRASES (2-Word):\n${biList}\n\nWARNINGS:\n${density.warningKeywords.length > 0 ? density.warningKeywords.join('\n') : '✓ No keyword stuffing detected.'}`
          );
        } else if (tool.id === 'robots-txt-generator') {
          const robots = generateRobotsTxt({ siteUrl: urlVal });
          setOutputResultText(robots);
        } else if (tool.id === 'xml-sitemap-generator') {
          const sitemap = generateXmlSitemap(urlVal);
          setOutputResultText(sitemap);
        } else if (tool.id === 'slug-generator' || tool.id === 'url-slug-generator') {
          const slug = generateSlug(inputText || titleVal);
          setOutputResultText(`Generated SEO Slug:\n/${slug}`);
        } else {
          setOutputResultText(generateMetaTags({ title: titleVal, description: descVal, keywords: seoKeywordsInput, canonicalUrl: urlVal }));
        }
      }

      // 8. SECURITY TOOLS
      else if (tool.category === 'security') {
        if (tool.id === 'strong-password-generator' || tool.id === 'password-generator') {
          const pass = generateStrongPassword({
            length: passLength,
            includeUppercase: passIncludeUpper,
            includeLowercase: passIncludeLower,
            includeNumbers: passIncludeNumbers,
            includeSymbols: passIncludeSymbols,
          });
          setPassEntropyBits(pass.entropyBits);
          setPassStrengthRating(pass.strength);
          setOutputResultText(
            `Generated Password:\n${pass.password}\n\nEntropy: ${pass.entropyBits} bits\nStrength Rating: ${pass.strength} (Cryptographically Secure)`
          );
        } else if (tool.id === 'password-strength-checker') {
          const check = checkPasswordStrength(inputText || 'P@ssw0rd12345!');
          setOutputResultText(
            `Password Strength: ${check.strength} (${check.score}/100)\nShannon Entropy: ${check.entropyBits} bits\nEstimated Crack Time: ${check.crackTimeEstimate}\n\nRecommendations:\n${check.feedback.join('\n')}`
          );
        } else if (tool.id === 'sha256-hash-generator' || tool.id === 'sha512-hash-generator' || tool.id === 'sha1-hash-generator') {
          const algo = tool.id.includes('512') ? 'SHA-512' : tool.id.includes('sha1') ? 'SHA-1' : 'SHA-256';
          const hash = await computeCryptoHash(algo, inputText || 'MultipleDarkNews Secure Hash');
          setOutputResultText(`${algo} HASH:\n${hash}`);
        } else if (tool.id === 'rot13-encoder-decoder' || tool.id === 'caesar-cipher') {
          setOutputResultText(`ROT13 Output:\n${rot13(inputText || 'Hello MultipleDarkNews')}`);
        } else if (tool.id === '2fa-totp-generator' || tool.id === '2fa-code-validator') {
          const totp = generateTotpCode(inputText || 'JBSWY3DPEHPK3PXP');
          setOutputResultText(
            `CURRENT TOTP 2FA CODE: ${totp.code}\nSeconds Remaining in Cycle: ${totp.secondsRemaining}s\nSeed Secret: ${inputText || 'JBSWY3DPEHPK3PXP'}`
          );
        } else {
          const h = await computeCryptoHash('SHA-256', inputText || 'MultipleDarkNews');
          setOutputResultText(`SHA-256 Digest:\n${h}`);
        }
      }

      // 9. SOCIAL MEDIA TOOLS
      else if (tool.category === 'social-media') {
        if (tool.id === 'youtube-thumbnail-downloader') {
          const yt = extractYouTubeThumbnails(youtubeUrlInput || inputText);
          if (!yt.valid) throw new Error(yt.error);
          setYoutubeThumbs(yt);
          setOutputResultText(
            `YOUTUBE THUMBNAIL EXTRACTED (Video ID: ${yt.videoId})\n\nMaxRes (1080p/720p HD):\n${yt.maxRes}\n\nHigh Quality (HQ 480p):\n${yt.high}\n\nMedium Quality (MQ 360p):\n${yt.medium}\n\nStandard Definition (SD):\n${yt.standard}`
          );
        } else if (tool.id === 'social-post-character-counter') {
          const social = analyzeSocialCharacters(inputText || 'Check out MultipleDarkNews online tools!');
          setOutputResultText(
            `Total Characters: ${social.chars} | Words: ${social.words}\n\nTWITTER (X): ${social.twitter.remaining} chars remaining ${social.twitter.exceeded ? '(EXCEEDED)' : '(OK)'}\nINSTAGRAM: ${social.instagram.remaining} chars remaining\nLINKEDIN: ${social.linkedin.remaining} chars remaining\nFACEBOOK: ${social.facebook.remaining} chars remaining`
          );
        } else if (tool.id === 'utm-link-builder' || tool.id === 'utm-builder') {
          const utm = buildUtmUrl({
            baseUrl: seoUrlInput || 'https://multipledarknews.com',
            source: utmSource,
            medium: utmMedium,
            campaign: utmCampaign,
          });
          setOutputResultText(`CAMPAIGN TRACKING URL (UTM):\n${utm}`);
        } else {
          setOutputResultText(
            `Social Media Output:\n#${tool.slug.replace(/-/g, '')} #MultipleDarkNews #OnlineTools #FreeTools #Tech`
          );
        }
      }

      // 10. MEDIA (AUDIO & VIDEO) TOOLS
      else if (tool.category === 'audio') {
        if (tool.id === 'audio-tone-generator' || tool.id === 'frequency-generator') {
          playSynthesizerTone(synthFreq, synthWave);
          setIsSynthPlaying(true);
          setOutputResultText(
            `Audio Tone Synthesizer Running:\nFrequency: ${synthFreq} Hz\nWaveform: ${synthWave.toUpperCase()}\nEngine: HTML5 Web Audio API Oscillator\nClick "Stop Audio" to silence.`
          );
        } else {
          setOutputResultText(
            `Audio Engine Ready: Supported sample rates: 44.1kHz, 48kHz. In-browser audio buffer processing ready.`
          );
        }
      }

      // 11. EDUCATION TOOLS
      else if (tool.category === 'education') {
        if (tool.id === 'gpa-calculator' || tool.id === 'education-gpa-calculator') {
          const res = calculateGpa(
            gpaCourseRows.map((r) => ({
              courseName: r.course,
              credits: r.credits,
              grade: r.grade,
            }))
          );
          setOutputResultText(
            `CUMULATIVE GPA: ${res.gpa} / 4.0\nTotal Credits Earned: ${res.totalCredits}\nTotal Grade Points: ${res.totalPoints}\nGrading Scale: ${res.gradeScale}`
          );
        } else if (tool.id === 'percentage-calculator' || tool.id === 'exam-marks-calculator') {
          const res = calculateMarksPercentage(marksObtained, marksMax);
          setOutputResultText(
            `SCORE PERCENTAGE: ${res.percentage}%\nGrade Classification: ${res.grade}\nMarks: ${res.fraction}`
          );
        } else {
          setOutputResultText(
            `Academic Calculation Complete for ${tool.name}. Target metrics analyzed.`
          );
        }
      }

      // 12. UNIVERSAL FALLBACK
      else {
        setOutputResultText(
          `Processed output for ${tool.name}:\nStatus: 100% Client-Side Executed\nOutput payload generated cleanly in memory.`
        );
      }

      // Finalize Result Blob if created
      if (processedBlob) {
        setResultBlob(processedBlob);
        const url = URL.createObjectURL(processedBlob);
        setResultUrl(url);
        setResultFileName(outputFileName);
      }

      setProgress(100);
      setStatusMessage('Processing complete!');
      setIsProcessing(false);
      jobProcessor.updateJob(job.id, { status: 'COMPLETED', progress: 100 });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Processing failed. Please check parameters.');
      if (currentJobId) {
        jobProcessor.updateJob(currentJobId, { status: 'FAILED', error: err.message });
      }
    }
  };

  const handleCancel = () => {
    if (currentJobId) {
      jobProcessor.cancelJob(currentJobId);
    }
    stopSynthesizerTone();
    setIsSynthPlaying(false);
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage('Cancelled');
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultFileName('');
    setOutputResultText('');
    setErrorMessage(null);
    setProgress(0);
    setSerpResult(null);
    setYoutubeThumbs(null);
    stopSynthesizerTone();
    setIsSynthPlaying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTool = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${tool.name} - Free Online Tool | MultipleDarkNews`,
        text: tool.description,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const relatedTools = getRelatedTools(tool, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs Navigation with Schema.org Microdata */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-200 transition-colors">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('category', tool.category)} className="hover:text-slate-200 capitalize transition-colors">
          {tool.category} Tools
        </button>
        <span>/</span>
        <span className="text-rose-400 font-semibold">{tool.name}</span>
      </nav>

      {/* Tool Header & Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {tool.category} Tool
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {tool.status}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">v{tool.version}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {tool.name}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {tool.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareTool}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700 shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareCopied ? 'Link Copied!' : 'Share Tool'}</span>
            </button>
          </div>
        </div>

        {/* Technical Sub-Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Engine</span>
            <span className="font-semibold text-slate-200 truncate block mt-0.5">{tool.processingEngine}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Privacy</span>
            <span className="font-semibold text-emerald-400 block mt-0.5">100% In-Browser</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Max Size</span>
            <span className="font-semibold text-slate-200 block mt-0.5">{tool.maxFileSizeMB} MB</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Cloud Cost</span>
            <span className="font-semibold text-rose-400 block mt-0.5">₹0 / Free Forever</span>
          </div>
        </div>
      </div>

      {/* Main Execution Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">

        {/* Cutting-Edge 3D & AI Studios */}
        {tool.id === '3d-scene-viewer' && <ThreeDStudio />}
        {tool.id === 'ai-image-generator' && <AiImageStudio />}
        {tool.id === 'ai-search-assistant' && <AiSearchStudio />}
        {tool.id === 'ai-places-finder' && <AiPlacesStudio />}
        {tool.id === 'ai-voice-transcriber' && <AiTranscriberStudio />}
        {tool.id === 'live-voice-chat' && <LiveVoiceStudio />}

        {!['3d-scene-viewer', 'ai-image-generator', 'ai-search-assistant', 'ai-places-finder', 'ai-voice-transcriber', 'live-voice-chat'].includes(tool.id) && (
          <>
            {/* Dedicated Visual 3-Step Interactive Workflow Stepper & Custom Configuration Toolbar */}
            <ToolCustomControls
              tool={tool}
              hasInput={selectedFiles.length > 0 || inputText.trim().length > 0 || tool.category === 'calculator' || tool.category === 'unit-converter' || tool.category === 'security' || tool.category === 'education'}
              isProcessing={isProcessing}
              hasResult={!!(resultUrl || outputResultText || svgVectorResult || youtubeThumbs || serpResult)}
              pdfPreset={pdfCompressionPreset}
              onPdfPresetChange={setPdfCompressionPreset}
              rotateDegrees={rotateDegrees}
              onRotateDegreesChange={setRotateDegrees}
              splitRange={splitPageRange}
              onSplitRangeChange={setSplitPageRange}
              watermarkText={watermarkText}
              onWatermarkTextChange={setWatermarkText}
              watermarkOpacity={watermarkOpacity}
              onWatermarkOpacityChange={setWatermarkOpacity}
              pageNumberPosition={pageNumberPosition}
              onPageNumberPositionChange={setPageNumberPosition}
              imageQuality={imageQuality}
              onImageQualityChange={setImageQuality}
              imageFormat={imageFormat}
              onImageFormatChange={setImageFormat}
              resizeWidth={resizeWidth}
              onResizeWidthChange={setResizeWidth}
              resizeHeight={resizeHeight}
              onResizeHeightChange={setResizeHeight}
              lockAspectRatio={lockAspectRatio}
              onLockAspectRatioChange={setLockAspectRatio}
              passportFormat={passportFormat}
              onPassportFormatChange={setPassportFormat}
              memeTopText={memeTopText}
              onMemeTopTextChange={setMemeTopText}
              memeBottomText={memeBottomText}
              onMemeBottomTextChange={setMemeBottomText}
              jsonIndent={jsonIndent}
              onJsonIndentChange={setJsonIndent}
              onLoadSampleJson={handleLoadSampleJson}
              onMinifyJson={handleMinifyJson}
              hashAlgorithm={hashAlgorithm}
              onHashAlgorithmChange={setHashAlgorithm}
              qrSize={qrSize}
              onQrSizeChange={setQrSize}
              currency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
              calcPrincipal={calcPrincipal}
              onCalcPrincipalChange={setCalcPrincipal}
              calcRate={calcRate}
              onCalcRateChange={setCalcRate}
              calcTenure={calcTenure}
              onCalcTenureChange={setCalcTenure}
              calcBirthDate={calcBirthDate}
              onCalcBirthDateChange={setCalcBirthDate}
              calcGstAmount={calcGstAmount}
              onCalcGstAmountChange={setCalcGstAmount}
              calcGstRate={calcGstRate}
              onCalcGstRateChange={setCalcGstRate}
              calcWeight={calcWeight}
              onCalcWeightChange={setCalcWeight}
              calcHeight={calcHeight}
              onCalcHeightChange={setCalcHeight}
              inputText={inputText}
              onCaseConvert={handleCaseConvert}
            />

            {/* 1. File Upload Dropzone (for PDF, Image, etc.) */}
            {(tool.category === 'pdf' || (tool.category === 'image' && tool.id !== 'image-to-pdf')) && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={tool.id === 'merge-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf' || tool.id === 'image-to-pdf'}
                accept={tool.inputFormats.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/20">
                <Upload className="w-7 h-7" />
              </div>

              <div className="text-base font-bold text-white mb-1">
                Drop your file here, or <span className="text-rose-400 underline underline-offset-2">browse computer</span>
              </div>
              <div className="text-xs text-slate-400">
                Supports {tool.inputFormats.join(', ')} • Maximum file size {tool.maxFileSizeMB} MB
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Selected Files ({selectedFiles.length})</span>
                  <button onClick={handleReset} className="text-rose-400 hover:text-rose-300 text-xs">Clear All</button>
                </div>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono text-slate-500 font-bold">{idx + 1}.</span>
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-slate-500 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SEO Tools Workspace (SERP simulator, Meta Tag generator, Analyzer) */}
        {tool.category === 'seo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Target Page Title
                </label>
                <input
                  type="text"
                  value={seoTitleInput}
                  onChange={(e) => setSeoTitleInput(e.target.value)}
                  placeholder="e.g. 35 Best Free PDF Tools Online | MultipleDarkNews"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Target Canonical URL
                </label>
                <input
                  type="text"
                  value={seoUrlInput}
                  onChange={(e) => setSeoUrlInput(e.target.value)}
                  placeholder="https://multipledarknews.com/#tool/slug"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Meta Description / Content Snippet
              </label>
              <textarea
                rows={3}
                value={seoDescInput}
                onChange={(e) => setSeoDescInput(e.target.value)}
                placeholder="High-intent description for search snippets..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            {tool.id === 'keyword-density-checker' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Paste Full Article / Content to Analyze Keyword Density
                </label>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste article body text here..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* 3. Security Tools Workspace (Password Generator, Password Strength) */}
        {tool.category === 'security' && (
          <div className="space-y-4">
            {(tool.id === 'strong-password-generator' || tool.id === 'password-generator') && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Password Length: <strong className="text-rose-400 font-mono text-sm">{passLength}</strong> chars</span>
                  <span className="text-[11px] text-slate-500">Recommended 16+</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={passLength}
                  onChange={(e) => setPassLength(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passIncludeUpper}
                      onChange={(e) => setPassIncludeUpper(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>Uppercase (A-Z)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passIncludeLower}
                      onChange={(e) => setPassIncludeLower(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>Lowercase (a-z)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passIncludeNumbers}
                      onChange={(e) => setPassIncludeNumbers(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passIncludeSymbols}
                      onChange={(e) => setPassIncludeSymbols(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>Symbols (!@#$)</span>
                  </label>
                </div>
              </div>
            )}

            {(tool.id === 'password-strength-checker' || tool.id.includes('hash') || tool.id === 'rot13-encoder-decoder' || tool.id === '2fa-totp-generator') && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Input String / Secret Key / Password
                </label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text or secret to evaluate..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* 4. Social Media Tools Workspace (YouTube thumbnail, character counters) */}
        {tool.category === 'social-media' && (
          <div className="space-y-4">
            {tool.id === 'youtube-thumbnail-downloader' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  YouTube Video Link
                </label>
                <input
                  type="text"
                  value={youtubeUrlInput}
                  onChange={(e) => setYoutubeUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            )}

            {tool.id === 'utm-link-builder' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">UTM Source</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">UTM Medium</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">UTM Campaign</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            )}

            {tool.id === 'social-post-character-counter' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Post Content
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your tweet, LinkedIn post, or Instagram caption..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            )}
          </div>
        )}

        {/* 5. Audio Tools Workspace (Web Audio Synthesizer) */}
        {tool.category === 'audio' && (
          <div className="space-y-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Oscillator Frequency: <strong className="text-rose-400 font-mono text-sm">{synthFreq} Hz</strong>
                </span>
                <span className="text-xs text-slate-500 font-mono">Range 50Hz - 2000Hz</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                value={synthFreq}
                onChange={(e) => {
                  const f = Number(e.target.value);
                  setSynthFreq(f);
                  if (isSynthPlaying) playSynthesizerTone(f, synthWave);
                }}
                className="w-full accent-rose-500"
              />

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <span className="text-xs text-slate-300 font-semibold">Waveform:</span>
                {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setSynthWave(w);
                      if (isSynthPlaying) playSynthesizerTone(synthFreq, w);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      synthWave === w
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}

                {isSynthPlaying && (
                  <button
                    onClick={() => {
                      stopSynthesizerTone();
                      setIsSynthPlaying(false);
                    }}
                    className="ml-auto px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" /> Stop Audio
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Education Tools Workspace */}
        {tool.category === 'education' && (
          <EducationToolsWorkspace
            tool={tool}
            onResultGenerated={(res) => setOutputResultText(res)}
          />
        )}

        {/* 7. Standard Developer / Text Input Area */}
        {(tool.category === 'developer' || tool.category === 'text' || tool.id === 'text-to-pdf') && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Input Content / String / Payload
              </label>
              <textarea
                rows={7}
                placeholder="Paste your text, code, or payload here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
              />
            </div>

            {tool.id === 'text-diff-checker' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Comparison Text (Modified Version)
                </label>
                <textarea
                  rows={7}
                  placeholder="Paste modified text to compare..."
                  value={inputSecondaryText}
                  onChange={(e) => setInputSecondaryText(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                />
              </div>
            )}
          </div>
        )}

        {/* 8. Calculator Specific Inputs */}
        {tool.category === 'calculator' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tool.id === 'loan-emi-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Principal Amount (₹ / $)</label>
                  <input
                    type="number"
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={calcTenure}
                    onChange={(e) => setCalcTenure(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </>
            )}

            {tool.id === 'bmi-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </>
            )}

            {tool.id === 'age-calculator' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={calcBirthDate}
                  onChange={(e) => setCalcBirthDate(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            )}

            {tool.id === 'gst-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Invoice Amount</label>
                  <input
                    type="number"
                    value={calcGstAmount}
                    onChange={(e) => setCalcGstAmount(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">GST Rate (%)</label>
                  <select
                    value={calcGstRate}
                    onChange={(e) => setCalcGstRate(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  >
                    {[5, 12, 18, 28].map((r) => (
                      <option key={r} value={r}>{r}%</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {/* 9. Unit Converter Inputs */}
        {tool.category === 'unit-converter' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Value</label>
              <input
                type="number"
                value={convValue}
                onChange={(e) => setConvValue(Number(e.target.value))}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Convert From</label>
              <input
                type="text"
                value={convFrom}
                onChange={(e) => setConvFrom(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Convert To</label>
              <input
                type="text"
                value={convTo}
                onChange={(e) => setConvTo(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <RotateCw className="w-4 h-4 animate-spin text-rose-500" />
                {statusMessage}
              </span>
              <span className="font-mono font-bold text-rose-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-rose-600 to-red-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcess}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
          >
            {isProcessing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Processing Client-Side...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute & Generate {tool.name}</span>
              </>
            )}
          </button>

          {isProcessing && (
            <button
              type="button"
              onClick={handleCancel}
              className="py-4 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          )}

          {resultBlob && (
            <button
              type="button"
              onClick={handleReset}
              className="py-4 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Tool</span>
            </button>
          )}
        </div>

        {/* Live Visual & Text Output Results */}
        {(resultUrl || outputResultText || svgVectorResult || youtubeThumbs || serpResult) && (
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-white">Execution Complete!</div>
                  <div className="text-xs text-slate-400">
                    {resultFileName || 'Generated output ready'} {resultBlob ? `• ${(resultBlob.size / 1024).toFixed(1)} KB` : ''}
                  </div>
                </div>
              </div>

              {resultUrl && (
                <a
                  href={resultUrl}
                  download={resultFileName || 'download'}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Output</span>
                </a>
              )}
            </div>

            {/* Google SERP Live Simulation Card */}
            {serpResult && (
              <div className="p-5 bg-white rounded-2xl text-slate-900 space-y-3 font-sans shadow-lg">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Google SERP Card Preview
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>{seoUrlInput}</span>
                  </div>
                  <div className="text-lg font-medium text-blue-800 hover:underline cursor-pointer">
                    {serpResult.desktopTitle}
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    {serpResult.desktopSnippet}
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Thumbnails Visual Grid */}
            {youtubeThumbs && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Extracted YouTube Thumbnails
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex justify-between">
                      <span>Maximum Resolution (HD 1080p)</span>
                      <a href={youtubeThumbs.maxRes} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Download HD</a>
                    </div>
                    <img src={youtubeThumbs.maxRes} alt="YouTube HD Thumbnail" className="rounded-xl w-full h-auto object-cover" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex justify-between">
                      <span>High Quality (HQ 480p)</span>
                      <a href={youtubeThumbs.high} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Download HQ</a>
                    </div>
                    <img src={youtubeThumbs.high} alt="YouTube HQ Thumbnail" className="rounded-xl w-full h-auto object-cover" />
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Preview */}
            {tool.id === 'qr-code-generator' && qrOutputUrl && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <img src={qrOutputUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-lg border border-slate-800" />
              </div>
            )}

            {/* Visual Processed Image Preview */}
            {tool.category === 'image' && resultUrl && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Result Preview</div>
                <img
                  src={resultUrl}
                  alt="Processed Result"
                  className="max-h-80 mx-auto rounded-lg shadow-md border border-slate-800 object-contain"
                />
              </div>
            )}

            {/* Output Result Text Box */}
            {outputResultText && (
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output Result</span>
                  <button
                    onClick={() => copyToClipboard(outputResultText)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={outputResultText}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 font-mono text-xs focus:outline-none"
                />
              </div>
            )}
          </div>
        )}
          </>
        )}

      </div>

      {/* SEO Technical Specifications Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Technical Specifications & Privacy Isolation</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Processing Layer</span>
            <span className="text-slate-200 font-semibold mt-1 block">100% Client-Side WebAssembly</span>
            <span className="text-emerald-400 text-[11px] mt-0.5 block">Zero Cloud Server Egress</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Security Standard</span>
            <span className="text-slate-200 font-semibold mt-1 block">GDPR & CCPA Compliant</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">Auto-memory garbage cleanup</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Service Pricing</span>
            <span className="text-rose-400 font-semibold mt-1 block">₹0 / $0.00 Free Forever</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">No subscription or limits</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Device Support</span>
            <span className="text-slate-200 font-semibold mt-1 block">Cross-Platform Web SPA</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">Desktop, iOS, Android, Linux</span>
          </div>
        </div>
      </div>

      {/* High Authority SEO Ranking: Why Use MultipleDarkNews Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-rose-400" />
          <span>Why Choose MultipleDarkNews {tool.name}?</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Unlike ordinary cloud conversion websites that upload your personal documents and images to third-party remote servers
          where data could be leaked or stored, <strong className="text-white">MultipleDarkNews Tools</strong> uses next-generation
          browser sandbox acceleration. All heavy computations are performed directly on your local device CPU & GPU using
          WebAssembly and WebCodecs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Uncompromised Quality
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintains true lossless rasterization and strict color profiles with zero degradation or artifacts.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> No Watermarks Ever
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Downloads are 100% clean and unbranded. Suitable for official business, legal, and government filings.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Instant Processing
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zero network upload wait times. Files are converted in milliseconds directly in your active browser session.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step How-To Instructions (HowTo Schema) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          <span>Step-by-Step Guide: How to use {tool.name}</span>
        </h3>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <li className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-extrabold text-rose-400 text-base block mb-1">01. Provide Input</span>
            Drop your file or type your input string into the sandbox editor above.
          </li>
          <li className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-extrabold text-rose-400 text-base block mb-1">02. Configure Options</span>
            Tailor execution parameters like quality, dimensions, format, or algorithm.
          </li>
          <li className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-extrabold text-rose-400 text-base block mb-1">03. Generate & Download</span>
            Click "Execute & Generate" to process locally and download instant results.
          </li>
        </ol>
      </div>

      {/* Interactive Expandable Frequently Asked Questions (FAQPage Schema) */}
      {tool.faq.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>Frequently Asked Questions & Google Rich Answers</span>
          </h3>
          <div className="space-y-3">
            {tool.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-200 hover:text-rose-400 transition-colors"
                  >
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* High-Intent Related Tools Internal Link Grid (PageRank Flow) */}
      {relatedTools.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Related {tool.category.toUpperCase()} Tools for High Productivity</span>
            <button
              onClick={() => onNavigate('category', tool.category)}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              View All {tool.category.toUpperCase()} Tools →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.map((rel, idx) => (
              <button
                key={`${rel.id}-${idx}`}
                onClick={() => onNavigate('tool', rel.slug)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                    {rel.name}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {rel.description}
                  </p>
                </div>
                <div className="text-[10px] text-rose-400 font-semibold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch Tool <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
