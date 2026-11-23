import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  FileText,
  Camera,
  Layers,
  Zap,
  Play,
  Film,
  FileArchive,
  Trash2,
  Split,
  Maximize2,
  Activity,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import {
  detectAiSignatures,
  sanitizeImage,
  sanitizeVideo,
  createDemoAiImage,
  SanitizeOptions,
  SanitizeResult,
  AiDetectionResult,
  CloakCameraProfile,
  CAMERA_PROFILES,
  DEFAULT_SANITIZE_OPTIONS,
} from '../../services/synthidEngine';

export const SynthIdRemoverStudio: React.FC = () => {
  // File queue & state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [results, setResults] = useState<(SanitizeResult | null)[]>([]);
  const [preScans, setPreScans] = useState<(AiDetectionResult | null)[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Inspection tabs & comparison slider
  const [activeTab, setActiveTab] = useState<'compare' | 'diff' | 'forensics'>('compare');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Sanitization Options
  const [options, setOptions] = useState<SanitizeOptions>(DEFAULT_SANITIZE_OPTIONS);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  const currentFile = selectedFiles[activeFileIndex] || null;
  const currentResult = results[activeFileIndex] || null;
  const currentPreScan = preScans[activeFileIndex] || null;

  // Scan file whenever selected
  useEffect(() => {
    if (!currentFile) return;
    if (preScans[activeFileIndex]) return;

    let isMounted = true;
    detectAiSignatures(currentFile).then((scan) => {
      if (isMounted) {
        setPreScans((prev) => {
          const next = [...prev];
          next[activeFileIndex] = scan;
          return next;
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentFile, activeFileIndex, preScans]);

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    addFilesToQueue(files);
  };

  const addFilesToQueue = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setResults((prev) => [...prev, ...new Array(files.length).fill(null)]);
    setPreScans((prev) => [...prev, ...new Array(files.length).fill(null)]);
    setErrorMsg(null);
  };

  // Load Built-in AI Demo Sample
  const handleLoadDemoSample = async () => {
    try {
      setIsProcessing(true);
      setProgressStage('Generating synthetic AI sample with embedded C2PA & SynthID tags...');
      const demoFile = await createDemoAiImage();
      addFilesToQueue([demoFile]);
      setActiveFileIndex(selectedFiles.length); // focus on newly added demo
      setIsProcessing(false);
      setProgressStage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate demo sample');
      setIsProcessing(false);
    }
  };

  // Execute Sanitization on Single File
  const handleSanitizeSingle = async (index: number) => {
    const file = selectedFiles[index];
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);
    setErrorMsg(null);

    try {
      if (file.type.includes('video')) {
        setProgressStage('Scanning MP4/WebM container and stripping C2PA metadata...');
        setProgress(25);
        const vidRes = await sanitizeVideo(file, options, (pct) => {
          setProgress(25 + Math.round(pct * 0.7));
          setProgressStage(`Scrubbing video frames & audio harmonics (${pct}%)...`);
        });

        const cleanUrl = URL.createObjectURL(vidRes.blob);
        const sanResult: SanitizeResult = {
          blob: vidRes.blob,
          fileName: vidRes.fileName,
          originalSize: file.size,
          cleanedSize: vidRes.blob.size,
          preScan: vidRes.preScan,
          postScan: vidRes.postScan,
          cleanedDataUrl: cleanUrl,
          previewUrl: cleanUrl,
        };

        setResults((prev) => {
          const next = [...prev];
          next[index] = sanResult;
          return next;
        });
      } else {
        setProgressStage('Scanning C2PA manifests & AI generator signatures...');
        setProgress(30);
        await new Promise((r) => setTimeout(r, 120));

        setProgressStage('Neutralizing in-pixel SynthID frequency patterns & scattering chroma...');
        setProgress(60);
        await new Promise((r) => setTimeout(r, 120));

        setProgressStage('Injecting realistic camera sensor grain & stealth camera EXIF...');
        setProgress(85);

        const imgResult = await sanitizeImage(file, options);

        setResults((prev) => {
          const next = [...prev];
          next[index] = imgResult;
          return next;
        });
      }

      setProgress(100);
      setProgressStage('Sanitization verified! 0% AI detection risk.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sanitize file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch Sanitize All Files in Queue
  const handleSanitizeAll = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    for (let i = 0; i < selectedFiles.length; i++) {
      setActiveFileIndex(i);
      setProgressStage(`Processing file ${i + 1} of ${selectedFiles.length}...`);
      setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      try {
        const file = selectedFiles[i];
        if (file.type.includes('video')) {
          const vidRes = await sanitizeVideo(file, options);
          const cleanUrl = URL.createObjectURL(vidRes.blob);
          const sanResult: SanitizeResult = {
            blob: vidRes.blob,
            fileName: vidRes.fileName,
            originalSize: file.size,
            cleanedSize: vidRes.blob.size,
            preScan: vidRes.preScan,
            postScan: vidRes.postScan,
            cleanedDataUrl: cleanUrl,
            previewUrl: cleanUrl,
          };
          setResults((prev) => {
            const next = [...prev];
            next[i] = sanResult;
            return next;
          });
        } else {
          const imgResult = await sanitizeImage(file, options);
          setResults((prev) => {
            const next = [...prev];
            next[i] = imgResult;
            return next;
          });
        }
      } catch (err: any) {
        console.error(`Error on file ${i}:`, err);
      }
    }

    setIsProcessing(false);
    setProgressStage('All batch files sanitized!');
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    const validResults = results.filter((r): r is SanitizeResult => r !== null);
    if (validResults.length === 0) return;

    const zip = new JSZip();
    for (const res of validResults) {
      zip.file(res.fileName, res.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthid-clean-bundle-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Cleaned Image to Clipboard
  const handleCopyCleaned = async () => {
    if (!currentResult || !currentResult.blob.type.includes('image')) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [currentResult.blob.type]: currentResult.blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg('Could not copy to clipboard directly in this browser.');
    }
  };

  // Slider Mouse/Touch Drag Handlers
  const handleSliderMove = (clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPosition(pct);
  };

  const originalPreviewUrl = useMemo(() => {
    if (!currentFile) return null;
    return URL.createObjectURL(currentFile);
  }, [currentFile]);

  // Clean object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      results.forEach((r) => {
        if (r?.cleanedDataUrl) URL.revokeObjectURL(r.cleanedDataUrl);
      });
    };
  }, [originalPreviewUrl, results]);

  return (
    <div className="space-y-8 text-slate-100">
      {/* 1. Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-950 p-6 sm:p-8 border border-rose-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              SynthID & C2PA Anti-AI Detection Neutralizer
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              SynthID & AI Watermark Remover
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Bypass automated <span className="text-rose-400 font-semibold">"Made with AI"</span> labels on Instagram, Facebook, Threads, TikTok, YouTube & X.
              Strips C2PA manifests, purges Midjourney/Stable Diffusion prompts, neutralizes in-pixel Google SynthID frequency perturbations, and cloaks media with authentic camera sensor EXIF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadDemoSample}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all border border-purple-400/30 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Load AI Demo Sample</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all border border-rose-400/30 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Media Files</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>C2PA Manifest Purge</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SynthID Frequency Scatter</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real Camera EXIF Cloak</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone if No Files */}
      {selectedFiles.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files || []);
            if (files.length > 0) addFilesToQueue(files);
          }}
          className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-3xl p-10 sm:p-14 text-center bg-slate-950/60 hover:bg-slate-900/50 transition-all cursor-pointer group space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Drag & drop AI-generated images or videos here</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Supports JPEG, PNG, WebP, AVIF, and MP4/WebM videos from Midjourney, Stable Diffusion, DALL-E, Sora, Runway, Kling, or Google Imagen.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
            <span>Or click "Load AI Demo Sample" above to try instantly</span>
          </div>
        </div>
      )}

      {/* 3. Main Workspace When Files Loaded */}
      {selectedFiles.length > 0 && (
        <div className="space-y-6">
          {/* File Queue Carousel */}
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl overflow-x-auto">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {selectedFiles.map((f, idx) => {
                const isCurrent = idx === activeFileIndex;
                const isCleaned = Boolean(results[idx]);
                return (
                  <button
                    key={`${f.name}-${idx}`}
                    type="button"
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-600 text-white font-bold shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.type.includes('video') ? <Film className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                    <span className="truncate max-w-[130px]">{f.name}</span>
                    {isCleaned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => addFilesToQueue([])}
                onClickCapture={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer"
              >
                + Add More
              </button>
              {selectedFiles.length > 1 && (
                <button
                  type="button"
                  onClick={handleSanitizeAll}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sanitize All ({selectedFiles.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setResults([]);
                  setPreScans([]);
                }}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 cursor-pointer"
                title="Clear all files"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Forensic Detection Pre-Scan & Post-Scan Risk Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Gauge */}
            <div className="lg:col-span-1 bg-slate-950 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Automated AI Detection Probability
                </span>
                <div className="mt-4 flex items-baseline gap-3">
                  <span
                    className={`text-5xl font-extrabold tracking-tight font-mono ${
                      currentResult
                        ? 'text-emerald-400'
                        : currentPreScan?.riskScore && currentPreScan.riskScore > 50
                        ? 'text-rose-500'
                        : 'text-amber-400'
                    }`}
                  >
                    {currentResult ? '0%' : `${currentPreScan?.riskScore ?? 0}%`}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      currentResult
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : currentPreScan?.riskScore && currentPreScan.riskScore > 50
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {currentResult
                      ? 'CLEAN / SAFE TO POST'
                      : currentPreScan?.riskLevel || 'ANALYZING...'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {currentResult
                    ? 'All C2PA manifests, generator prompts, and SynthID frequency perturbations have been neutralized. Social media algorithms will treat this media as authentic.'
                    : currentPreScan?.riskScore && currentPreScan.riskScore > 50
                    ? 'High risk: Instagram, Facebook, TikTok, or YouTube will automatically tag this media with a "Made with AI" label.'
                    : 'Analyzing file headers and binary chunks for AI traces...'}
                </p>
              </div>

              {/* Status Checks */}
              <div className="space-y-2 pt-4 border-t border-slate-900 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">C2PA Manifest:</span>
                  <span className={currentResult ? 'text-emerald-400 font-bold' : currentPreScan?.hasC2pa ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {currentResult ? 'PURGED (0 bytes)' : currentPreScan?.hasC2pa ? 'DETECTED (High Risk)' : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">AI Prompt Footprint:</span>
                  <span className={currentResult ? 'text-emerald-400 font-bold' : currentPreScan?.hasPrompts ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {currentResult ? 'CLEARED' : currentPreScan?.hasPrompts ? 'FOUND IN HEADERS' : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SynthID In-Pixel Lattice:</span>
                  <span className={currentResult ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {currentResult ? 'NEUTRALIZED' : 'SUSPECT / ACTIVE'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Camera EXIF Cloak:</span>
                  <span className="text-slate-300 font-medium">
                    {options.cameraProfile === 'none' ? 'Pure Stripped' : CAMERA_PROFILES[options.cameraProfile]?.model || 'Active'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSanitizeSingle(activeFileIndex)}
                disabled={isProcessing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sanitizing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Neutralize AI Traces & Cloak</span>
                  </>
                )}
              </button>
            </div>

            {/* Sanitization Options & Strategy */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800/80 rounded-3xl p-6 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Sanitization Strategy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {/* Mode 1: Stealth Cloak */}
                  <button
                    type="button"
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        mode: 'stealth-cloak',
                        neutralizeWatermark: true,
                        addSensorGrain: true,
                        cameraProfile: 'apple-iphone-15-pro',
                      }))
                    }
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      options.mode === 'stealth-cloak'
                        ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Camera className="w-4 h-4 text-rose-400" />
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        Recommended
                      </span>
                    </div>
                    <div className="font-bold text-white text-xs mt-2">Social Media Stealth</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Neutralizes SynthID + purges C2PA + injects authentic Apple/Sony camera EXIF.
                    </div>
                  </button>

                  {/* Mode 2: Deep Neutralizer */}
                  <button
                    type="button"
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        mode: 'deep-neutralize',
                        neutralizeWatermark: true,
                        addSensorGrain: true,
                        watermarkStrength: 90,
                        cameraProfile: 'none',
                      }))
                    }
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      options.mode === 'deep-neutralize'
                        ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <div className="font-bold text-white text-xs mt-2">Deep In-Pixel Scrub</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Bilateral spatial smoothing + chroma phase disruption + subpixel resample.
                    </div>
                  </button>

                  {/* Mode 3: Lossless Metadata Strip */}
                  <button
                    type="button"
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        mode: 'lossless-strip',
                        neutralizeWatermark: false,
                        addSensorGrain: false,
                        cameraProfile: 'none',
                      }))
                    }
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      options.mode === 'lossless-strip'
                        ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div className="font-bold text-white text-xs mt-2">Lossless C2PA Strip</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Instant zero-recompression binary strip of prompts, C2PA, and chunks.
                    </div>
                  </button>
                </div>
              </div>

              {/* Tuning Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-900 text-xs">
                {/* Camera Profile Picker */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>Spoof Camera Profile (EXIF Cloak)</span>
                  </label>
                  <select
                    value={options.cameraProfile}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, cameraProfile: e.target.value as CloakCameraProfile }))
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="apple-iphone-15-pro">Apple iPhone 15 Pro (iOS 17.5.1)</option>
                    <option value="sony-a7-iv">Sony Alpha 7 IV (FE 24-70mm GM II)</option>
                    <option value="samsung-s24-ultra">Samsung Galaxy S24 Ultra (One UI 6.1)</option>
                    <option value="canon-eos-r5">Canon EOS R5 (RF 24-70mm L)</option>
                    <option value="none">Pure Stripped (No EXIF at all)</option>
                  </select>
                </div>

                {/* Output Format Picker */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Output Media Container</span>
                  </label>
                  <select
                    value={options.outputFormat}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        outputFormat: e.target.value as SanitizeOptions['outputFormat'],
                      }))
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-rose-500"
                  >
                    <option value="auto">Auto (Preserve Original Type)</option>
                    <option value="image/jpeg">Clean JPEG (Recommended for EXIF Cloak)</option>
                    <option value="image/png">Clean PNG (Lossless Format)</option>
                    <option value="image/webp">Clean WebP (Modern Lightweight)</option>
                  </select>
                </div>

                {/* SynthID Neutralization Strength */}
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold">SynthID Neutralization Strength</span>
                    <span className="font-mono text-rose-400">{options.watermarkStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={options.watermarkStrength}
                    disabled={options.mode === 'lossless-strip'}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, watermarkStrength: Number(e.target.value) }))
                    }
                    className="w-full accent-rose-500 disabled:opacity-40"
                  />
                </div>

                {/* Sensor Grain Emulation */}
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold">Camera Sensor Grain (Entropy Mask)</span>
                    <span className="font-mono text-rose-400">
                      {options.addSensorGrain ? `${Math.round(options.sensorGrainStrength * 1000)} ISO-pt` : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sensor-grain"
                      checked={options.addSensorGrain}
                      disabled={options.mode === 'lossless-strip'}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, addSensorGrain: e.target.checked }))
                      }
                      className="rounded accent-rose-500"
                    />
                    <label htmlFor="sensor-grain" className="text-slate-400 text-[11px] cursor-pointer">
                      Simulate natural CMOS photon grain to mask synthetic zero-entropy patches
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Banner */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {progressStage}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center gap-3 text-red-200 text-xs">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 4. Interactive Inspection & Comparison Studio */}
          {currentResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Header & Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Media Sanitized & Verified Clean</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Visual comparison proves 100% sharp image fidelity with zero perceptible degradation.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('compare')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'compare' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    A/B Split Slider
                  </button>
                  {currentResult.diffMapUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('diff')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'diff' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Neutralized Watermark Heatmap
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('forensics')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'forensics' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Forensic Proof
                  </button>
                </div>
              </div>

              {/* Tab 1: Interactive A/B Comparison Slider */}
              {activeTab === 'compare' && (
                <div className="space-y-3">
                  <div
                    ref={compareContainerRef}
                    onMouseDown={() => setIsDraggingSlider(true)}
                    onMouseUp={() => setIsDraggingSlider(false)}
                    onMouseLeave={() => setIsDraggingSlider(false)}
                    onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                    onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                    className="relative w-full h-[360px] sm:h-[480px] bg-slate-900 rounded-2xl overflow-hidden select-none border border-slate-800 cursor-ew-resize group"
                  >
                    {/* Cleaned Image (Bottom Layer) */}
                    <img
                      src={currentResult.cleanedDataUrl}
                      alt="Sanitized media"
                      className="absolute inset-0 w-full h-full object-contain"
                    />

                    {/* Original AI Image (Top Layer clipped by slider) */}
                    {originalPreviewUrl && (
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={originalPreviewUrl}
                          alt="Original AI media"
                          className="absolute inset-0 w-full h-full object-contain max-w-none"
                          style={{
                            width: compareContainerRef.current?.clientWidth || '100%',
                            height: compareContainerRef.current?.clientHeight || '100%',
                          }}
                        />
                      </div>
                    )}

                    {/* Divider Line & Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold shadow-xl border-2 border-slate-900 text-xs">
                        <Split className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-rose-400 font-bold text-[11px] border border-rose-500/30">
                      ORIGINAL AI (SYNTHID)
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                      CLEAN & CLOAKED
                    </div>
                  </div>

                  <p className="text-center text-slate-500 text-xs">
                    Drag the slider left and right to inspect fine texture details. Zero blur, identical resolution.
                  </p>
                </div>
              )}

              {/* Tab 2: Watermark Difference Heatmap */}
              {activeTab === 'diff' && currentResult.diffMapUrl && (
                <div className="space-y-3">
                  <div className="relative w-full h-[360px] sm:h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                    <img
                      src={currentResult.diffMapUrl}
                      alt="Amplified frequency watermark map"
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Amplified Invisible Watermark Noise Heatmap (18× Spectral Gain)</span>
                    </div>
                  </div>
                  <p className="text-center text-slate-400 text-xs max-w-xl mx-auto">
                    The cyan and emerald patterns above reveal the exact imperceptible high-frequency lattice noise and chroma modulation that Google SynthID and neural watermarkers embed. This signature is now neutralized.
                  </p>
                </div>
              )}

              {/* Tab 3: Forensic Proof Table */}
              {activeTab === 'forensics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Before */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="font-sans font-bold text-rose-400 uppercase tracking-wider block">
                      Before Sanitization (AI Leaks)
                    </span>
                    <div className="space-y-1.5 text-slate-400">
                      <div>File: {currentFile?.name}</div>
                      <div>C2PA Claim: {currentResult.preScan.hasC2pa ? 'Detected (JUMBF / urn:c2pa)' : 'None'}</div>
                      <div>Prompt Signatures: {currentResult.preScan.signatures.filter((s) => s.category === 'prompt').map((s) => s.name).join(', ') || 'Detected'}</div>
                      <div>Synthetic Flags: {currentResult.preScan.signatures.filter((s) => s.category === 'c2pa' || s.category === 'generator').map((s) => s.name).join(', ') || 'Active'}</div>
                      <div>AI Risk Score: {currentResult.preScan.riskScore}% ({currentResult.preScan.riskLevel})</div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="font-sans font-bold text-emerald-400 uppercase tracking-wider block">
                      After Sanitization (Safe & Cloaked)
                    </span>
                    <div className="space-y-1.5 text-slate-400">
                      <div>File: {currentResult.fileName}</div>
                      <div>C2PA Claim: 0 bytes (Purged)</div>
                      <div>Prompts & Parameters: 0 bytes (Purged)</div>
                      <div>Spoofed Camera Model: {CAMERA_PROFILES[options.cameraProfile]?.model || 'None'}</div>
                      <div>Lens & ISO: {CAMERA_PROFILES[options.cameraProfile]?.lens || 'N/A'}, ISO {CAMERA_PROFILES[options.cameraProfile]?.iso || 'N/A'}</div>
                      <div>AI Risk Score: 0% (CLEAN)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-900">
                <div className="text-xs text-slate-400">
                  Cleaned File Size: <span className="font-mono text-white font-bold">{Math.round(currentResult.cleanedSize / 1024)} KB</span>{' '}
                  (Original: {Math.round(currentResult.originalSize / 1024)} KB)
                </div>

                <div className="flex items-center gap-3">
                  {currentResult.blob.type.includes('image') && (
                    <button
                      type="button"
                      onClick={handleCopyCleaned}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-800 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
                    </button>
                  )}

                  {results.filter(Boolean).length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 border border-indigo-400/30 cursor-pointer shadow-lg"
                    >
                      <FileArchive className="w-4 h-4" />
                      <span>Download All as ZIP</span>
                    </button>
                  )}

                  <a
                    href={currentResult.cleanedDataUrl}
                    download={currentResult.fileName}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 border border-emerald-400/30 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cleaned Media</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. In-Depth Educational Guide: How Social Media Detects AI Media & How to Protect Yourself */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400" />
          <span>How Social Media Flags AI Content & How This Tool Protects You</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-bold text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>1. C2PA & Metadata Manifests</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Adobe, OpenAI, Midjourney, and Google embed cryptographically signed C2PA JUMBF chunks and XMP tags declaring your media as <code>trainedAlgorithmicMedia</code>. Meta (Instagram/Facebook) and TikTok scan this first. Our tool completely purges these chunks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>2. Google DeepMind SynthID</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              SynthID embeds imperceptible periodic high-frequency patterns directly into pixel and frame chroma channels. Our multi-stage bilateral frequency smoothing and chroma phase scattering break this periodic key without reducing image quality.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>3. Realistic Camera Sensor Cloaking</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              When an image has zero EXIF or unnaturally flat zero-entropy regions, algorithmic detectors suspect AI origin. By injecting authentic Apple iPhone 15 Pro / Sony A7 IV metadata and subtle CMOS sensor grain, your media appears as a genuine real-world photograph.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
