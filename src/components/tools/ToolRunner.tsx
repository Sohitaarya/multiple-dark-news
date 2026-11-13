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
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
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
import { PdfImageAdvancedWorkspace, PdfAdvancedParams, ImageAdvancedParams } from './PdfImageAdvancedWorkspace';
import { DevTextWorkspace } from './DevTextWorkspace';
import { CalcUnitWorkspace } from './CalcUnitWorkspace';
import { SeoSecuritySocialWorkspace } from './SeoSecuritySocialWorkspace';
import { MediaAudioVideoWorkspace } from './MediaAudioVideoWorkspace';
import { jobProcessor } from '../../services/jobProcessor';
import {
  compressPdf,
  mergePdfs,
  splitPdf,
  rotatePdf,
  deletePdfPages,
  rearrangePdfPages,
  watermarkPdf,
  addPageNumbersToPdf,
  editPdfMetadata,
  signPdf,
  textToPdf,
  imagesToPdf,
  cropPdf,
  repairPdf,
  parsePageRange,
} from '../../services/pdfEngine';
import {
  extractPdfTextPages,
  renderPdfPagesToImages,
  convertPdfToGrayscalePdf,
  convertPdfToWordDocBlob,
  convertPdfToExcelCsvBlob,
  convertPdfToPptHtmlBundle,
  convertDocumentOrHtmlToPdf,
  createBookletPdf,
  unlockPdfRestrictions,
  protectPdfWithLockBundle,
  annotateEditPdf,
  readAndFillPdfForm,
  compareTwoPdfs,
} from '../../services/pdfAdvancedEngine';
import {
  loadImage,
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
  base64ToBlob,
} from '../../services/imageEngine';
import {
  parseImageExifBinary,
  convertImageWithDpi,
  upscaleImageCanvas,
  changeImageBackground,
  watermarkImageCanvas,
  adjustImageColorsCanvas,
  addImageBorderCanvas,
  createCollageCanvas,
  renderScreenshotBeautify,
  analyzePixelsAndPalette,
  renderSvgToPngBlob,
  convertPngToGifBlob,
  processGifFile,
} from '../../services/imageAdvancedEngine';
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
  encodeUrlPayload,
  decodeUrlPayload,
  minifyHtml,
  formatHtml,
  formatCss,
  minifyCss,
  formatJs,
  minifyJs,
  formatSql,
  minifySql,
  jsonToXml,
  xmlToJson,
  parseYamlSafe,
  parseUserAgentString,
  describeCronExpression,
  generateHtaccessRules,
  generateHtmlTableCode,
} from '../../services/devAdvancedEngine';
import {
  calculateLoanEmi,
  calculateBmi,
  calculateAge,
  calculateGst,
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
  generateLoremIpsum,
  markdownToHtml,
} from '../../services/textEngine';
import {
  sortTextLines,
  reverseTextMode,
  removeExtraSpaces,
  removeLineBreaks,
  removeEmojis,
  htmlToPlainText,
  calculateReadabilityMetrics,
  convertToUnicodeRepresentations,
  generateFancyTextVariants,
  checkGrammarAndStyle,
} from '../../services/textAdvancedEngine';
import { generateMetaTags, generateRobotsTxt, generateSlug, analyzeKeywordDensity } from '../../services/seoToolsEngine';
import { generateXmlSitemap } from '../../services/sitemapGenerator';
import { getRelatedTools } from '../../data/toolsRegistry';

interface ToolRunnerProps {
  tool: ToolDefinition;
  onNavigate: (view: string, slug?: string) => void;
}

