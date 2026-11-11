import React from 'react';
import {
  Sliders,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  RotateCw,
  Hash,
  Globe,
  Scissors,
  Bookmark,
  Layers,
  ArrowUpDown,
  Lock,
  Unlock,
  Eye,
  Check,
  Zap,
  CheckCircle2,
  FileCheck,
  Download,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
}

export const GLOBAL_CURRENCIES: CurrencyItem[] = [
  { code: 'USD', symbol: '$', name: 'USA & Global ($)' },
  { code: 'EUR', symbol: '€', name: 'Europe (€)' },
  { code: 'GBP', symbol: '£', name: 'United Kingdom (£)' },
  { code: 'CAD', symbol: 'C$', name: 'Canada (C$)' },
  { code: 'INR', symbol: '₹', name: 'India (₹)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE / Dubai (AED)' },
  { code: 'NGN', symbol: '₦', name: 'Nigeria (₦)' },
  { code: 'AUD', symbol: 'A$', name: 'Australia (A$)' },
];

interface ToolCustomControlsProps {
  tool: ToolDefinition;
  hasInput: boolean;
  isProcessing: boolean;
  hasResult: boolean;

  // PDF Props
  pdfPreset: 'low' | 'medium' | 'high';
  onPdfPresetChange: (p: 'low' | 'medium' | 'high') => void;
  rotateDegrees: 90 | 180 | 270;
  onRotateDegreesChange: (d: 90 | 180 | 270) => void;
  splitRange: string;
  onSplitRangeChange: (r: string) => void;
  watermarkText: string;
  onWatermarkTextChange: (t: string) => void;
  watermarkOpacity: number;
  onWatermarkOpacityChange: (o: number) => void;
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-right';
  onPageNumberPositionChange: (pos: 'bottom-center' | 'bottom-right' | 'top-right') => void;

  // Image Props
  imageQuality: number;
  onImageQualityChange: (q: number) => void;
  imageFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  onImageFormatChange: (f: 'image/jpeg' | 'image/png' | 'image/webp') => void;
  resizeWidth: number;
  onResizeWidthChange: (w: number) => void;
  resizeHeight: number;
  onResizeHeightChange: (h: number) => void;
  lockAspectRatio: boolean;
  onLockAspectRatioChange: (l: boolean) => void;
  passportFormat: 'us_2x2' | 'india_35x45';
  onPassportFormatChange: (f: 'us_2x2' | 'india_35x45') => void;
  memeTopText: string;
  onMemeTopTextChange: (t: string) => void;
  memeBottomText: string;
  onMemeBottomTextChange: (t: string) => void;

  // Developer Props
  jsonIndent: number;
  onJsonIndentChange: (indent: number) => void;
  onLoadSampleJson: () => void;
  onMinifyJson: () => void;
  hashAlgorithm: 'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5';
  onHashAlgorithmChange: (algo: 'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5') => void;
  qrSize: number;
  onQrSizeChange: (s: number) => void;

  // Calculator Props
  currency: CurrencyItem;
  onCurrencyChange: (c: CurrencyItem) => void;
  calcPrincipal: number;
  onCalcPrincipalChange: (p: number) => void;
  calcRate: number;
  onCalcRateChange: (r: number) => void;
  calcTenure: number;
  onCalcTenureChange: (t: number) => void;
  calcBirthDate: string;
  onCalcBirthDateChange: (d: string) => void;
  calcGstAmount: number;
  onCalcGstAmountChange: (a: number) => void;
  calcGstRate: number;
  onCalcGstRateChange: (r: number) => void;
  calcWeight: number;
  onCalcWeightChange: (w: number) => void;
  calcHeight: number;
  onCalcHeightChange: (h: number) => void;

