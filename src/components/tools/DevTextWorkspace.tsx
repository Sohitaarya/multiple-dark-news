import React, { useEffect, useRef, useState } from 'react';
import {
  Code,
  QrCode,
  Copy,
  Check,
  Palette,
  Lock,
  Unlock,
  FileSearch,
  Table,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { renderBarcode } from '../../services/devToolsEngine';
import {
  runRegexTest,
  parseAndConvertColor,
  decodeQrFromRgba,
  HTTP_STATUS_CODES,
  parseUserAgentString,
  describeCronExpression,
  generateHtaccessRules,
  generateHtmlTableCode,
} from '../../services/devAdvancedEngine';
import { loadImage } from '../../services/imageEngine';
import {
  generateFancyTextVariants,
  encryptTextAesGcm,
  decryptTextAesGcm,
  checkGrammarAndStyle,
  comparePlagiarismSimilarity,
  calculateReadabilityMetrics,
  sortTextLines,
  reverseTextMode,
} from '../../services/textAdvancedEngine';

interface DevTextWorkspaceProps {
  tool: ToolDefinition;
  inputText: string;
  onInputTextChange: (val: string) => void;
  onResultGenerated: (text: string) => void;
  sortMode?: 'az' | 'za' | 'length-asc' | 'length-desc' | 'numeric' | 'reverse' | 'shuffle';
  onSortModeChange?: (mode: 'az' | 'za' | 'length-asc' | 'length-desc' | 'numeric' | 'reverse' | 'shuffle') => void;
  reverseMode?: 'chars' | 'words' | 'lines';
  onReverseModeChange?: (mode: 'chars' | 'words' | 'lines') => void;
}

export const DevTextWorkspace: React.FC<DevTextWorkspaceProps> = ({
  tool,
  inputText,
  onInputTextChange,
  onResultGenerated,
  sortMode: externalSortMode,
  onSortModeChange,
  reverseMode: externalReverseMode,
  onReverseModeChange,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyVal = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Barcode state
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [barcodeError, setBarcodeError] = useState('');

  // Regex tester state
  const [regexPattern, setRegexPattern] = useState('\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b');
  const [regexFlags, setRegexFlags] = useState('gi');

  // CSS Gradient & Box Shadow
  const [gradType, setGradType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradColor1, setGradColor1] = useState('#e11d48');
  const [gradColor2, setGradColor2] = useState('#4f46e5');
  const [gradColor3, setGradColor3] = useState('#0f172a');

  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(16);
  const [shadowBlur, setShadowBlur] = useState(32);
  const [shadowSpread, setShadowSpread] = useState(-4);
  const [shadowColor, setShadowColor] = useState('rgba(225, 29, 72, 0.35)');
  const [shadowInset, setShadowInset] = useState(false);

  // Color converter
  const [colorInput, setColorInput] = useState('#E11D48');

  // QR Reader
  const [qrDecoded, setQrDecoded] = useState<string>('');
  const [qrScanError, setQrScanError] = useState<string>('');

  // HTTP status search
  const [statusQuery, setStatusQuery] = useState('404');

  // Cron
  const [cronExpr, setCronExpr] = useState('*/15 * * * *');

  // HTML table
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableCells, setTableCells] = useState<string[][]>([
    ['Feature', 'Plan', 'Status'],
    ['PDF Compression', 'Free Forever', 'Active'],
    ['Privacy Sandbox', 'Zero Upload', 'Verified'],
  ]);

  // Htaccess
  const [htDomain, setHtDomain] = useState('tools.multipledarknews.com');
  const [htHttps, setHtHttps] = useState(true);
  const [htCanon, setHtCanon] = useState<'none' | 'non-www' | 'www'>('non-www');
  const [htGzip, setHtGzip] = useState(true);
  const [htCache, setHtCache] = useState(true);
  const [htSpa, setHtSpa] = useState(true);

  // Text tools extras
  const [internalSortMode, setInternalSortMode] = useState<'az' | 'za' | 'length-asc' | 'length-desc' | 'numeric' | 'reverse' | 'shuffle'>('az');
  const [internalReverseMode, setInternalReverseMode] = useState<'chars' | 'words' | 'lines'>('chars');
  const sortMode = externalSortMode ?? internalSortMode;
  const setSortMode = onSortModeChange ?? setInternalSortMode;
  const reverseMode = externalReverseMode ?? internalReverseMode;
  const setReverseMode = onReverseModeChange ?? setInternalReverseMode;
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [findCaseSensitive, setFindCaseSensitive] = useState(false);
  const [loremCount, setLoremCount] = useState(3);
  const [loremUnit, setLoremUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [passphrase, setPassphrase] = useState('');
  const [cryptoError, setCryptoError] = useState('');
  const [plagiarismRef, setPlagiarismRef] = useState('');

  // Render live Barcode
  useEffect(() => {
    if (tool.id !== 'barcode-generator' || !barcodeCanvasRef.current) return;
    try {
      setBarcodeError('');
      renderBarcode(barcodeCanvasRef.current, inputText || (barcodeFormat === 'EAN13' ? '5901234123457' : 'MDN-2026-PRO'), barcodeFormat);
    } catch (err: any) {
      setBarcodeError(err.message || 'Invalid characters for selected barcode symbology.');
    }
  }, [tool.id, inputText, barcodeFormat]);

  // Barcode download handler
  const downloadBarcode = () => {
    if (!barcodeCanvasRef.current) return;
    const url = barcodeCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${barcodeFormat}.png`;
    a.click();
  };

  // QR Reader handler
  const handleQrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrScanError('');
    setQrDecoded('');
    try {
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = decodeQrFromRgba(imgData.data, canvas.width, canvas.height);
      if (!decoded) {
        setQrScanError('No QR code detected in this image. Ensure sharp contrast and clear quiet zone.');
      } else {
        setQrDecoded(decoded);
        onResultGenerated(`Decoded QR Code Payload:\n${decoded}`);
      }
    } catch {
      setQrScanError('Could not read uploaded image.');
    }
  };

  // Update table dimensions safely
  const updateTableDims = (r: number, c: number) => {
    const nr = Math.max(2, Math.min(8, r));
    const nc = Math.max(2, Math.min(6, c));
    setTableRows(nr);
    setTableCols(nc);
    setTableCells((prev) =>
      Array.from({ length: nr }, (_, ri) =>
        Array.from({ length: nc }, (_, ci) => prev[ri]?.[ci] ?? (ri === 0 ? `Header ${ci + 1}` : `Cell ${ri},${ci + 1}`))
      )
    );
  };

  // Gradient CSS string
  const cssGradientValue =
    gradType === 'linear'
      ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2}, ${gradColor3})`
      : gradType === 'radial'
      ? `radial-gradient(circle, ${gradColor1}, ${gradColor2}, ${gradColor3})`
      : `conic-gradient(from ${gradAngle}deg, ${gradColor1}, ${gradColor2}, ${gradColor3}, ${gradColor1})`;

  const cssShadowValue = `${shadowInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`;

  const regexRes =
    tool.id === 'regex-tester'
      ? runRegexTest(regexPattern, regexFlags, inputText || 'Contact support@multipledarknews.com or admin@example.org today.')
      : null;

  const colorInfo = tool.id === 'color-code-converter' ? parseAndConvertColor(colorInput) : null;
  const cronInfo = tool.id === 'cron-expression-generator' ? describeCronExpression(cronExpr) : null;

  // Lightweight live markdown->HTML for markdown-editor / markdown-to-html
  const renderMarkdownHtml = (md: string) => {
    return (md || '# Markdown Live Editor\n\nWrite **bold**, *italic*, or `code` snippets.')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/^### (.*)$/gm, '<h3 class="text-base font-bold text-white mt-3">$1</h3>')
      .replace(/^## (.*)$/gm, '<h2 class="text-lg font-bold text-white mt-4">$1</h2>')
      .replace(/^# (.*)$/gm, '<h1 class="text-xl font-extrabold text-rose-400 mt-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-xs">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-4">
      {/* === DEVELOPER WORKSPACES === */}
      {tool.id === 'barcode-generator' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label htmlFor="barcode-sym" className="text-xs font-bold text-slate-300 mr-2">Symbology:</label>
              <select
                id="barcode-sym"
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
              >
                <option value="CODE128">CODE128 (Universal)</option>
                <option value="EAN13">EAN-13 (Retail 13 digits)</option>
                <option value="UPC">UPC-A (US Retail 12 digits)</option>
                <option value="CODE39">CODE39 (Industrial)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={downloadBarcode}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
            >
              Download PNG Barcode
            </button>
          </div>
          {barcodeError && <div className="text-xs text-rose-400">{barcodeError}</div>}
          <div className="p-4 bg-white rounded-xl flex justify-center">
            <canvas ref={barcodeCanvasRef} data-testid="barcode-canvas" />
          </div>
        </div>
      )}

      {tool.id === 'regex-tester' && regexRes && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-3">
              <label htmlFor="regex-pat" className="block text-slate-400 mb-1 font-mono">Regular Expression Pattern:</label>
              <input
                id="regex-pat"
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-rose-300 font-mono"
              />
            </div>
            <div>
              <label htmlFor="regex-flags" className="block text-slate-400 mb-1 font-mono">Flags:</label>
              <input
                id="regex-flags"
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>
          {!regexRes.valid && <div className="text-xs text-rose-400">{regexRes.error}</div>}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono leading-relaxed text-slate-200">
            <div className="text-[10px] text-slate-500 uppercase mb-2">
              Live Highlighted Matches ({regexRes.matches.length} found):
            </div>
            {regexRes.highlightedSegments.map((seg, i) =>
              seg.isMatch ? (
                <mark key={i} className="bg-rose-500/40 text-white px-1 rounded border border-rose-400/50">
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {tool.id === 'css-gradient-generator' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div
            className="w-full h-36 rounded-2xl border border-slate-700 shadow-lg"
            style={{ background: cssGradientValue }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label htmlFor="grad-type" className="block text-slate-400 mb-1">Type</label>
              <select
                id="grad-type"
                value={gradType}
                onChange={(e) => setGradType(e.target.value as any)}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
                <option value="conic">Conic</option>
              </select>
            </div>
            <div>
              <label htmlFor="grad-ang" className="block text-slate-400 mb-1">Angle ({gradAngle}°)</label>
              <input
                id="grad-ang"
                type="range"
                min={0}
                max={360}
                value={gradAngle}
                onChange={(e) => setGradAngle(Number(e.target.value))}
                className="w-full accent-rose-500 mt-2"
              />
            </div>
            <div>
              <label htmlFor="grad-c1" className="block text-slate-400 mb-1">Stop 1</label>
              <input id="grad-c1" type="color" value={gradColor1} onChange={(e) => setGradColor1(e.target.value)} className="w-full h-9 rounded-lg bg-slate-900" />
            </div>
            <div>
              <label htmlFor="grad-c2" className="block text-slate-400 mb-1">Stop 2</label>
              <input id="grad-c2" type="color" value={gradColor2} onChange={(e) => setGradColor2(e.target.value)} className="w-full h-9 rounded-lg bg-slate-900" />
            </div>
            <div>
              <label htmlFor="grad-c3" className="block text-slate-400 mb-1">Stop 3</label>
              <input id="grad-c3" type="color" value={gradColor3} onChange={(e) => setGradColor3(e.target.value)} className="w-full h-9 rounded-lg bg-slate-900" />
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 font-mono">
            <code className="text-emerald-300 truncate">background: {cssGradientValue};</code>
            <button
              type="button"
              onClick={() => copyVal('grad', `background: ${cssGradientValue};`)}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg shrink-0"
            >
              {copiedId === 'grad' ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
      )}

      {tool.id === 'box-shadow-generator' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="p-8 bg-slate-900 rounded-2xl flex items-center justify-center">
            <div
              className="w-40 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold"
              style={{ boxShadow: cssShadowValue }}
            >
              Shadow Card
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="sh-x" className="block text-slate-400">Offset X: {shadowX}px</label>
              <input id="sh-x" type="range" min={-50} max={50} value={shadowX} onChange={(e) => setShadowX(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div>
              <label htmlFor="sh-y" className="block text-slate-400">Offset Y: {shadowY}px</label>
              <input id="sh-y" type="range" min={-50} max={50} value={shadowY} onChange={(e) => setShadowY(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div>
              <label htmlFor="sh-b" className="block text-slate-400">Blur: {shadowBlur}px</label>
              <input id="sh-b" type="range" min={0} max={80} value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div>
              <label htmlFor="sh-s" className="block text-slate-400">Spread: {shadowSpread}px</label>
              <input id="sh-s" type="range" min={-30} max={30} value={shadowSpread} onChange={(e) => setShadowSpread(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono">
            <code className="text-emerald-300">box-shadow: {cssShadowValue};</code>
            <label className="flex items-center gap-1.5 text-slate-300 font-sans">
              <input type="checkbox" checked={shadowInset} onChange={(e) => setShadowInset(e.target.checked)} className="accent-rose-500" />
              Inset
            </label>
            <button
              type="button"
              onClick={() => copyVal('shadow', `box-shadow: ${cssShadowValue};`)}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-sans"
            >
              {copiedId === 'shadow' ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
      )}

      {tool.id === 'color-code-converter' && colorInfo && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <label htmlFor="color-pick-inp" className="sr-only">Color Swatch</label>
            <input
              id="color-pick-inp"
              type="color"
              value={colorInfo.hex}
              onChange={(e) => setColorInput(e.target.value)}
              className="w-12 h-10 rounded-xl bg-slate-900 border border-slate-700"
            />
            <label htmlFor="color-str-inp" className="sr-only">Color Code Input</label>
            <input
              id="color-str-inp"
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="#E11D48, rgb(225,29,72), or hsl(347,77%,50%)"
              className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono">
            {[
              { k: 'HEX', v: colorInfo.hex },
              { k: 'RGB', v: colorInfo.rgb },
              { k: 'HSL', v: colorInfo.hsl },
              { k: 'HSV', v: colorInfo.hsv },
              { k: 'CMYK', v: colorInfo.cmyk },
              { k: 'WCAG Contrast', v: `White ${colorInfo.contrastWhite}:1 | Black ${colorInfo.contrastBlack}:1` },
            ].map((item) => (
              <button
                key={item.k}
                type="button"
                onClick={() => copyVal(item.k, item.v)}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-xl text-left"
              >
                <div className="text-[10px] text-slate-400">{item.k}</div>
                <div className="text-white font-bold mt-0.5 truncate">{copiedId === item.k ? 'Copied!' : item.v}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tool.id === 'qr-code-reader' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="qr-reader-file" className="font-bold text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-rose-400" /> Upload Image Containing a QR Code:
          </label>
          <input
            id="qr-reader-file"
            type="file"
            accept="image/*"
            onChange={handleQrFile}
            className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold"
          />
          {qrScanError && <div className="text-rose-400">{qrScanError}</div>}
          {qrDecoded && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-700/50 rounded-xl text-emerald-300 font-mono break-all">
              Decoded: {qrDecoded}
            </div>
          )}
        </div>
      )}

      {tool.id === 'http-status-checker' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="http-code-search" className="font-bold text-white block">Filter HTTP Status Code Dictionary:</label>
          <input
            id="http-code-search"
            type="text"
            value={statusQuery}
            onChange={(e) => setStatusQuery(e.target.value)}
            placeholder="e.g. 200, 301, 404, 502..."
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {HTTP_STATUS_CODES.filter(
              (c) => String(c.code).includes(statusQuery) || c.title.toLowerCase().includes(statusQuery.toLowerCase())
            ).map((c) => (
              <div key={c.code} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="font-mono font-bold text-rose-400">{c.code} {c.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{c.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tool.id === 'cron-expression-generator' && cronInfo && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Every 5m', expr: '*/5 * * * *' },
              { label: 'Hourly', expr: '0 * * * *' },
              { label: 'Daily Midnight UTC', expr: '0 0 * * *' },
              { label: 'Weekly Sun', expr: '0 2 * * 0' },
            ].map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setCronExpr(p.expr)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="cron-expr-input" className="block text-slate-400 mb-1 font-mono">Cron Schedule (min hour day month weekday):</label>
            <input
              id="cron-expr-input"
              type="text"
              value={cronExpr}
              onChange={(e) => {
                setCronExpr(e.target.value);
                onInputTextChange(e.target.value);
              }}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
            />
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">{cronInfo.summary}</div>
            {cronInfo.nextRuns.map((r, i) => (
              <div key={i} className="font-mono text-[11px] text-slate-400">#{i + 1}: {r}</div>
            ))}
          </div>
        </div>
      )}

      {tool.id === 'html-table-generator' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-slate-300">
              Rows:
              <input
                type="number"
                min={2}
                max={8}
                value={tableRows}
                onChange={(e) => updateTableDims(Number(e.target.value), tableCols)}
                className="ml-2 w-16 p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
              />
            </label>
            <label className="text-slate-300">
              Columns:
              <input
                type="number"
                min={2}
                max={6}
                value={tableCols}
                onChange={(e) => updateTableDims(tableRows, Number(e.target.value))}
                className="ml-2 w-16 p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
              />
            </label>
            <button
              type="button"
              onClick={() => onResultGenerated(generateHtmlTableCode(tableCells[0], tableCells.slice(1)))}
              className="ml-auto px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold"
            >
              Generate HTML Code
            </button>
          </div>
          <div className="overflow-x-auto space-y-1.5">
            {tableCells.map((row, ri) => (
              <div key={ri} className="flex gap-1.5">
                {row.map((cell, ci) => (
                  <input
                    key={ci}
                    type="text"
                    aria-label={`Row ${ri + 1} Column ${ci + 1}`}
                    value={cell}
                    onChange={(e) => {
                      const copy = tableCells.map((r) => [...r]);
                      copy[ri][ci] = e.target.value;
                      setTableCells(copy);
                    }}
                    className={`flex-1 min-w-[90px] p-2 rounded-lg border text-xs ${
                      ri === 0 ? 'bg-slate-800 border-rose-500/40 font-bold text-white' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tool.id === 'htaccess-generator' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ht-domain" className="block text-slate-400 mb-1">Domain Hostname:</label>
              <input
                id="ht-domain"
                type="text"
                value={htDomain}
                onChange={(e) => setHtDomain(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label htmlFor="ht-canon" className="block text-slate-400 mb-1">WWW Canonical Rule:</label>
              <select
                id="ht-canon"
                value={htCanon}
                onChange={(e) => setHtCanon(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              >
                <option value="non-www">Redirect www → non-www</option>
                <option value="www">Redirect non-www → www</option>
                <option value="none">Keep As-Is</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-300">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={htHttps} onChange={(e) => setHtHttps(e.target.checked)} className="accent-rose-500" /> Force HTTPS (301)</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={htGzip} onChange={(e) => setHtGzip(e.target.checked)} className="accent-rose-500" /> Enable GZIP</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={htCache} onChange={(e) => setHtCache(e.target.checked)} className="accent-rose-500" /> Browser Caching</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={htSpa} onChange={(e) => setHtSpa(e.target.checked)} className="accent-rose-500" /> SPA Fallback (/index.html)</label>
          </div>
          <button
            type="button"
            onClick={() =>
              onResultGenerated(
                generateHtaccessRules({
                  forceHttps: htHttps,
                  canonicalHost: htCanon,
                  domain: htDomain,
                  enableGzip: htGzip,
                  enableBrowserCache: htCache,
                  spaFallback: htSpa,
                })
              )
            }
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Build .htaccess Rules
          </button>
        </div>
      )}

      {/* === TEXT ADVANCED WORKSPACES === */}
      {tool.id === 'fancy-text-generator' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="font-bold text-white">8 Instant Unicode Styles (Live Preview & 1-Click Copy):</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {generateFancyTextVariants(inputText || 'MultipleDarkNews').map((item) => (
              <div key={item.style} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-mono">{item.style}</div>
                  <div className="text-sm text-white truncate">{item.value}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyVal(item.style, item.value)}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold shrink-0"
                >
                  {copiedId === item.style ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tool.id === 'markdown-editor' || tool.id === 'markdown-to-html') && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase">Live HTML Preview:</div>
          <div
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdownHtml(inputText) }}
          />
        </div>
      )}

      {(tool.id === 'text-encryptor' || tool.id === 'text-decryptor') && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="aes-passphrase" className="font-bold text-white flex items-center gap-2">
            {tool.id === 'text-encryptor' ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            AES-256-GCM Passphrase:
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="aes-passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter secret passphrase..."
              className="flex-1 min-w-[200px] p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
            />
            <button
              type="button"
              onClick={async () => {
                setCryptoError('');
                try {
                  if (tool.id === 'text-encryptor') {
                    const res = await encryptTextAesGcm(inputText || 'Confidential note', passphrase || 'secret-key');
                    onResultGenerated(res);
                  } else {
                    const res = await decryptTextAesGcm(inputText, passphrase);
                    onResultGenerated(res);
                  }
                } catch (err: any) {
                  setCryptoError(err.message);
                }
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
            >
              {tool.id === 'text-encryptor' ? 'Encrypt (AES-256-GCM)' : 'Decrypt Ciphertext'}
            </button>
          </div>
          {cryptoError && <div className="text-rose-400">{cryptoError}</div>}
        </div>
      )}

      {tool.id === 'find-and-replace' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label htmlFor="find-term" className="block text-slate-400 mb-1">Find Text / Pattern:</label>
            <input
              id="find-term"
              type="text"
              value={findStr}
              onChange={(e) => setFindStr(e.target.value)}
              placeholder="Word to find"
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label htmlFor="replace-term" className="block text-slate-400 mb-1">Replace With:</label>
            <input
              id="replace-term"
              type="text"
              value={replaceStr}
              onChange={(e) => setReplaceStr(e.target.value)}
              placeholder="Replacement"
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (!findStr) return;
                const re = new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), findCaseSensitive ? 'g' : 'gi');
                let count = 0;
                const out = inputText.replace(re, () => {
                  count++;
                  return replaceStr;
                });
                onResultGenerated(`Replaced ${count} occurrence(s):\n\n${out}`);
              }}
              className="w-full py-2.5 bg-rose-600 text-white rounded-xl font-bold"
            >
              Replace All
            </button>
          </div>
          <label className="flex items-center gap-2 text-slate-300">
            <input type="checkbox" checked={findCaseSensitive} onChange={(e) => setFindCaseSensitive(e.target.checked)} className="accent-rose-500" />
            Case Sensitive Match
          </label>
        </div>
      )}

      {tool.id === 'plagiarism-checker' && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <label htmlFor="plag-ref" className="font-bold text-white flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-rose-400" /> Reference Source Text (for 3-gram Phrase Overlap Check):
          </label>
          <textarea
            id="plag-ref"
            rows={4}
            value={plagiarismRef}
            onChange={(e) => setPlagiarismRef(e.target.value)}
            placeholder="Paste original / reference paragraph to compare against..."
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
          />
          <button
            type="button"
            onClick={() => {
              const r = comparePlagiarismSimilarity(inputText, plagiarismRef);
              onResultGenerated(
                `Uniqueness Score: ${r.uniquenessPercent}%\nSimilarity Overlap: ${r.similarityPercent}%\nVerdict: ${r.verdict}\nMatching 3-Word Phrases (${r.matchingPhrases.length}):\n${r.matchingPhrases.join(' | ') || 'None'}`
              );
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Analyze Overlap
          </button>
        </div>
      )}

      {tool.id === 'grammar-checker' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-slate-300">Detects repeated words, common spelling typos, passive voice, spacing &amp; capitalization.</span>
          <button
            type="button"
            onClick={() => {
              const g = checkGrammarAndStyle(inputText || 'This is teh test test sentence with passive style.');
              onResultGenerated(
                `Writing Quality Score: ${g.score}/100\nIssues Detected: ${g.issues.length}\n\n` +
                  (g.issues.map((i, idx) => `${idx + 1}. [${i.type}] "${i.snippet}" -> ${i.suggestion}`).join('\n') || '✓ Clean grammar and punctuation!')
              );
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold shrink-0"
          >
            Run Grammar Audit
          </button>
        </div>
      )}

      {tool.id === 'readability-checker' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-slate-300">Computes Flesch Reading Ease, Flesch-Kincaid Grade Level, and Gunning Fog Index.</span>
          <button
            type="button"
            onClick={() => {
              const r = calculateReadabilityMetrics(inputText || 'Clear communication improves global collaboration across engineering teams.');
              onResultGenerated(
                `Readability Level: ${r.level}\nFlesch Reading Ease: ${r.fleschReadingEase}\nFlesch-Kincaid Grade: ${r.fleschKincaidGrade}\nGunning Fog Index: ${r.gunningFog}\nTotal Syllables: ${r.totalSyllables} | Complex Words: ${r.complexWords}`
              );
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold shrink-0"
          >
            Score Readability
          </button>
        </div>
      )}

      {tool.id === 'text-sorter' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
          <label htmlFor="sort-mode-sel" className="text-slate-300 font-bold">Sort Order:</label>
          <select
            id="sort-mode-sel"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
          >
            <option value="az">Alphabetical (A → Z)</option>
            <option value="za">Reverse (Z → A)</option>
            <option value="length-asc">Shortest Line First</option>
            <option value="length-desc">Longest Line First</option>
            <option value="numeric">Numeric Value</option>
            <option value="reverse">Reverse Line Order</option>
            <option value="shuffle">Randomize / Shuffle</option>
          </select>
          <button
            type="button"
            onClick={() => onResultGenerated(sortTextLines(inputText || 'Zebra\nApple\nMango\nBanana', sortMode))}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
          >
            Apply Sort
          </button>
        </div>
      )}

      {tool.id === 'lorem-ipsum-generator' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-3 text-xs">
          <label htmlFor="lorem-cnt" className="text-slate-300 font-bold">Count:</label>
          <input
            id="lorem-cnt"
            type="number"
            min={1}
            max={50}
            value={loremCount}
            onChange={(e) => setLoremCount(Math.max(1, Number(e.target.value)))}
            className="w-20 p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
          />
          <select
            aria-label="Lorem Ipsum Unit"
            value={loremUnit}
            onChange={(e) => setLoremUnit(e.target.value as any)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
          <button
            type="button"
            onClick={() => {
              const seed = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
              const words = seed.split(' ');
              if (loremUnit === 'words') {
                const out = Array.from({ length: loremCount }, (_, i) => words[i % words.length]).join(' ');
                onResultGenerated(out);
              } else if (loremUnit === 'sentences') {
                onResultGenerated(Array.from({ length: loremCount }, () => seed).join(' '));
              } else {
                onResultGenerated(Array.from({ length: loremCount }, () => `${seed} Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`).join('\n\n'));
              }
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
          >
            Generate Placeholder Copy
          </button>
        </div>
      )}

      {tool.id === 'text-reverser' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-3 text-xs">
          <label htmlFor="rev-mode" className="text-slate-300 font-bold">Reverse Mode:</label>
          <select
            id="rev-mode"
            value={reverseMode}
            onChange={(e) => setReverseMode(e.target.value as any)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
          >
            <option value="chars">Characters (Mirror)</option>
            <option value="words">Word Order</option>
            <option value="lines">Line Order</option>
          </select>
          <button
            type="button"
            onClick={() => onResultGenerated(reverseTextMode(inputText || 'MultipleDarkNews Global Tools', reverseMode))}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
          >
            Apply Reverse
          </button>
        </div>
      )}

      {tool.id === 'user-agent-parser' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <button
            type="button"
            onClick={() => {
              const ua = navigator.userAgent;
              onInputTextChange(ua);
              const parsed = parseUserAgentString(ua);
              onResultGenerated(`Browser: ${parsed.browser}\nOperating System: ${parsed.os}\nDevice Type: ${parsed.deviceType}\nRendering Engine: ${parsed.engine}\n\nRaw UA:\n${parsed.raw}`);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-rose-500 text-rose-300 rounded-lg font-semibold"
          >
            Detect My Current Browser User-Agent
          </button>
        </div>
      )}
    </div>
  );
};