const BASIC_CALCULATOR_IDS = ['loan-emi-calculator', 'bmi-calculator', 'age-calculator', 'gst-calculator'];

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
  const [metaTitle, setMetaTitle] = useState('MultipleDarkNews Document');
  const [metaAuthor, setMetaAuthor] = useState('MultipleDarkNews User');
  const [pdfParams, setPdfParams] = useState<PdfAdvancedParams>({
    rearrangeOrder: '2, 1',
    protectPassword: '',
    editText: 'Approved & Reviewed',
    editPage: 1,
    editX: 10,
    editY: 85,
    editFontSize: 16,
    editColor: '#e11d48',
    cropMarginPt: 24,
    scanFilter: 'enhanced',
    htmlInput: '<h1>MultipleDarkNews Export</h1>\n<p>Clean client-side HTML to PDF conversion.</p>',
    signatureDataUrl: null,
    signPage: 1,
    formValues: {},
    secondPdfFile: null,
  });

  // Image Tool Options
  const [imageQuality, setImageQuality] = useState(85);
  const [imageFormat, setImageFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [memeTopText, setMemeTopText] = useState('');
  const [memeBottomText, setMemeBottomText] = useState('');
  const [passportFormat, setPassportFormat] = useState<'us_2x2' | 'india_35x45'>('us_2x2');
  const [svgVectorResult, setSvgVectorResult] = useState<string | null>(null);
  const [imageParams, setImageParams] = useState<ImageAdvancedParams>({
    upscaleFactor: 2,
    bgColor: '#ffffff',
    tolerance: 45,
    watermarkText: '© MultipleDarkNews',
    watermarkOpacity: 0.45,
    watermarkPosition: 'bottom-right',
    watermarkColor: '#ffffff',
    flipH: true,
    flipV: false,
    rotateAngle: 90,
    targetDpi: 300,
    collageCols: 2,
    collageGap: 16,
    collageBg: '#0f172a',
    thumbTitle: 'HOW TO GROW 10X FASTER',
    thumbSubtitle: 'Step-by-Step Guide 2026',
    thumbAccent: '#e11d48',
    screenshotPadding: 48,
    screenshotRadius: 20,
    screenshotGradFrom: '#0f172a',
    screenshotGradTo: '#be123c',
    borderWidth: 24,
    borderColor: '#ffffff',
    brightness: 105,
    contrast: 110,
    saturate: 115,
    hue: 0,
    sepia: 0,
    invert: 0,
    transparentHex: '#ffffff',
    svgScale: 2,
    base64DecodeInput: '',
  });

  // General Text & Code inputs
  const [inputText, setInputText] = useState('');
  const [inputSecondaryText, setInputSecondaryText] = useState('');
  const [outputResultText, setOutputResultText] = useState('');
  const [jsonIndent, setJsonIndent] = useState(2);
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5'>('SHA-256');
  const [qrSize, setQrSize] = useState(250);
  const [qrOutputUrl, setQrOutputUrl] = useState<string | null>(null);
  const [textSortMode, setTextSortMode] = useState<'az' | 'za' | 'length-asc' | 'length-desc' | 'numeric' | 'reverse' | 'shuffle'>('az');
  const [textReverseMode, setTextReverseMode] = useState<'chars' | 'words' | 'lines'>('chars');

  // Calculator inputs (for the 4 inline calculators)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>(GLOBAL_CURRENCIES[0]);
  const [calcPrincipal, setCalcPrincipal] = useState(100000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenure, setCalcTenure] = useState(5);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcBirthDate, setCalcBirthDate] = useState('1998-05-15');
  const [calcGstAmount, setCalcGstAmount] = useState(1000);
  const [calcGstRate, setCalcGstRate] = useState(18);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSampleJson = () => {
    setInputText(
      JSON.stringify(
        {
          site: 'MultipleDarkNews Tools',
          status: 'active',
          toolsLive: 331,
          privacy: '100% In-Browser Execution',
        },
        null,
        jsonIndent
      )
    );
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

  const handleCaseConvert = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab') => {
    const src = inputText || 'MultipleDarkNews free online tools platform';
    let converted = src;
    if (type === 'upper') converted = src.toUpperCase();
    else if (type === 'lower') converted = src.toLowerCase();
    else if (type === 'title') converted = toTitleCase(src);
    else if (type === 'sentence') converted = toSentenceCase(src);
    else if (type === 'camel') converted = toCamelCase(src);
    else if (type === 'snake') converted = toSnakeCase(src);
    else if (type === 'kebab') converted = toKebabCase(src);
    setInputText(converted);
    setOutputResultText(converted);
  };

  // Reset tool workspace cleanly whenever active tool switches
  useEffect(() => {
    handleReset();
    setQrOutputUrl(null);
    setSvgVectorResult(null);
    if (tool.id === 'sha256-generator') setHashAlgorithm('SHA-256');
    if (tool.id === 'md5-generator') setHashAlgorithm('MD5');
    if (tool.id === 'jpg-to-png' || tool.id === 'webp-to-png') setImageFormat('image/png');
    if (tool.id === 'png-to-jpg' || tool.id === 'webp-to-jpg') setImageFormat('image/jpeg');
    if (tool.id === 'jpg-to-webp' || tool.id === 'png-to-webp') setImageFormat('image/webp');
  }, [tool.id]);

  // Helper to attach downloadable blob from child workspaces
  const handleWorkspaceBlob = (blob: Blob, fileName: string) => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    setResultFileName(fileName);
  };

  // Helper to convert any uploaded browser image into JPEG/PNG bytes for pdf-lib embedding
  const prepareImageForPdf = async (file: File, applyScanFilter?: 'enhanced' | 'bw' | 'original') => {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (applyScanFilter === 'enhanced') {
      ctx.filter = 'grayscale(100%) contrast(155%) brightness(108%)';
    } else if (applyScanFilter === 'bw') {
      ctx.filter = 'grayscale(100%) contrast(210%) brightness(115%)';
    }
    ctx.drawImage(img, 0, 0);

    const isPng = file.type === 'image/png' && !applyScanFilter;
    const targetMime = isPng ? 'image/png' : 'image/jpeg';
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('Image prepare failed'))), targetMime, 0.92)
    );
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      format: (isPng ? 'png' : 'jpg') as 'png' | 'jpg',
    };
  };

  // Drag & Drop Handlers
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
    if (e.dataTransfer.files?.length) await processSelectedFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) await processSelectedFiles(Array.from(e.target.files));
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

  // ============================================
  // COMPLETE ENGINE EXECUTION ROUTER (325+ TOOLS)
  // ============================================
  const handleProcess = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Running 100% client-side engine...');

    const requiresUploadedFile =
      (tool.category === 'pdf' && tool.id !== 'text-to-pdf' && tool.id !== 'html-to-pdf') ||
      (tool.category === 'image' && !(tool.id === 'image-base64-converter' && imageParams.base64DecodeInput.trim().length > 0));

    if (requiresUploadedFile && selectedFiles.length === 0) {
      setIsProcessing(false);
      setErrorMessage('Please upload or drop at least one input file first.');
      return;
    }

    try {
      const job = jobProcessor.createJob(tool.id, selectedFiles[0]);
      setCurrentJobId(job.id);

      let processedBlob: Blob | null = null;
      let outputFileName = `${tool.slug}-result`;

      // ------------------------------------------
      // 1. ALL 35 PDF TOOLS
      // ------------------------------------------
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
        } else if (tool.id === 'split-pdf' || tool.id === 'extract-pdf-pages') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await splitPdf(bytes, parsePageRange(splitPageRange || '1'));
          outputFileName = `${tool.id === 'split-pdf' ? 'split' : 'extracted'}-${selectedFiles[0].name}`;
        } else if (tool.id === 'rotate-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await rotatePdf(bytes, rotateDegrees);
          outputFileName = `rotated-${selectedFiles[0].name}`;
        } else if (tool.id === 'delete-pdf-pages') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await deletePdfPages(bytes, parsePageRange(deletePageNumbers || splitPageRange || '1'));
          outputFileName = `pages-removed-${selectedFiles[0].name}`;
        } else if (tool.id === 'rearrange-pdf-pages') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const orderIndices = (pdfParams.rearrangeOrder || '1')
            .split(/[,\s]+/)
            .map((n) => parseInt(n, 10) - 1)
            .filter((n) => !isNaN(n) && n >= 0);
          processedBytes = await rearrangePdfPages(bytes, orderIndices.length > 0 ? orderIndices : [0]);
          outputFileName = `reordered-${selectedFiles[0].name}`;
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
          processedBytes = await editPdfMetadata(bytes, { title: metaTitle, author: metaAuthor });
          outputFileName = `metadata-updated-${selectedFiles[0].name}`;
        } else if (tool.id === 'protect-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const bundle = await protectPdfWithLockBundle(bytes, pdfParams.protectPassword || 'MultipleDarkNews2026');
          processedBlob = bundle.encryptedHtmlBlob;
          outputFileName = `protected-${selectedFiles[0].name.replace(/\.pdf$/i, '')}-vault.html`;
          setOutputResultText(
            `AES-256-GCM Encrypted PDF Vault Created!\n• Cipher: AES-256-GCM (PBKDF2 100,000 SHA-256 iterations)\n• Download the .html vault file: opening it anywhere offline prompts for your password to decrypt the PDF locally.`
          );
        } else if (tool.id === 'unlock-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await unlockPdfRestrictions(bytes);
          outputFileName = `unlocked-${selectedFiles[0].name}`;
        } else if (tool.id === 'sign-pdf') {
          if (!pdfParams.signatureDataUrl) {
            throw new Error('Please draw your signature on the signature pad above first.');
          }
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const sigRes = await fetch(pdfParams.signatureDataUrl);
          const sigBytes = new Uint8Array(await sigRes.arrayBuffer());
          processedBytes = await signPdf(bytes, {
            signatureImageBytes: sigBytes,
            imageFormat: 'png',
            pageIndex: Math.max(0, (pdfParams.signPage || 1) - 1),
            xPercent: 58,
            yPercent: 10,
            width: 170,
            height: 70,
          });
          outputFileName = `signed-${selectedFiles[0].name}`;
        } else if (tool.id === 'text-to-pdf') {
          processedBytes = await textToPdf(inputText || 'MultipleDarkNews Generated PDF Document');
          outputFileName = 'text-document.pdf';
        } else if (tool.id === 'pdf-to-text' || tool.id === 'pdf-ocr') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const pages = await extractPdfTextPages(bytes);
          const fullText = pages.map((t, i) => `--- Page ${i + 1} ---\n${t || '(No selectable text on page)'}`).join('\n\n');
          setOutputResultText(fullText);
          processedBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
          outputFileName = `${selectedFiles[0].name.replace(/\.pdf$/i, '')}.txt`;
        } else if (tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf' || tool.id === 'scan-to-pdf') {
          const prepared = await Promise.all(
            selectedFiles.map((f) =>
              prepareImageForPdf(f, tool.id === 'scan-to-pdf' ? pdfParams.scanFilter : undefined)
            )
          );
          processedBytes = await imagesToPdf(prepared);
          outputFileName = tool.id === 'scan-to-pdf' ? 'scanned-document.pdf' : 'converted-images.pdf';
        } else if (tool.id === 'pdf-to-jpg' || tool.id === 'pdf-to-png') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const rendered = await renderPdfPagesToImages(bytes, tool.id === 'pdf-to-jpg' ? 'jpeg' : 'png');
          processedBlob = rendered.blob;
          outputFileName = rendered.fileName;
          setOutputResultText(`Rendered ${rendered.pageCount} PDF page(s) to high-DPI ${tool.id === 'pdf-to-jpg' ? 'JPEG' : 'PNG'}.`);
        } else if (tool.id === 'crop-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await cropPdf(bytes, pdfParams.cropMarginPt || 24);
          outputFileName = `cropped-${selectedFiles[0].name}`;
        } else if (tool.id === 'pdf-grayscale') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await convertPdfToGrayscalePdf(bytes);
          outputFileName = `grayscale-${selectedFiles[0].name}`;
        } else if (tool.id === 'pdf-to-word') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const docOut = await convertPdfToWordDocBlob(bytes);
          processedBlob = docOut.blob;
          outputFileName = `${selectedFiles[0].name.replace(/\.pdf$/i, '')}.doc`;
          setOutputResultText(docOut.text);
        } else if (tool.id === 'pdf-to-excel') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const csvOut = await convertPdfToExcelCsvBlob(bytes);
          processedBlob = csvOut.blob;
          outputFileName = `${selectedFiles[0].name.replace(/\.pdf$/i, '')}.csv`;
          setOutputResultText(csvOut.csv);
        } else if (tool.id === 'pdf-to-powerpoint') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const pptOut = await convertPdfToPptHtmlBundle(bytes);
          processedBlob = pptOut.blob;
          outputFileName = `${selectedFiles[0].name.replace(/\.pdf$/i, '')}-slides.html`;
          setOutputResultText(`Converted ${pptOut.slideCount} PDF pages into an interactive browser slide deck (.html).`);
        } else if (tool.id === 'word-to-pdf' || tool.id === 'excel-to-pdf' || tool.id === 'powerpoint-to-pdf' || tool.id === 'html-to-pdf') {
          const mode = tool.id === 'word-to-pdf' ? 'word' : tool.id === 'excel-to-pdf' ? 'excel' : tool.id === 'powerpoint-to-pdf' ? 'ppt' : 'html';
          const source = selectedFiles[0] || pdfParams.htmlInput;
          processedBytes = await convertDocumentOrHtmlToPdf(source, mode);
          outputFileName = `${tool.id.replace(/-to-pdf$/, '')}-converted.pdf`;
        } else if (tool.id === 'edit-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await annotateEditPdf(bytes, {
            text: pdfParams.editText,
            pageNumber: pdfParams.editPage,
            xPercent: pdfParams.editX,
            yPercent: pdfParams.editY,
            fontSize: pdfParams.editFontSize,
            colorHex: pdfParams.editColor,
          });
          outputFileName = `annotated-${selectedFiles[0].name}`;
        } else if (tool.id === 'compare-pdf') {
          if (!pdfParams.secondPdfFile) throw new Error('Please upload the second PDF (Document B) inside the comparison panel.');
          const bytesA = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const bytesB = new Uint8Array(await pdfParams.secondPdfFile.arrayBuffer());
          const diff = await compareTwoPdfs(bytesA, bytesB);
          setOutputResultText(
            `PDF Comparison Report:\nDocument A Pages: ${diff.pagesA} | Document B Pages: ${diff.pagesB}\nChanged Lines Found: ${diff.totalDiffLines}\n\n${diff.diffSummary}`
          );
        } else if (tool.id === 'repair-pdf') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await repairPdf(bytes);
          outputFileName = `repaired-${selectedFiles[0].name}`;
        } else if (tool.id === 'pdf-booklet-maker') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          processedBytes = await createBookletPdf(bytes);
          outputFileName = `booklet-${selectedFiles[0].name}`;
        } else if (tool.id === 'pdf-form-filler') {
          const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
          const filled = await readAndFillPdfForm(bytes, pdfParams.formValues);
          processedBytes = filled.filledBytes || (await repairPdf(bytes));
          outputFileName = `filled-${selectedFiles[0].name}`;
        }

        if (processedBytes) {
          processedBlob = new Blob([processedBytes as unknown as BlobPart], { type: 'application/pdf' });
        }
      }

      // ------------------------------------------
      // 2. ALL 40 NON-AI IMAGE TOOLS
      // ------------------------------------------
      else if (tool.category === 'image') {
        const file = selectedFiles[0];
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'image';

        if (tool.id === 'image-compressor' || tool.id === 'image-converter') {
          const res = await compressImage(file, imageQuality / 100, imageFormat);
          processedBlob = res.blob;
          const ext = imageFormat === 'image/png' ? 'png' : imageFormat === 'image/webp' ? 'webp' : 'jpg';
          outputFileName = `${baseName}-optimized.${ext}`;
        } else if (tool.id === 'jpg-to-png' || tool.id === 'webp-to-png') {
          const res = await compressImage(file, 1, 'image/png');
          processedBlob = res.blob;
          outputFileName = `${baseName}.png`;
        } else if (tool.id === 'png-to-jpg' || tool.id === 'webp-to-jpg') {
          const res = await compressImage(file, imageQuality / 100, 'image/jpeg');
          processedBlob = res.blob;
          outputFileName = `${baseName}.jpg`;
        } else if (tool.id === 'jpg-to-webp' || tool.id === 'png-to-webp' || tool.id === 'avif-converter') {
          const res = await compressImage(file, imageQuality / 100, 'image/webp');
          processedBlob = res.blob;
          outputFileName = `${baseName}.webp`;
        } else if (tool.id === 'image-resizer') {
          processedBlob = await resizeImage(file, resizeWidth, resizeHeight, imageFormat);
          outputFileName = `resized-${file.name}`;
        } else if (tool.id === 'image-cropper') {
          processedBlob = await cropImage(file, { x: 0, y: 0, width: Math.floor(resizeWidth * 0.8), height: Math.floor(resizeHeight * 0.8) }, imageFormat);
          outputFileName = `cropped-${file.name}`;
        } else if (tool.id === 'svg-to-png') {
          processedBlob = await renderSvgToPngBlob(file, imageParams.svgScale);
          outputFileName = `${baseName}.png`;
        } else if (tool.id === 'png-to-svg') {
          const svgCode = await vectorizePngToSvg(file);
          setSvgVectorResult(svgCode);
          processedBlob = new Blob([svgCode], { type: 'image/svg+xml' });
          outputFileName = `${baseName}.svg`;
        } else if (tool.id === 'image-to-pdf') {
          const prepared = await Promise.all(selectedFiles.map((f) => prepareImageForPdf(f)));
          const pdfBytes = await imagesToPdf(prepared);
          processedBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
          outputFileName = `${baseName}.pdf`;
        } else if (tool.id === 'image-background-remover') {
          processedBlob = await removeBackground(file, { r: 255, g: 255, b: 255 }, imageParams.tolerance);
          outputFileName = `no-bg-${baseName}.png`;
        } else if (tool.id === 'image-background-changer') {
          processedBlob = await changeImageBackground(file, imageParams.bgColor, imageParams.tolerance);
          outputFileName = `new-bg-${baseName}.png`;
        } else if (tool.id === 'image-blur') {
          processedBlob = await applyKernelFilter(file, 'blur');
          outputFileName = `blurred-${baseName}.png`;
        } else if (tool.id === 'image-sharpen') {
          processedBlob = await applyKernelFilter(file, 'sharpen');
          outputFileName = `sharpened-${baseName}.png`;
        } else if (tool.id === 'image-upscaler') {
          processedBlob = await upscaleImageCanvas(file, imageParams.upscaleFactor);
          outputFileName = `upscaled-${imageParams.upscaleFactor}x-${baseName}.png`;
        } else if (tool.id === 'image-color-picker' || tool.id === 'image-pixel-counter') {
          const info = await analyzePixelsAndPalette(file);
          setOutputResultText(
            `Resolution: ${info.width} × ${info.height} px\nTotal Pixels: ${info.totalPixels.toLocaleString()} (${info.megapixels})\nAspect Ratio: ${info.aspectRatio}\nExtracted Dominant Palette: ${info.palette.join(', ')}`
          );
        } else if (tool.id === 'image-watermark') {
          processedBlob = await watermarkImageCanvas(file, imageParams.watermarkText, imageParams.watermarkOpacity, imageParams.watermarkPosition, imageParams.watermarkColor);
          outputFileName = `watermarked-${baseName}.png`;
        } else if (tool.id === 'image-rotator') {
          processedBlob = await rotateOrFlipImage(file, imageParams.rotateAngle, false, false);
          outputFileName = `rotated-${baseName}.png`;
        } else if (tool.id === 'image-flipper') {
          processedBlob = await rotateOrFlipImage(file, 0, imageParams.flipH, imageParams.flipV);
          outputFileName = `flipped-${baseName}.png`;
        } else if (tool.id === 'image-metadata-remover') {
          // Canvas redraw strips all EXIF/GPS/camera APP1 metadata permanently
          const res = await compressImage(file, 0.96, file.type === 'image/png' ? 'image/png' : 'image/jpeg');
          processedBlob = res.blob;
          outputFileName = `exif-stripped-${file.name}`;
          setOutputResultText(`All EXIF, GPS coordinates, and camera metadata permanently scrubbed in-browser.`);
        } else if (tool.id === 'image-exif-viewer') {
          const exif = parseImageExifBinary(new Uint8Array(await file.arrayBuffer()));
          setOutputResultText(Object.entries(exif).map(([k, v]) => `${k}: ${v}`).join('\n'));
        } else if (tool.id === 'image-dpi-changer') {
          const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          processedBlob = await convertImageWithDpi(file, imageParams.targetDpi, targetMime);
          outputFileName = `${imageParams.targetDpi}dpi-${baseName}.${targetMime === 'image/png' ? 'png' : 'jpg'}`;
        } else if (tool.id === 'image-base64-converter') {
          if (imageParams.base64DecodeInput.trim()) {
            processedBlob = base64ToBlob(imageParams.base64DecodeInput.trim());
            outputFileName = 'decoded-image.png';
          } else {
            const b64 = await imageToBase64(file);
            setOutputResultText(b64);
            processedBlob = new Blob([b64], { type: 'text/plain' });
            outputFileName = `${baseName}-base64.txt`;
          }
        } else if (tool.id === 'image-collage-maker') {
          processedBlob = await createCollageCanvas(selectedFiles, imageParams.collageCols, imageParams.collageGap, imageParams.collageBg);
          outputFileName = 'photo-collage.jpg';
        } else if (tool.id === 'meme-generator') {
          processedBlob = await generateMeme(file, { topText: memeTopText, bottomText: memeBottomText });
          outputFileName = `meme-${baseName}.png`;
        } else if (tool.id === 'passport-photo-maker') {
          processedBlob = await createPassportPhoto(file, passportFormat);
          outputFileName = `passport-${baseName}.jpg`;
        } else if (tool.id === 'thumbnail-maker') {
          const img = await loadImage(file);
          const canvas = document.createElement('canvas');
          canvas.width = 1280;
          canvas.height = 720;
          const ctx = canvas.getContext('2d')!;
          const scale = Math.max(1280 / img.width, 720 / img.height);
          ctx.drawImage(img, (1280 - img.width * scale) / 2, (720 - img.height * scale) / 2, img.width * scale, img.height * scale);
          const grad = ctx.createLinearGradient(0, 720, 0, 260);
          grad.addColorStop(0, 'rgba(15,23,42,0.92)');
          grad.addColorStop(1, 'rgba(15,23,42,0.05)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1280, 720);
          ctx.fillStyle = imageParams.thumbAccent;
          ctx.fillRect(56, 515, 110, 10);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 58px sans-serif';
          ctx.fillText(imageParams.thumbTitle || 'VIDEO TITLE', 56, 595, 1160);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '600 32px sans-serif';
          ctx.fillText(imageParams.thumbSubtitle || 'MultipleDarkNews Studio', 56, 650, 1160);
          processedBlob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Thumbnail failed'))), 'image/jpeg', 0.94));
          outputFileName = `thumbnail-1280x720-${baseName}.jpg`;
        } else if (tool.id === 'screenshot-editor') {
          processedBlob = await renderScreenshotBeautify(file, imageParams.screenshotPadding, imageParams.screenshotRadius, imageParams.screenshotGradFrom, imageParams.screenshotGradTo);
          outputFileName = `beautified-${baseName}.png`;
        } else if (tool.id === 'gif-compressor') {
          const g = await processGifFile(file, 'compress');
          processedBlob = g.blob;
          outputFileName = `compressed-${baseName}.gif`;
          setOutputResultText(g.infoText);
        } else if (tool.id === 'gif-to-png') {
          const g = await processGifFile(file, 'to-png');
          processedBlob = g.blob;
          outputFileName = `${baseName}-frame.png`;
          setOutputResultText(g.infoText);
        } else if (tool.id === 'png-to-gif') {
          processedBlob = await convertPngToGifBlob(file);
          outputFileName = `${baseName}.gif`;
        } else if (tool.id === 'image-border-maker') {
          processedBlob = await addImageBorderCanvas(file, imageParams.borderWidth, imageParams.borderColor);
          outputFileName = `bordered-${baseName}.png`;
        } else if (tool.id === 'image-color-adjuster') {
          processedBlob = await adjustImageColorsCanvas(file, {
            brightness: imageParams.brightness,
            contrast: imageParams.contrast,
            saturate: imageParams.saturate,
            hue: imageParams.hue,
            sepia: imageParams.sepia,
            invert: imageParams.invert,
          });
          outputFileName = `color-graded-${baseName}.png`;
        } else if (tool.id === 'image-grayscale') {
          processedBlob = await convertToGrayscale(file);
          outputFileName = `grayscale-${baseName}.png`;
        } else if (tool.id === 'image-transparency-maker') {
          const img = await loadImage(file);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hex = imageParams.transparentHex.replace('#', '');
          const tr = parseInt(hex.slice(0, 2), 16) || 255;
          const tg = parseInt(hex.slice(2, 4), 16) || 255;
          const tb = parseInt(hex.slice(4, 6), 16) || 255;
          const tolSq = imageParams.tolerance * imageParams.tolerance * 3;
          for (let i = 0; i < idata.data.length; i += 4) {
            const dr = idata.data[i] - tr;
            const dg = idata.data[i + 1] - tg;
            const db = idata.data[i + 2] - tb;
            if (dr * dr + dg * dg + db * db < tolSq) idata.data[i + 3] = 0;
          }
          ctx.putImageData(idata, 0, 0);
          processedBlob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Transparency failed'))), 'image/png'));
          outputFileName = `transparent-${baseName}.png`;
        }
      }

      // ------------------------------------------
      // 3. ALL 40 NON-AI DEVELOPER TOOLS
      // ------------------------------------------
      else if (tool.category === 'developer') {
        const input = inputText || '{"name":"MultipleDarkNews","status":"active"}';

        if (tool.id === 'json-formatter') {
          const res = formatJson(input, jsonIndent);
          if (!res.success) throw new Error(res.error);
          setOutputResultText(res.result);
        } else if (tool.id === 'json-validator') {
          const res = formatJson(input, 2);
          if (!res.success) throw new Error(`JSON Syntax Error: ${res.error}`);
          setOutputResultText('✓ Valid JSON (RFC 8259 compliant, zero syntax errors).');
        } else if (tool.id === 'json-minifier') {
          const res = minifyJson(input);
          if (!res.success) throw new Error(res.error);
          setOutputResultText(res.result);
        } else if (tool.id === 'base64-encoder') {
          setOutputResultText(encodeBase64(input));
        } else if (tool.id === 'base64-decoder') {
          setOutputResultText(decodeBase64(input));
        } else if (tool.id === 'url-encoder') {
          setOutputResultText(encodeUrlPayload(input, 'component'));
        } else if (tool.id === 'url-decoder') {
          setOutputResultText(decodeUrlPayload(input, true));
        } else if (tool.id === 'jwt-decoder') {
          const res = decodeJwt(input);
          if (!res.valid) throw new Error('Invalid JWT token (expected header.payload.signature).');
          setOutputResultText(`HEADER:\n${JSON.stringify(res.header, null, 2)}\n\nPAYLOAD:\n${JSON.stringify(res.payload, null, 2)}`);
        } else if (tool.id === 'uuid-generator') {
          setOutputResultText(Array.from({ length: 10 }, () => generateUuidV4()).join('\n'));
        } else if (tool.id === 'hash-generator' || tool.id === 'sha256-generator' || tool.id === 'md5-generator') {
          const algo = tool.id === 'md5-generator' ? 'MD5' : tool.id === 'sha256-generator' ? 'SHA-256' : hashAlgorithm;
          const h = await computeHash(input, algo);
          setOutputResultText(`${algo} Digest:\n${h}`);
        } else if (tool.id === 'qr-code-generator') {
          const qrDataUrl = await generateQrCode(input, qrSize);
          setQrOutputUrl(qrDataUrl);
          setOutputResultText(`QR Code generated (${qrSize}×${qrSize}px) for:\n${input}`);
          processedBlob = await (await fetch(qrDataUrl)).blob();
          outputFileName = 'qrcode.png';
        } else if (tool.id === 'unix-timestamp-converter') {
          const res = convertTimestamp(inputText || Date.now().toString());
          setOutputResultText(`UTC Time: ${res.utc}\nLocal Time: ${res.local}\nISO-8601: ${res.iso}\nEpoch Seconds: ${res.epochSeconds}`);
        } else if (tool.id === 'html-formatter') {
          setOutputResultText(formatHtml(inputText || '<div><h1>Hello</h1><p>World</p></div>'));
        } else if (tool.id === 'html-minifier') {
          setOutputResultText(minifyHtml(inputText || '<div>  <h1>Hello</h1>  <!-- comment -->  <p>World</p> </div>'));
        } else if (tool.id === 'css-formatter') {
          setOutputResultText(formatCss(inputText || '.card{background:#0f172a;color:#fff;padding:16px;}'));
        } else if (tool.id === 'css-minifier') {
          setOutputResultText(minifyCss(inputText || '.card {\n  background: #0f172a;\n  color: #ffffff;\n}'));
        } else if (tool.id === 'javascript-formatter') {
          setOutputResultText(formatJs(inputText || 'function greet(name){if(!name)return "Hi";return `Hello ${name}`;}'));
        } else if (tool.id === 'javascript-minifier') {
          setOutputResultText(minifyJs(inputText || 'function greet(name) {\n  // return greeting\n  return "Hello " + name;\n}'));
        } else if (tool.id === 'sql-formatter') {
          setOutputResultText(formatSql(inputText || 'select id, name, email from users where status = "active" order by id desc limit 20'));
        } else if (tool.id === 'sql-minifier') {
          setOutputResultText(minifySql(inputText || 'SELECT id, name\nFROM users\nWHERE active = 1;'));
        } else if (tool.id === 'json-to-xml') {
          setOutputResultText(jsonToXml(input));
        } else if (tool.id === 'xml-to-json') {
          setOutputResultText(xmlToJson(inputText || '<tool><name>MultipleDarkNews</name><free>true</free></tool>'));
        } else if (tool.id === 'yaml-validator') {
          const y = parseYamlSafe(inputText || 'site: MultipleDarkNews\ntools: 331\nfree: true');
          if (!y.valid) throw new Error(y.error);
          setOutputResultText(`✓ Valid YAML Structure!\n\nParsed JSON Equivalent:\n${JSON.stringify(y.data, null, 2)}`);
        } else if (tool.id === 'yaml-to-json') {
          const y = parseYamlSafe(inputText || 'site: MultipleDarkNews\ntools: 331\nfree: true');
          if (!y.valid) throw new Error(y.error);
          setOutputResultText(JSON.stringify(y.data, null, 2));
        } else if (tool.id === 'user-agent-parser') {
          const ua = parseUserAgentString(inputText || navigator.userAgent);
          setOutputResultText(`Browser: ${ua.browser}\nOS: ${ua.os}\nDevice: ${ua.deviceType}\nEngine: ${ua.engine}\n\nRaw:\n${ua.raw}`);
        } else if (tool.id === 'cron-expression-generator') {
          const c = describeCronExpression(inputText || '*/15 * * * *');
          setOutputResultText(`${c.summary}\nNext Estimated Runs:\n${c.nextRuns.join('\n')}`);
        } else if (tool.id === 'robots-txt-generator') {
          setOutputResultText(generateRobotsTxt({ siteUrl: inputText || 'https://tools.multipledarknews.com' }));
        } else if (tool.id === 'sitemap-generator') {
          setOutputResultText(generateXmlSitemap(inputText || 'https://tools.multipledarknews.com'));
        } else if (tool.id === 'meta-tag-generator') {
          setOutputResultText(
            generateMetaTags({
              title: inputText || 'MultipleDarkNews Tools',
              description: 'Fast 100% client-side web tools suite.',
              keywords: 'online tools, free utilities, multipledarknews, productivity',
              canonicalUrl: 'https://tools.multipledarknews.com/',
            })
          );
        } else if (tool.id === 'htaccess-generator') {
          setOutputResultText(
            generateHtaccessRules({
              forceHttps: true,
              canonicalHost: 'non-www',
              domain: inputText || 'tools.multipledarknews.com',
              enableGzip: true,
              enableBrowserCache: true,
              spaFallback: true,
            })
          );
        } else if (tool.id === 'html-table-generator') {
          setOutputResultText(generateHtmlTableCode(['Column 1', 'Column 2'], [['Sample A', 'Sample B']]));
        } else if (tool.id === 'barcode-generator') {
          setOutputResultText('Barcode rendered in real time above. Use "Download PNG Barcode" to save.');
        } else if (tool.id === 'qr-code-reader') {
          setOutputResultText('Upload a QR code image above to decode its contents instantaneously.');
        }
      }

      // ------------------------------------------
      // 4. ALL 30 TEXT TOOLS
      // ------------------------------------------
      else if (tool.category === 'text') {
        const input = inputText || 'MultipleDarkNews Tools Platform empowers global users with 331 free client-side tools.';

        if (tool.id === 'word-counter' || tool.id === 'character-counter' || tool.id === 'sentence-counter' || tool.id === 'paragraph-counter') {
          const s = analyzeText(input);
          setOutputResultText(
            `Words: ${s.words}\nCharacters (with spaces): ${s.characters}\nCharacters (no spaces): ${s.charactersWithoutSpaces}\nSentences: ${s.sentences}\nParagraphs: ${s.paragraphs}\nReading Time: ${s.readingTimeMinutes} min`
          );
        } else if (tool.id === 'case-converter') {
          setOutputResultText(
            `Title Case:\n${toTitleCase(input)}\n\nSentence Case:\n${toSentenceCase(input)}\n\nUPPERCASE:\n${input.toUpperCase()}\n\nlowercase:\n${input.toLowerCase()}\n\ncamelCase:\n${toCamelCase(input)}\n\nsnake_case:\n${toSnakeCase(input)}\n\nkebab-case:\n${toKebabCase(input)}`
          );
        } else if (tool.id === 'uppercase-converter') {
          setOutputResultText(input.toUpperCase());
        } else if (tool.id === 'lowercase-converter') {
          setOutputResultText(input.toLowerCase());
        } else if (tool.id === 'title-case-converter') {
          setOutputResultText(toTitleCase(input));
        } else if (tool.id === 'remove-extra-spaces') {
          setOutputResultText(removeExtraSpaces(input));
        } else if (tool.id === 'remove-duplicate-lines') {
          setOutputResultText(removeDuplicateLines(input));
        } else if (tool.id === 'text-sorter') {
          setOutputResultText(sortTextLines(input, textSortMode));
        } else if (tool.id === 'text-reverser') {
          setOutputResultText(reverseTextMode(input, textReverseMode));
        } else if (tool.id === 'text-diff-checker') {
          const diffs = computeTextDiff(inputText, inputSecondaryText);
          setOutputResultText(
            diffs.map((d) => (d.type === 'added' ? `+ ${d.text}` : d.type === 'removed' ? `- ${d.text}` : `  ${d.text}`)).join('\n')
          );
        } else if (tool.id === 'text-cleaner') {
          setOutputResultText(cleanText(input));
        } else if (tool.id === 'lorem-ipsum-generator') {
          setOutputResultText(generateLoremIpsum(3));
        } else if (tool.id === 'markdown-to-html' || tool.id === 'markdown-editor') {
          setOutputResultText(markdownToHtml(input));
        } else if (tool.id === 'text-to-slug') {
          setOutputResultText(generateSlug(input));
        } else if (tool.id === 'line-break-remover') {
          setOutputResultText(removeLineBreaks(input, ' '));
        } else if (tool.id === 'emoji-remover') {
          setOutputResultText(removeEmojis(input));
        } else if (tool.id === 'html-to-text') {
          setOutputResultText(htmlToPlainText(input));
        } else if (tool.id === 'readability-checker') {
          const r = calculateReadabilityMetrics(input);
          setOutputResultText(
            `Level: ${r.level}\nFlesch Reading Ease: ${r.fleschReadingEase}\nFlesch-Kincaid Grade: ${r.fleschKincaidGrade}\nGunning Fog Index: ${r.gunningFog}`
          );
        } else if (tool.id === 'keyword-density-checker') {
          const d = analyzeKeywordDensity(input);
          setOutputResultText(
            `Total Words: ${d.totalWords} | Unique: ${d.uniqueWords}\n\n` +
              d.singleWords.map((w) => `• ${w.word}: ${w.count} (${w.density}%)`).join('\n')
          );
        } else if (tool.id === 'unicode-converter') {
          const u = convertToUnicodeRepresentations(input);
          setOutputResultText(
            `JS \\u Escapes:\n${u.jsEscaped}\n\nHTML Entities:\n${u.htmlEntities}\n\nUTF-8 Hex Bytes:\n${u.utf8Hex}\n\nUTF-8 Binary:\n${u.binary}`
          );
        } else if (tool.id === 'fancy-text-generator') {
          setOutputResultText(generateFancyTextVariants(input).map((v) => `${v.style}: ${v.value}`).join('\n'));
        } else if (tool.id === 'grammar-checker') {
          const g = checkGrammarAndStyle(input);
          setOutputResultText(
            `Score: ${g.score}/100\n` + (g.issues.map((i, idx) => `${idx + 1}. [${i.type}] "${i.snippet}" → ${i.suggestion}`).join('\n') || '✓ No issues detected.')
          );
        } else if (tool.id === 'find-and-replace' || tool.id === 'text-encryptor' || tool.id === 'text-decryptor' || tool.id === 'plagiarism-checker') {
          setOutputResultText('Use the interactive action button inside the panel above.');
        }
      }

      // ------------------------------------------
      // 5. BASIC INLINE CALCULATORS (4 tools; other 26 calculators & all 20 unit converters run in CalcUnitWorkspace)
      // ------------------------------------------
      else if (tool.category === 'calculator' && BASIC_CALCULATOR_IDS.includes(tool.id)) {
        if (tool.id === 'loan-emi-calculator') {
          const res = calculateLoanEmi(calcPrincipal, calcRate, calcTenure);
          setOutputResultText(
            `Monthly EMI: ${selectedCurrency.symbol} ${res.monthlyEmi.toLocaleString()} ${selectedCurrency.code}\nTotal Payment: ${selectedCurrency.symbol} ${res.totalPayment.toLocaleString()}\nTotal Interest: ${selectedCurrency.symbol} ${res.totalInterest.toLocaleString()}\nTenure: ${res.tenureMonths} Months (${calcTenure} Years)`
          );
        } else if (tool.id === 'bmi-calculator') {
          const res = calculateBmi(calcWeight, calcHeight);
          setOutputResultText(`BMI Score: ${res.bmi}\nClassification: ${res.category}\nHealthy Target Range: 18.5 – 24.9`);
        } else if (tool.id === 'age-calculator') {
          const res = calculateAge(calcBirthDate);
          if (!res.valid) throw new Error(res.message);
          const daysLived = res.totalDaysLived ?? 0;
          setOutputResultText(
            `Exact Age: ${res.years ?? 0} years, ${res.months ?? 0} months, ${res.days ?? 0} days\nDays Lived: ${daysLived.toLocaleString()} days\nNext Birthday In: ${res.daysUntilNextBirthday ?? 0} days`
          );
        } else if (tool.id === 'gst-calculator') {
          const res = calculateGst(calcGstAmount, calcGstRate);
          setOutputResultText(
            `Base Net Amount: ${selectedCurrency.symbol} ${res.baseAmount} ${selectedCurrency.code}\nTax (${calcGstRate}%): ${selectedCurrency.symbol} ${res.gstAmount}\nGross Total: ${selectedCurrency.symbol} ${res.totalAmount}\nSplit CGST/SGST: ${selectedCurrency.symbol} ${res.cgst} each`
          );
        }
      }

      if (processedBlob) {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultBlob(processedBlob);
        setResultUrl(URL.createObjectURL(processedBlob));
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
    if (currentJobId) jobProcessor.cancelJob(currentJobId);
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage('Cancelled');
  };

  const handleReset = () => {
    setSelectedFiles([]);
    filePreviews.forEach((u) => URL.revokeObjectURL(u));
    setFilePreviews([]);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultFileName('');
    setOutputResultText('');
    setErrorMessage(null);
    setProgress(0);
    setSvgVectorResult(null);
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

  const showPrimaryExecuteButton =
    tool.category === 'pdf' ||
    tool.category === 'image' ||
    tool.category === 'developer' ||
    tool.category === 'text' ||
    (tool.category === 'calculator' && BASIC_CALCULATOR_IDS.includes(tool.id));

  const showFileDropzone =
    (tool.category === 'pdf' && tool.id !== 'text-to-pdf' && tool.id !== 'html-to-pdf') ||
    tool.category === 'image';

  const allowMultipleUpload = [
    'merge-pdf',
    'jpg-to-pdf',
    'png-to-pdf',
    'scan-to-pdf',
    'image-to-pdf',
    'image-collage-maker',
  ].includes(tool.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <button type="button" onClick={() => onNavigate('home')} className="hover:text-slate-200 transition-colors">
          Home
        </button>
        <span>/</span>
        <button type="button" onClick={() => onNavigate('category', tool.category)} className="hover:text-slate-200 capitalize transition-colors">
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
              <span className="text-[11px] font-bold capitalize tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {tool.category.replace(/-/g, ' ')} Tool
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
              type="button"
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
            <span className="font-semibold text-slate-200 leading-snug block mt-0.5">{tool.processingEngine}</span>
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
            <span className="font-semibold text-rose-400 block mt-0.5">$0 / Free Forever</span>
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
            {/* Visual 3-Step Workflow Stepper & Toolbar */}
            <ToolCustomControls
              tool={tool}
              hasInput={selectedFiles.length > 0 || inputText.trim().length > 0 || !showFileDropzone}
              isProcessing={isProcessing}
              hasResult={!!(resultUrl || outputResultText || svgVectorResult)}
              pdfPreset={pdfCompressionPreset}
              onPdfPresetChange={setPdfCompressionPreset}
              rotateDegrees={rotateDegrees}
              onRotateDegreesChange={setRotateDegrees}
              splitRange={splitPageRange}
              onSplitRangeChange={(val) => {
                setSplitPageRange(val);
                setDeletePageNumbers(val);
              }}
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

            {/* PDF / Image File Dropzone */}
            {showFileDropzone && (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
                      : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={allowMultipleUpload}
                    accept={tool.inputFormats.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-950/20">
                    <Upload className="w-7 h-7" />
                  </div>

                  <div className="text-base font-bold text-white mb-1">
                    Drop your file{allowMultipleUpload ? 's' : ''} here, or <span className="text-rose-400 underline underline-offset-2">browse computer</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Supports {tool.inputFormats.join(', ')} • Maximum file size {tool.maxFileSizeMB} MB
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Selected Files ({selectedFiles.length})</span>
                      <button type="button" onClick={handleReset} className="text-rose-400 hover:text-rose-300 text-xs">Clear All</button>
                    </div>
                    {selectedFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200">
                        <div className="flex items-center gap-3 truncate">
                          <span className="font-mono text-slate-500 font-bold">{idx + 1}.</span>
                          <span className="font-medium truncate">{file.name}</span>
                          <span className="text-slate-500 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(idx)} className="p-1 text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specialized Advanced PDF & Image Controls */}
            {(tool.category === 'pdf' || tool.category === 'image') && (
              <PdfImageAdvancedWorkspace
                tool={tool}
                selectedFiles={selectedFiles}
                pdfParams={pdfParams}
                onPdfParamsChange={(next) => setPdfParams((p) => ({ ...p, ...next }))}
                imageParams={imageParams}
                onImageParamsChange={(next) => setImageParams((p) => ({ ...p, ...next }))}
                onResultTextGenerated={setOutputResultText}
              />
            )}

            {/* Specialized PDF Metadata Inputs */}
            {tool.id === 'pdf-metadata-editor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <div>
                  <label htmlFor="pdf-meta-title" className="block text-slate-400 mb-1">PDF Document Title</label>
                  <input id="pdf-meta-title" type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" />
                </div>
                <div>
                  <label htmlFor="pdf-meta-author" className="block text-slate-400 mb-1">PDF Author</label>
                  <input id="pdf-meta-author" type="text" value={metaAuthor} onChange={(e) => setMetaAuthor(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" />
                </div>
              </div>
            )}

            {/* Specialized SEO / Security / Social Media Workspaces */}
            {(tool.category === 'seo' || tool.category === 'security' || tool.category === 'social-media') && (
              <SeoSecuritySocialWorkspace
                tool={tool}
                onResultGenerated={setOutputResultText}
                onBlobGenerated={handleWorkspaceBlob}
              />
            )}

            {/* Specialized Audio & Video Workspaces */}
            {(tool.category === 'audio' || tool.category === 'video') && (
              <MediaAudioVideoWorkspace
                tool={tool}
                onResultGenerated={setOutputResultText}
                onBlobGenerated={handleWorkspaceBlob}
              />
            )}

            {/* Specialized Education Workspace */}
            {tool.category === 'education' && (
              <EducationToolsWorkspace tool={tool} onResultGenerated={setOutputResultText} />
            )}

            {/* Specialized Calculator & Unit Converter Workspace (all 20 converters + 26 advanced calculators) */}
            {(tool.category === 'unit-converter' ||
              (tool.category === 'calculator' && !BASIC_CALCULATOR_IDS.includes(tool.id))) && (
              <CalcUnitWorkspace tool={tool} currency={selectedCurrency} onResultGenerated={setOutputResultText} />
            )}

            {/* Basic Inline Calculators (4 tools) */}
            {tool.category === 'calculator' && BASIC_CALCULATOR_IDS.includes(tool.id) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tool.id === 'loan-emi-calculator' && (
                  <>
                    <div>
                      <label htmlFor="emi-p" className="block text-xs font-bold text-slate-300 mb-1">Principal Amount ({selectedCurrency.symbol})</label>
                      <input id="emi-p" type="number" value={calcPrincipal} onChange={(e) => setCalcPrincipal(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label htmlFor="emi-r" className="block text-xs font-bold text-slate-300 mb-1">Annual Interest Rate (%)</label>
                      <input id="emi-r" type="number" step="0.1" value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label htmlFor="emi-t" className="block text-xs font-bold text-slate-300 mb-1">Tenure (Years)</label>
                      <input id="emi-t" type="number" value={calcTenure} onChange={(e) => setCalcTenure(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                  </>
                )}

                {tool.id === 'bmi-calculator' && (
                  <>
                    <div>
                      <label htmlFor="bmi-w" className="block text-xs font-bold text-slate-300 mb-1">Weight (kg)</label>
                      <input id="bmi-w" type="number" value={calcWeight} onChange={(e) => setCalcWeight(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label htmlFor="bmi-h" className="block text-xs font-bold text-slate-300 mb-1">Height (cm)</label>
                      <input id="bmi-h" type="number" value={calcHeight} onChange={(e) => setCalcHeight(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                  </>
                )}

                {tool.id === 'age-calculator' && (
                  <div>
                    <label htmlFor="age-dob" className="block text-xs font-bold text-slate-300 mb-1">Date of Birth</label>
                    <input id="age-dob" type="date" value={calcBirthDate} onChange={(e) => setCalcBirthDate(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                )}

                {tool.id === 'gst-calculator' && (
                  <>
                    <div>
                      <label htmlFor="gst-amt" className="block text-xs font-bold text-slate-300 mb-1">Invoice Amount ({selectedCurrency.symbol})</label>
                      <input id="gst-amt" type="number" value={calcGstAmount} onChange={(e) => setCalcGstAmount(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                    <div>
                      <label htmlFor="gst-rate" className="block text-xs font-bold text-slate-300 mb-1">Tax / GST Rate (%)</label>
                      <select id="gst-rate" value={calcGstRate} onChange={(e) => setCalcGstRate(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                        {[5, 10, 12, 15, 18, 20, 28].map((r) => (
                          <option key={r} value={r}>{r}%</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Specialized Developer & Text Workspace */}
            {(tool.category === 'developer' || tool.category === 'text') && (
              <DevTextWorkspace
                tool={tool}
                inputText={inputText}
                onInputTextChange={setInputText}
                onResultGenerated={setOutputResultText}
                sortMode={textSortMode}
                onSortModeChange={setTextSortMode}
                reverseMode={textReverseMode}
                onReverseModeChange={setTextReverseMode}
              />
            )}

            {/* Primary Textarea Payload Input (Developer, Text, and Text-to-PDF) */}
            {(tool.category === 'developer' || tool.category === 'text' || tool.id === 'text-to-pdf') && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="primary-text-payload" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Input Content / Code / Payload
                  </label>
                  <textarea
                    id="primary-text-payload"
                    rows={6}
                    placeholder="Paste your text, code, JSON, SQL, or payload here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                  />
                </div>

                {tool.id === 'text-diff-checker' && (
                  <div>
                    <label htmlFor="secondary-text-payload" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Comparison Text (Modified Version)
                    </label>
                    <textarea
                      id="secondary-text-payload"
                      rows={6}
                      placeholder="Paste modified text to compare..."
                      value={inputSecondaryText}
                      onChange={(e) => setInputSecondaryText(e.target.value)}
                      className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                    />
                  </div>
                )}
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
                  <div className="bg-gradient-to-r from-rose-600 to-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Primary Action Button (shown for tools that execute via unified runner) */}
            {showPrimaryExecuteButton && (
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
                      <span>Execute &amp; Generate {tool.name}</span>
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
            )}

            {/* Live Visual & Text Output Results */}
            {(resultUrl || outputResultText || svgVectorResult) && (
              <div className="border-t border-slate-800 pt-6 space-y-4">
                {resultUrl && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white">File Output Ready!</div>
                        <div className="text-xs text-slate-400 truncate">
                          {resultFileName || 'Generated output ready'} {resultBlob ? `• ${(resultBlob.size / 1024).toFixed(1)} KB` : ''}
                        </div>
                      </div>
                    </div>

                    <a
                      href={resultUrl}
                      download={resultFileName || 'download'}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Output</span>
                    </a>
                  </div>
                )}

                {/* QR Code Preview */}
                {tool.id === 'qr-code-generator' && qrOutputUrl && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <img src={qrOutputUrl} alt="Generated QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-lg border border-slate-800" />
                  </div>
                )}

                {/* Visual Processed Image Preview */}
                {tool.category === 'image' && resultUrl && tool.id !== 'image-to-pdf' && tool.id !== 'image-base64-converter' && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Result Preview</div>
                    <img
                      src={resultUrl}
                      alt="Processed Image Output"
                      className="max-h-80 mx-auto rounded-lg shadow-md border border-slate-800 object-contain"
                    />
                  </div>
                )}

                {/* Audio / Video Playback Preview */}
                {(tool.category === 'audio' || tool.category === 'video') && resultUrl && resultBlob?.type.startsWith('audio/') && (
                  <audio src={resultUrl} controls className="w-full" />
                )}
                {tool.category === 'video' && resultUrl && resultBlob?.type.startsWith('video/') && (
                  <video src={resultUrl} controls className="w-full max-h-80 rounded-xl bg-black border border-slate-800" />
                )}

                {/* Output Result Text Box */}
                {outputResultText && (
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output Result</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(outputResultText)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                      </button>
                    </div>
                    <textarea
                      aria-label="Output Result Text"
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

      {/* Technical Specifications Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Technical Specifications &amp; Privacy Isolation</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Processing Layer</span>
            <span className="text-slate-200 font-semibold mt-1 block">100% Client-Side WebAssembly</span>
            <span className="text-emerald-400 text-[11px] mt-0.5 block">Zero Cloud Server Egress</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Security Standard</span>
            <span className="text-slate-200 font-semibold mt-1 block">GDPR &amp; CCPA Compliant</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">Auto-memory garbage cleanup</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Service Pricing</span>
            <span className="text-rose-400 font-semibold mt-1 block">$0.00 / Free Forever</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">No subscription or limits</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Device Support</span>
            <span className="text-slate-200 font-semibold mt-1 block">Cross-Platform Web SPA</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">Desktop, iOS, Android, Linux</span>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-rose-400" />
          <span>Why Choose MultipleDarkNews {tool.name}?</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Unlike ordinary cloud conversion websites that upload your personal documents and images to third-party remote servers,
          <strong className="text-white"> MultipleDarkNews Tools</strong> executes directly inside your browser sandbox using
          WebAssembly, Web Audio, Canvas 2D, and Web Crypto APIs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Uncompromised Quality
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintains true lossless rasterization and strict color profiles with zero artifacts.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> No Watermarks Ever
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exports are 100% clean and unbranded, ready for global business, academic, and personal workflows.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Instant Execution
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zero network upload wait times. Operations run directly in your local device memory.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step How-To Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          <span>Step-by-Step Guide: How to use {tool.name}</span>
        </h3>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <li className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-extrabold text-rose-400 text-base block mb-1">01. Provide Input</span>
            Drop your file, record audio/video, or enter parameters into the workspace above.
          </li>
          <li className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-extrabold text-rose-400 text-base block mb-1">02. Configure Options</span>
            Tailor execution parameters such as region, currency, quality, format, or algorithm.
          </li>
          <li className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-extrabold text-rose-400 text-base block mb-1">03. Export Locally</span>
            Download or copy your processed result directly from browser memory.
          </li>
        </ol>
      </div>

      {/* Interactive Expandable FAQs */}
      {tool.faq.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>Frequently Asked Questions</span>
          </h3>
          <div className="space-y-3">
            {tool.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden">
                  <button
                    type="button"
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

      {/* Related Tools Internal Link Grid */}
      {relatedTools.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Related {tool.category.toUpperCase()} Tools</span>
            <button
              type="button"
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
                type="button"
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