  // Text Props
  inputText: string;
  onCaseConvert: (type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab') => void;
}

export const ToolCustomControls: React.FC<ToolCustomControlsProps> = ({
  tool,
  hasInput,
  isProcessing,
  hasResult,

  // PDF
  pdfPreset,
  onPdfPresetChange,
  rotateDegrees,
  onRotateDegreesChange,
  splitRange,
  onSplitRangeChange,
  watermarkText,
  onWatermarkTextChange,
  watermarkOpacity,
  onWatermarkOpacityChange,
  pageNumberPosition,
  onPageNumberPositionChange,

  // Image
  imageQuality,
  onImageQualityChange,
  imageFormat,
  onImageFormatChange,
  resizeWidth,
  onResizeWidthChange,
  resizeHeight,
  onResizeHeightChange,
  lockAspectRatio,
  onLockAspectRatioChange,
  passportFormat,
  onPassportFormatChange,
  memeTopText,
  onMemeTopTextChange,
  memeBottomText,
  onMemeBottomTextChange,

  // Developer
  jsonIndent,
  onJsonIndentChange,
  onLoadSampleJson,
  onMinifyJson,
  hashAlgorithm,
  onHashAlgorithmChange,
  qrSize,
  onQrSizeChange,

  // Calculator
  currency,
  onCurrencyChange,
  calcPrincipal,
  onCalcPrincipalChange,
  calcRate,
  onCalcRateChange,
  calcTenure,
  onCalcTenureChange,
  calcBirthDate,
  onCalcBirthDateChange,
  calcGstAmount,
  onCalcGstAmountChange,
  calcGstRate,
  onCalcGstRateChange,
  calcWeight,
  onCalcWeightChange,
  calcHeight,
  onCalcHeightChange,

  // Text
  inputText,
  onCaseConvert,
}) => {
  // Determine current active step
  const step = hasResult ? 3 : hasInput ? 2 : 1;

  // Live text metrics
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const charNoSpaces = inputText.replace(/\s/g, '').length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-6">
      {/* 1. VISUAL 3-STEP WORKFLOW TRACKER */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            Standard Workflow Architecture
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {step === 1 && 'Step 1 of 3: Provide Input'}
            {step === 2 && 'Step 2 of 3: Tailor Parameters'}
            {step === 3 && 'Step 3 of 3: Results Ready'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Step 1 Pill */}
          <div
            className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
              step >= 1
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-slate-950/40 border-slate-900 text-slate-600'
            } ${step === 1 ? 'ring-1 ring-rose-500/60 shadow-[0_0_15px_rgba(255,38,56,0.15)]' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                hasInput
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {hasInput ? '✓' : '01'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">01. Input Source</div>
              <div className="text-[10px] text-slate-400 truncate">
                {tool.category === 'pdf' || tool.category === 'image'
                  ? 'Drop or select file'
                  : 'Enter string or parameters'}
              </div>
            </div>
          </div>

          {/* Step 2 Pill */}
          <div
            className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
              step >= 2
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-slate-950/40 border-slate-900 text-slate-600'
            } ${step === 2 ? 'ring-1 ring-rose-500/60 shadow-[0_0_15px_rgba(255,38,56,0.15)]' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                step >= 2
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              02
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">02. Tailor Parameters</div>
              <div className="text-[10px] text-slate-400 truncate">
                Presets, algorithms &amp; options
              </div>
            </div>
          </div>

          {/* Step 3 Pill */}
          <div
            className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
              step === 3
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-slate-950/40 border-slate-900 text-slate-600'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                hasResult
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {hasResult ? '✓' : '03'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">03. In-Browser Export</div>
              <div className="text-[10px] text-slate-400 truncate">
                100% private unwatermarked output
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAILORED WORKFLOW CONTROLS ACCORDING TO TOOL CATEGORY & TYPE */}

      {/* A. PDF SPECIFIC WORKFLOW CONTROLS */}
      {tool.category === 'pdf' && (
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              PDF Workflow Configuration
            </span>
            <span className="text-[10px] font-mono text-slate-500">ENGINE: PDF-LIB / WEBASSEMBLY</span>
          </div>

          {/* PDF Compressor Presets */}
          {(tool.id === 'pdf-compressor' || tool.id === 'compress-pdf') && (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">
                Select Compression Density Preset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => onPdfPresetChange('high')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    pdfPreset === 'high'
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>⚡ Extreme Compression</span>
                    {pdfPreset === 'high' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ~80% smaller size. Best for email and portal limits.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPdfPresetChange('medium')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    pdfPreset === 'medium'
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>⚖️ Recommended</span>
                    {pdfPreset === 'medium' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ~60% smaller size with sharp text &amp; images.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPdfPresetChange('low')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    pdfPreset === 'low'
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🖨️ High Print Quality</span>
                    {pdfPreset === 'low' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ~30% smaller size with true raster fidelity.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PDF Rotate Controls */}
          {(tool.id === 'rotate-pdf' || tool.id === 'pdf-rotator') && (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">
                Choose Rotation Angle:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { deg: 90 as const, label: '90° Clockwise ↷' },
                  { deg: 180 as const, label: '180° Invert 🔃' },
                  { deg: 270 as const, label: '270° Counter ↶' },
                ].map((item) => (
                  <button
                    key={item.deg}
                    type="button"
                    onClick={() => onRotateDegreesChange(item.deg)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rotateDegrees === item.deg
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Split / Delete Pages Controls */}
          {(tool.id === 'split-pdf' || tool.id === 'delete-pdf-pages') && (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">
                Specify Page Numbers or Ranges:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => onSplitRangeChange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => onSplitRangeChange('1-5')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  1-5
                </button>
                <button
                  type="button"
                  onClick={() => onSplitRangeChange('odd')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  Odd
                </button>
                <button
                  type="button"
                  onClick={() => onSplitRangeChange('even')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  Even
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                Tip: Enter single pages (e.g. <code className="text-rose-400">1, 4</code>) or spans (e.g. <code className="text-rose-400">2-6</code>).
              </div>
            </div>
          )}

          {/* Watermark PDF Controls */}
          {tool.id === 'watermark-pdf' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Watermark Text:
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => onWatermarkTextChange(e.target.value)}
                    placeholder="CONFIDENTIAL"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono font-bold"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {['CONFIDENTIAL', 'SAMPLE', 'DRAFT', 'DO NOT COPY'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onWatermarkTextChange(preset)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 border border-slate-800"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Opacity:</span>
                    <span className="font-mono text-rose-400 font-bold">{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => onWatermarkOpacityChange(Number(e.target.value))}
                    className="w-full accent-rose-500 mt-2"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Light transparent watermark preserves document readability.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Page Numbers Controls */}
          {(tool.id === 'pdf-page-number' || tool.id === 'add-page-numbers-to-pdf') && (
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">
                Number Position:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { pos: 'bottom-center' as const, label: 'Bottom Center' },
                  { pos: 'bottom-right' as const, label: 'Bottom Right' },
                  { pos: 'top-right' as const, label: 'Top Right' },
                ].map((item) => (
                  <button
                    key={item.pos}
                    type="button"
                    onClick={() => onPageNumberPositionChange(item.pos)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      pageNumberPosition === item.pos
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* B. IMAGE SPECIFIC WORKFLOW CONTROLS */}
      {tool.category === 'image' && (
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-rose-400" />
              Image Engine Configuration
            </span>
            <span className="text-[10px] font-mono text-slate-500">CANVAS 2D / LOSSLESS</span>
          </div>

          {/* Image Compression & Format Controls */}
          {(tool.id === 'image-compressor' || tool.id === 'compress-image') && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Compression Quality: <strong className="text-rose-400 font-mono text-sm">{imageQuality}%</strong></span>
                  <span className="text-[11px] text-slate-500">
                    {imageQuality >= 80 ? 'Optimal Web Visuals' : imageQuality >= 50 ? 'Medium Size Savings' : 'Maximum Size Reduction'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={imageQuality}
                  onChange={(e) => onImageQualityChange(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-2">
                  Target Export Format:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { format: 'image/webp' as const, label: 'WebP (Modern / Ultra Fast)' },
                    { format: 'image/jpeg' as const, label: 'JPEG (Universal Compatibility)' },
                    { format: 'image/png' as const, label: 'PNG (Lossless Transparency)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.format}
                      type="button"
                      onClick={() => onImageFormatChange(fmt.format)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        imageFormat === fmt.format
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Resizer with Presets */}
          {(tool.id === 'image-resizer' || tool.id === 'resize-image') && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-2">
                  Global Social Media &amp; Standard Presets:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Instagram Post', w: 1080, h: 1080 },
                    { name: 'Story / Reel', w: 1080, h: 1920 },
                    { name: 'YouTube Thumb', w: 1280, h: 720 },
                    { name: 'Full HD (1080p)', w: 1920, h: 1080 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        onResizeWidthChange(preset.w);
                        onResizeHeightChange(preset.h);
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-left"
                    >
                      <div className="font-bold text-white truncate">{preset.name}</div>
                      <div className="text-[10px] text-rose-400 font-mono">{preset.w} × {preset.h} px</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Custom Width (px):</label>
                  <input
                    type="number"
                    value={resizeWidth}
                    onChange={(e) => onResizeWidthChange(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Custom Height (px):</label>
                  <input
                    type="number"
                    value={resizeHeight}
                    onChange={(e) => onResizeHeightChange(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passport Photo Embassy Presets */}
          {tool.id === 'passport-photo-maker' && (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">
                Official Visa &amp; Passport Embassy Standard:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onPassportFormatChange('us_2x2')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    passportFormat === 'us_2x2'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">🇺🇸 US Visa / Passport (2 × 2 Inches)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    600 × 600 px at 300 DPI. Compliant with US Department of State.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPassportFormatChange('india_35x45')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    passportFormat === 'india_35x45'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">🇮🇳 Indian Passport / PAN / Schengen (35 × 45 mm)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    413 × 531 px at 300 DPI. Compliant with European &amp; Indian embassies.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Meme Generator Captions */}
          {tool.id === 'meme-generator' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Top Caption Text:</label>
                <input
                  type="text"
                  value={memeTopText}
                  onChange={(e) => onMemeTopTextChange(e.target.value)}
                  placeholder="WHEN THE CODE FINALLY..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bottom Caption Text:</label>
                <input
                  type="text"
                  value={memeBottomText}
                  onChange={(e) => onMemeBottomTextChange(e.target.value)}
                  placeholder="WORKS ON THE FIRST TRY!"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* C. DEVELOPER SPECIFIC WORKFLOW CONTROLS */}
      {tool.category === 'developer' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-rose-400" />
              Developer Payload Toolbar
            </span>
            <span className="text-[10px] font-mono text-emerald-400">100% IN-BROWSER PARSER</span>
          </div>

          {/* JSON Formatter Quick Buttons */}
          {(tool.id === 'json-formatter' || tool.id === 'json-validator' || tool.id === 'json-minifier') && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onLoadSampleJson}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-rose-300"
              >
                📋 Load Sample JSON
              </button>
              <button
                type="button"
                onClick={() => onJsonIndentChange(2)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                  jsonIndent === 2 ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                2 Spaces
              </button>
              <button
                type="button"
                onClick={() => onJsonIndentChange(4)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                  jsonIndent === 4 ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                4 Spaces
              </button>
              <button
                type="button"
                onClick={onMinifyJson}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
              >
                ⚡ Minify (1 Line)
              </button>
            </div>
          )}

          {/* QR Code Size Slider */}
          {tool.id === 'qr-code-generator' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>QR Code Output Resolution:</span>
                <span className="font-mono text-rose-400 font-bold">{qrSize} × {qrSize} px</span>
              </div>
              <input
                type="range"
                min="150"
                max="600"
                step="25"
                value={qrSize}
                onChange={(e) => onQrSizeChange(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          )}

          {/* Hash Algorithm Selector */}
          {(tool.id === 'hash-generator' || tool.id === 'sha256-hash-generator' || tool.id === 'md5-hash-generator') && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Algorithm:</span>
              {(['SHA-256', 'SHA-512', 'SHA-1', 'MD5'] as const).map((algo) => (
                <button
                  key={algo}
                  type="button"
                  onClick={() => onHashAlgorithmChange(algo)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                    hashAlgorithm === algo
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* D. CALCULATOR GLOBAL CURRENCY & ADVANCED CONTROLS */}
      {tool.category === 'calculator' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Global Currency &amp; Mathematical Engine
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-normal">Active Currency:</span>
              <select
                value={currency.code}
                onChange={(e) => {
                  const found = GLOBAL_CURRENCIES.find((c) => c.code === e.target.value);
                  if (found) onCurrencyChange(found);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
              >
                {GLOBAL_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* E. TEXT TOOLS QUICK 1-CLICK ACTIONS & LIVE METRICS BAR */}
      {tool.category === 'text' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          {/* Live Text Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block font-mono">WORDS</span>
              <span className="text-sm font-bold text-white font-mono">{wordCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block font-mono">CHARACTERS</span>
              <span className="text-sm font-bold text-white font-mono">{charCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block font-mono">NO SPACES</span>
              <span className="text-sm font-bold text-white font-mono">{charNoSpaces}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block font-mono">READ TIME</span>
              <span className="text-sm font-bold text-rose-400 font-mono">~{readingTime} min</span>
            </div>
          </div>

          {/* Case Converter 1-Click Action Buttons */}
          {(tool.id === 'case-converter' || tool.id === 'text-case-converter') && (
            <div className="space-y-2 pt-1">
              <span className="text-xs text-slate-400 block font-semibold">1-Click Transformation:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'upper' as const, label: 'UPPERCASE' },
                  { type: 'lower' as const, label: 'lowercase' },
                  { type: 'title' as const, label: 'Title Case' },
                  { type: 'sentence' as const, label: 'Sentence case' },
                  { type: 'camel' as const, label: 'camelCase' },
                  { type: 'snake' as const, label: 'snake_case' },
                  { type: 'kebab' as const, label: 'kebab-case' },
                ].map((btn) => (
                  <button
                    key={btn.type}
                    type="button"
                    onClick={() => onCaseConvert(btn.type)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 hover:text-white border border-slate-800 text-xs font-mono font-medium text-slate-300 transition-colors"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
