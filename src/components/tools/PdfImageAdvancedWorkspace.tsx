import React, { useEffect, useRef, useState } from 'react';
import {
  PenTool,
  Trash2,
  Sliders,
  Pipette,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { readAndFillPdfForm } from '../../services/pdfAdvancedEngine';
import { analyzePixelsAndPalette, parseImageExifBinary } from '../../services/imageAdvancedEngine';
import { loadImage } from '../../services/imageEngine';

export interface PdfAdvancedParams {
  rearrangeOrder: string;
  protectPassword: string;
  editText: string;
  editPage: number;
  editX: number;
  editY: number;
  editFontSize: number;
  editColor: string;
  cropMarginPt: number;
  scanFilter: 'enhanced' | 'bw' | 'original';
  htmlInput: string;
  signatureDataUrl: string | null;
  signPage: number;
  formValues: Record<string, string | boolean>;
  secondPdfFile: File | null;
}

export interface ImageAdvancedParams {
  upscaleFactor: 2 | 3 | 4;
  bgColor: string;
  tolerance: number;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkPosition: 'bottom-right' | 'center' | 'tiled';
  watermarkColor: string;
  flipH: boolean;
  flipV: boolean;
  rotateAngle: number;
  targetDpi: number;
  collageCols: number;
  collageGap: number;
  collageBg: string;
  thumbTitle: string;
  thumbSubtitle: string;
  thumbAccent: string;
  screenshotPadding: number;
  screenshotRadius: number;
  screenshotGradFrom: string;
  screenshotGradTo: string;
  borderWidth: number;
  borderColor: string;
  brightness: number;
  contrast: number;
  saturate: number;
  hue: number;
  sepia: number;
  invert: number;
  transparentHex: string;
  svgScale: number;
  base64DecodeInput: string;
}

interface PdfImageAdvancedWorkspaceProps {
  tool: ToolDefinition;
  selectedFiles: File[];
  pdfParams: PdfAdvancedParams;
  onPdfParamsChange: (next: Partial<PdfAdvancedParams>) => void;
  imageParams: ImageAdvancedParams;
  onImageParamsChange: (next: Partial<ImageAdvancedParams>) => void;
  onResultTextGenerated?: (text: string) => void;
}

export const PdfImageAdvancedWorkspace: React.FC<PdfImageAdvancedWorkspaceProps> = ({
  tool,
  selectedFiles,
  pdfParams,
  onPdfParamsChange,
  imageParams,
  onImageParamsChange,
  onResultTextGenerated,
}) => {
  // Interactive Signature Canvas state for sign-pdf
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // AcroForm auto-reader state for pdf-form-filler
  const [formFields, setFormFields] = useState<{ name: string; type: string; value: string | boolean }[]>([]);
  const [formNotice, setFormNotice] = useState('');

  // Interactive Pixel Color Picker & Palette state
  const pickerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exifInfo, setExifInfo] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setFormFields([]);
    setFormNotice('');
    setPickedColor(null);
    setPaletteColors([]);
    setExifInfo(null);
  }, [tool.id, selectedFiles]);

  // Read AcroForm fields automatically when PDF is loaded in pdf-form-filler
  useEffect(() => {
    if (tool.id !== 'pdf-form-filler' || selectedFiles.length === 0) return;
    let active = true;
    (async () => {
      try {
        const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
        const res = await readAndFillPdfForm(bytes);
        if (!active) return;
        setFormFields(res.fields);
        if (res.fields.length === 0) {
          setFormNotice('No interactive AcroForm fields found in this PDF. Clicking Execute will preserve & flatten annotations.');
        } else {
          const initial: Record<string, string | boolean> = {};
          res.fields.forEach((f) => {
            initial[f.name] = f.value;
          });
          onPdfParamsChange({ formValues: initial });
          setFormNotice(`Detected ${res.fields.length} interactive AcroForm field(s). Edit values below.`);
        }
      } catch {
        if (active) setFormNotice('Could not inspect PDF form fields.');
      }
    })();
    return () => {
      active = false;
    };
  }, [tool.id, selectedFiles]);

  // Render image to canvas for eyedropper / palette / pixel / exif tools
  useEffect(() => {
    if (selectedFiles.length === 0) return;
    const f = selectedFiles[0];
    let active = true;

    if (tool.id === 'image-exif-viewer' || tool.id === 'image-metadata-remover') {
      f.arrayBuffer().then((buf) => {
        if (!active) return;
        const parsed = parseImageExifBinary(new Uint8Array(buf));
        setExifInfo(parsed);
      });
    }

    if (tool.id === 'image-color-picker' || tool.id === 'image-transparency-maker' || tool.id === 'image-pixel-counter') {
      (async () => {
        try {
          const analysis = await analyzePixelsAndPalette(f);
          if (!active) return;
          setPaletteColors(analysis.palette);
          if (onResultTextGenerated && tool.id === 'image-pixel-counter') {
            onResultTextGenerated(
              `Dimensions: ${analysis.width} × ${analysis.height} px\nTotal Pixels: ${analysis.totalPixels.toLocaleString()}\nMegapixels: ${analysis.megapixels}\nAspect Ratio: ${analysis.aspectRatio}\nDominant Colors: ${analysis.palette.join(', ')}`
            );
          }

          if (pickerCanvasRef.current && (tool.id === 'image-color-picker' || tool.id === 'image-transparency-maker')) {
            const img = await loadImage(f);
            if (!active || !pickerCanvasRef.current) return;
            const canvas = pickerCanvasRef.current;
            const maxW = 540;
            const scale = Math.min(1, maxW / img.width);
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        } catch {
          // ignore
        }
      })();
    }

    return () => {
      active = false;
    };
  }, [tool.id, selectedFiles]);

  const handleCanvasPick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = pickerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 1, Math.round(((e.clientX - rect.left) / rect.width) * canvas.width)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round(((e.clientY - rect.top) / rect.height) * canvas.height)));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === rn) h = ((gn - bn) / d) % 6;
      else if (max === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    const hsl = `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    setPickedColor({ hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl });
    if (tool.id === 'image-transparency-maker') {
      onImageParamsChange({ transparentHex: hex });
    }
    if (tool.id === 'image-color-picker' && onResultTextGenerated) {
      onResultTextGenerated(`Picked Pixel Color @ (${x}, ${y})\nHEX: ${hex}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: ${hsl}\nDominant Palette: ${paletteColors.join(', ')}`);
    }
  };

  // Signature drawing handlers
  const getSigCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startSig = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getSigCoords(e);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawingSig(true);
  };

  const moveSig = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig || !signCanvasRef.current) return;
    const ctx = signCanvasRef.current.getContext('2d')!;
    const { x, y } = getSigCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endSig = () => {
    if (!isDrawingSig || !signCanvasRef.current) return;
    setIsDrawingSig(false);
    onPdfParamsChange({ signatureDataUrl: signCanvasRef.current.toDataURL('image/png') });
  };

  const clearSignature = () => {
    if (!signCanvasRef.current) return;
    const ctx = signCanvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, signCanvasRef.current.width, signCanvasRef.current.height);
    onPdfParamsChange({ signatureDataUrl: null });
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* === PDF ADVANCED WORKSPACES === */}
      {tool.id === 'sign-pdf' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <PenTool className="w-4 h-4 text-rose-400" />
              Draw Signature Pad (Vector-Smooth Stamp)
            </h3>
            <button
              type="button"
              onClick={clearSignature}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Pad
            </button>
          </div>
          <canvas
            ref={signCanvasRef}
            width={560}
            height={160}
            data-testid="pdf-signature-canvas"
            onPointerDown={startSig}
            onPointerMove={moveSig}
            onPointerUp={endSig}
            onPointerLeave={endSig}
            className="w-full max-w-xl h-40 bg-white rounded-xl border-2 border-slate-700 cursor-crosshair touch-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label htmlFor="sign-page" className="block text-slate-400 mb-1">Target Page #</label>
              <input
                id="sign-page"
                type="number"
                min={1}
                value={pdfParams.signPage}
                onChange={(e) => onPdfParamsChange({ signPage: Math.max(1, Number(e.target.value)) })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label htmlFor="sign-x" className="block text-slate-400 mb-1">X Position (%)</label>
              <input
                id="sign-x"
                type="number"
                min={5}
                max={85}
                value={pdfParams.editX}
                onChange={(e) => onPdfParamsChange({ editX: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label htmlFor="sign-y" className="block text-slate-400 mb-1">Y Position (%)</label>
              <input
                id="sign-y"
                type="number"
                min={5}
                max={85}
                value={pdfParams.editY}
                onChange={(e) => onPdfParamsChange({ editY: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {tool.id === 'protect-pdf' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <label htmlFor="pdf-protect-pw" className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" /> Encryption Passphrase (AES-256 Vault + Restricted Copy)
          </label>
          <input
            id="pdf-protect-pw"
            type="password"
            value={pdfParams.protectPassword}
            onChange={(e) => onPdfParamsChange({ protectPassword: e.target.value })}
            placeholder="Enter a strong document password..."
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
          />
        </div>
      )}

      {tool.id === 'rearrange-pdf-pages' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <label htmlFor="pdf-rearrange" className="text-xs font-bold text-slate-300 block">
            New Page Sequence (comma-separated, e.g. 3, 1, 2, 4):
          </label>
          <input
            id="pdf-rearrange"
            type="text"
            value={pdfParams.rearrangeOrder}
            onChange={(e) => onPdfParamsChange({ rearrangeOrder: e.target.value })}
            placeholder="e.g. 3, 1, 2, 4 or leave blank to reverse pages"
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
          />
        </div>
      )}

      {tool.id === 'crop-pdf' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <label htmlFor="pdf-crop-margin">Trim Uniform Margins (pt):</label>
            <span className="font-mono text-rose-400 font-bold">{pdfParams.cropMarginPt} pt</span>
          </div>
          <input
            id="pdf-crop-margin"
            type="range"
            min={5}
            max={120}
            value={pdfParams.cropMarginPt}
            onChange={(e) => onPdfParamsChange({ cropMarginPt: Number(e.target.value) })}
            className="w-full accent-rose-500"
          />
        </div>
      )}

      {tool.id === 'edit-pdf' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" /> Annotate / Add Text Stamp onto PDF Page
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label htmlFor="pdf-edit-text" className="block text-slate-400 mb-1">Annotation Text:</label>
              <input
                id="pdf-edit-text"
                type="text"
                value={pdfParams.editText}
                onChange={(e) => onPdfParamsChange({ editText: e.target.value })}
                placeholder="Approved by MultipleDarkNews"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label htmlFor="pdf-edit-page" className="block text-slate-400 mb-1">Page #</label>
              <input
                id="pdf-edit-page"
                type="number"
                min={1}
                value={pdfParams.editPage}
                onChange={(e) => onPdfParamsChange({ editPage: Math.max(1, Number(e.target.value)) })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label htmlFor="pdf-edit-color" className="block text-slate-400 mb-1">Text Color</label>
              <input
                id="pdf-edit-color"
                type="color"
                value={pdfParams.editColor}
                onChange={(e) => onPdfParamsChange({ editColor: e.target.value })}
                className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {tool.id === 'pdf-form-filler' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider">Interactive AcroForm Fields</div>
          {formNotice && <p className="text-xs text-slate-400">{formNotice}</p>}
          {formFields.map((f) => (
            <div key={f.name} className="space-y-1">
              <label htmlFor={`acro-${f.name}`} className="text-xs text-slate-300 font-mono block">{f.name}</label>
              {f.type === 'checkbox' ? (
                <input
                  id={`acro-${f.name}`}
                  type="checkbox"
                  checked={Boolean(pdfParams.formValues[f.name])}
                  onChange={(e) =>
                    onPdfParamsChange({ formValues: { ...pdfParams.formValues, [f.name]: e.target.checked } })
                  }
                  className="accent-rose-500 w-4 h-4"
                />
              ) : (
                <input
                  id={`acro-${f.name}`}
                  type="text"
                  value={String(pdfParams.formValues[f.name] ?? '')}
                  onChange={(e) =>
                    onPdfParamsChange({ formValues: { ...pdfParams.formValues, [f.name]: e.target.value } })
                  }
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {tool.id === 'compare-pdf' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <label htmlFor="second-pdf-upload" className="text-xs font-bold text-white block">
            Second PDF Document (Modified Version to Compare):
          </label>
          <input
            id="second-pdf-upload"
            type="file"
            accept=".pdf"
            onChange={(e) => onPdfParamsChange({ secondPdfFile: e.target.files?.[0] || null })}
            className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold"
          />
          {pdfParams.secondPdfFile && (
            <div className="text-xs text-emerald-400 font-mono">Loaded: {pdfParams.secondPdfFile.name}</div>
          )}
        </div>
      )}

      {tool.id === 'html-to-pdf' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <label htmlFor="html-pdf-source" className="text-xs font-bold text-white block">
            HTML Markup Snippet (optional if uploading .html file):
          </label>
          <textarea
            id="html-pdf-source"
            rows={5}
            value={pdfParams.htmlInput}
            onChange={(e) => onPdfParamsChange({ htmlInput: e.target.value })}
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
            placeholder="<h1>Invoice #1042</h1><p>Generated locally in browser.</p>"
          />
        </div>
      )}

      {/* === IMAGE ADVANCED WORKSPACES === */}
      {tool.id === 'image-upscaler' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-300 block">Upscale Multiplier:</span>
          <div className="grid grid-cols-3 gap-2">
            {([2, 3, 4] as const).map((factor) => (
              <button
                key={factor}
                type="button"
                onClick={() => onImageParamsChange({ upscaleFactor: factor })}
                className={`py-2.5 rounded-xl text-xs font-bold border ${
                  imageParams.upscaleFactor === factor
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {factor}× Ultra HD
              </button>
            ))}
          </div>
        </div>
      )}

      {(tool.id === 'image-background-changer' || tool.id === 'image-transparency-maker') && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="img-bg-hex" className="text-xs font-bold text-slate-300 block mb-1">
                {tool.id === 'image-transparency-maker' ? 'Target Color to Erase:' : 'New Backdrop Color:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="img-bg-hex"
                  type="color"
                  value={tool.id === 'image-transparency-maker' ? imageParams.transparentHex : imageParams.bgColor}
                  onChange={(e) =>
                    onImageParamsChange(
                      tool.id === 'image-transparency-maker'
                        ? { transparentHex: e.target.value }
                        : { bgColor: e.target.value }
                    )
                  }
                  className="h-10 w-14 rounded-lg bg-slate-900 border border-slate-700"
                />
                {['#FFFFFF', '#0F172A', '#2563EB', '#E11D48'].map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    aria-label={`Select color ${sw}`}
                    onClick={() =>
                      onImageParamsChange(
                        tool.id === 'image-transparency-maker' ? { transparentHex: sw } : { bgColor: sw }
                      )
                    }
                    className="w-8 h-8 rounded-lg border border-slate-600"
                    style={{ backgroundColor: sw }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <label htmlFor="img-tol-slider">Color Tolerance:</label>
                <span className="font-mono text-rose-400 font-bold">{imageParams.tolerance}</span>
              </div>
              <input
                id="img-tol-slider"
                type="range"
                min={5}
                max={120}
                value={imageParams.tolerance}
                onChange={(e) => onImageParamsChange({ tolerance: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {(tool.id === 'image-color-picker' || tool.id === 'image-transparency-maker') && selectedFiles.length > 0 && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <Pipette className="w-4 h-4 text-rose-400" />
            Click Anywhere on Canvas to Sample Pixel Color
          </div>
          <canvas
            ref={pickerCanvasRef}
            onClick={handleCanvasPick}
            data-testid="eyedropper-canvas"
            className="max-w-full rounded-xl border border-slate-700 cursor-crosshair mx-auto block"
          />
          {pickedColor && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center gap-4 text-xs">
              <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: pickedColor.hex }} />
              <div className="font-mono space-y-0.5">
                <div className="text-white font-bold">{pickedColor.hex}</div>
                <div className="text-slate-400">{pickedColor.rgb} • {pickedColor.hsl}</div>
              </div>
              <button
                type="button"
                onClick={() => copyHex(pickedColor.hex)}
                className="ml-auto px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                {copiedHex === pickedColor.hex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy HEX
              </button>
            </div>
          )}
          {paletteColors.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Extracted Top-8 Palette:</div>
              <div className="flex flex-wrap gap-2">
                {paletteColors.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => copyHex(hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 hover:border-rose-500"
                  >
                    <span className="w-3.5 h-3.5 rounded-sm inline-block" style={{ backgroundColor: hex }} />
                    <span>{copiedHex === hex ? 'Copied!' : hex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tool.id === 'image-watermark' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label htmlFor="img-wm-text" className="block text-slate-400 mb-1">Watermark Text:</label>
            <input
              id="img-wm-text"
              type="text"
              value={imageParams.watermarkText}
              onChange={(e) => onImageParamsChange({ watermarkText: e.target.value })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label htmlFor="img-wm-pos" className="block text-slate-400 mb-1">Placement Style:</label>
            <select
              id="img-wm-pos"
              value={imageParams.watermarkPosition}
              onChange={(e) => onImageParamsChange({ watermarkPosition: e.target.value as any })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            >
              <option value="bottom-right">Bottom-Right Corner</option>
              <option value="center">Centered Bold</option>
              <option value="tiled">Diagonal Tiled Grid</option>
            </select>
          </div>
          <div>
            <label htmlFor="img-wm-opacity" className="block text-slate-400 mb-1">
              Opacity: {Math.round(imageParams.watermarkOpacity * 100)}%
            </label>
            <input
              id="img-wm-opacity"
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={imageParams.watermarkOpacity}
              onChange={(e) => onImageParamsChange({ watermarkOpacity: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label htmlFor="img-wm-color" className="block text-slate-400 mb-1">Watermark Color:</label>
            <input
              id="img-wm-color"
              type="color"
              value={imageParams.watermarkColor}
              onChange={(e) => onImageParamsChange({ watermarkColor: e.target.value })}
              className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl"
            />
          </div>
        </div>
      )}

      {(tool.id === 'image-rotator' || tool.id === 'image-flipper') && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label htmlFor="img-rot-deg" className="block text-slate-400 mb-1">Rotation Angle (°):</label>
            <select
              id="img-rot-deg"
              value={imageParams.rotateAngle}
              onChange={(e) => onImageParamsChange({ rotateAngle: Number(e.target.value) })}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            >
              {[0, 90, 180, 270].map((a) => (
                <option key={a} value={a}>{a}°</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-slate-200 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={imageParams.flipH}
              onChange={(e) => onImageParamsChange({ flipH: e.target.checked })}
              className="accent-rose-500"
            />
            Flip Horizontal (Mirror L↔R)
          </label>
          <label className="flex items-center gap-2 text-slate-200 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={imageParams.flipV}
              onChange={(e) => onImageParamsChange({ flipV: e.target.checked })}
              className="accent-rose-500"
            />
            Flip Vertical (Invert ↑↓)
          </label>
        </div>
      )}

      {tool.id === 'image-dpi-changer' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-300 block">Target Print / Web Resolution (DPI):</span>
          <div className="flex flex-wrap gap-2">
            {[72, 96, 150, 300, 600].map((dpi) => (
              <button
                key={dpi}
                type="button"
                onClick={() => onImageParamsChange({ targetDpi: dpi })}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  imageParams.targetDpi === dpi
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {dpi} DPI {dpi === 300 ? '(Print)' : dpi === 72 ? '(Web)' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {tool.id === 'image-color-adjuster' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            { key: 'brightness', label: 'Brightness', min: 20, max: 200, unit: '%', val: imageParams.brightness },
            { key: 'contrast', label: 'Contrast', min: 20, max: 200, unit: '%', val: imageParams.contrast },
            { key: 'saturate', label: 'Saturation', min: 0, max: 250, unit: '%', val: imageParams.saturate },
            { key: 'hue', label: 'Hue Rotate', min: 0, max: 360, unit: '°', val: imageParams.hue },
            { key: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%', val: imageParams.sepia },
            { key: 'invert', label: 'Invert', min: 0, max: 100, unit: '%', val: imageParams.invert },
          ].map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-slate-300 mb-1">
                <label htmlFor={`adj-${s.key}`}>{s.label}</label>
                <span className="font-mono text-rose-400">{s.val}{s.unit}</span>
              </div>
              <input
                id={`adj-${s.key}`}
                type="range"
                min={s.min}
                max={s.max}
                value={s.val}
                onChange={(e) => onImageParamsChange({ [s.key]: Number(e.target.value) } as any)}
                className="w-full accent-rose-500"
              />
            </div>
          ))}
        </div>
      )}

      {tool.id === 'image-border-maker' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-2 gap-4 text-xs">
          <div>
            <label htmlFor="border-width" className="block text-slate-400 mb-1">Border Thickness (px):</label>
            <input
              id="border-width"
              type="number"
              min={2}
              max={200}
              value={imageParams.borderWidth}
              onChange={(e) => onImageParamsChange({ borderWidth: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label htmlFor="border-color" className="block text-slate-400 mb-1">Frame Color:</label>
            <input
              id="border-color"
              type="color"
              value={imageParams.borderColor}
              onChange={(e) => onImageParamsChange({ borderColor: e.target.value })}
              className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl"
            />
          </div>
        </div>
      )}

      {tool.id === 'image-collage-maker' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label htmlFor="collage-cols" className="block text-slate-400 mb-1">Grid Columns:</label>
            <select
              id="collage-cols"
              value={imageParams.collageCols}
              onChange={(e) => onImageParamsChange({ collageCols: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            >
              <option value={2}>2 Columns (2×N)</option>
              <option value={3}>3 Columns (3×N)</option>
            </select>
          </div>
          <div>
            <label htmlFor="collage-gap" className="block text-slate-400 mb-1">Spacing Gap (px):</label>
            <input
              id="collage-gap"
              type="number"
              min={0}
              max={64}
              value={imageParams.collageGap}
              onChange={(e) => onImageParamsChange({ collageGap: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label htmlFor="collage-bg" className="block text-slate-400 mb-1">Backdrop Color:</label>
            <input
              id="collage-bg"
              type="color"
              value={imageParams.collageBg}
              onChange={(e) => onImageParamsChange({ collageBg: e.target.value })}
              className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl"
            />
          </div>
        </div>
      )}

      {tool.id === 'thumbnail-maker' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label htmlFor="thumb-title" className="block text-slate-400 mb-1">Headline (1280×720 Canvas):</label>
            <input
              id="thumb-title"
              type="text"
              value={imageParams.thumbTitle}
              onChange={(e) => onImageParamsChange({ thumbTitle: e.target.value })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label htmlFor="thumb-sub" className="block text-slate-400 mb-1">Sub-Badge Label:</label>
            <input
              id="thumb-sub"
              type="text"
              value={imageParams.thumbSubtitle}
              onChange={(e) => onImageParamsChange({ thumbSubtitle: e.target.value })}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label htmlFor="thumb-accent" className="block text-slate-400 mb-1">Accent Color:</label>
            <input
              id="thumb-accent"
              type="color"
              value={imageParams.thumbAccent}
              onChange={(e) => onImageParamsChange({ thumbAccent: e.target.value })}
              className="w-full h-10 p-1 bg-slate-900 border border-slate-800 rounded-xl"
            />
          </div>
        </div>
      )}

      {tool.id === 'screenshot-editor' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label htmlFor="ss-pad" className="block text-slate-400 mb-1">Padding: {imageParams.screenshotPadding}px</label>
            <input
              id="ss-pad"
              type="range"
              min={16}
              max={120}
              value={imageParams.screenshotPadding}
              onChange={(e) => onImageParamsChange({ screenshotPadding: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label htmlFor="ss-rad" className="block text-slate-400 mb-1">Corner Radius: {imageParams.screenshotRadius}px</label>
            <input
              id="ss-rad"
              type="range"
              min={0}
              max={48}
              value={imageParams.screenshotRadius}
              onChange={(e) => onImageParamsChange({ screenshotRadius: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label htmlFor="ss-g1" className="block text-slate-400 mb-1">Gradient Start</label>
            <input
              id="ss-g1"
              type="color"
              value={imageParams.screenshotGradFrom}
              onChange={(e) => onImageParamsChange({ screenshotGradFrom: e.target.value })}
              className="w-full h-9 p-1 bg-slate-900 border border-slate-800 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="ss-g2" className="block text-slate-400 mb-1">Gradient End</label>
            <input
              id="ss-g2"
              type="color"
              value={imageParams.screenshotGradTo}
              onChange={(e) => onImageParamsChange({ screenshotGradTo: e.target.value })}
              className="w-full h-9 p-1 bg-slate-900 border border-slate-800 rounded-lg"
            />
          </div>
        </div>
      )}

      {tool.id === 'image-base64-converter' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <label htmlFor="b64-to-img" className="font-bold text-slate-300 block">
            Optional: Paste Base64 Data URI to Decode Back Into PNG (or drop an image above to encode):
          </label>
          <textarea
            id="b64-to-img"
            rows={3}
            value={imageParams.base64DecodeInput}
            onChange={(e) => onImageParamsChange({ base64DecodeInput: e.target.value })}
            placeholder="data:image/png;base64,iVBORw0KGgo..."
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
      )}

      {exifInfo && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Live Parsed Binary Header Metadata
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(exifInfo).map(([k, v]) => (
              <div key={k} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between gap-2">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-mono font-semibold truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
