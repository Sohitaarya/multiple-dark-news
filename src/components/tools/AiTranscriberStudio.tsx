import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Copy,
  Check,
  Download,
  AlertCircle,
  FileAudio,
  CheckCircle2,
  Trash2,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AiTranscriberStudio: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'hi-IN' | 'es-ES' | 'fr-FR' | 'de-DE'>('en-US');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
        setInterimText(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText('');
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* 100% In-Browser Privacy Badge */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>100% In-Browser Web Speech Recognition • Zero API Key Required • Lifetime ₹0 Free</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Native Web Speech Engine
        </span>
      </div>

      {!isSupported && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Your browser does not have the native SpeechRecognition API enabled. Please use Google Chrome, Edge, or Safari for direct microphone speech-to-text.</span>
        </div>
      )}

      {/* Recording Control Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-rose-500" />
              <span>Real-Time Microphone Dictation & Transcription</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Speak into your microphone. Words are transcribed directly in real time without third-party servers.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              disabled={isListening}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold"
            >
              <option value="en-US">English (US / Global)</option>
              <option value="hi-IN">Hindi (हिन्दी / India)</option>
              <option value="es-ES">Spanish (Español)</option>
              <option value="fr-FR">French (Français)</option>
              <option value="de-DE">German (Deutsch)</option>
            </select>
          </div>
        </div>

        {/* Big Mic Button */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-4">
          {isListening ? (
            <div className="flex flex-col items-center space-y-3">
              <button
                type="button"
                onClick={stopListening}
                className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-950/50 animate-pulse transition-all cursor-pointer"
              >
                <Square className="w-8 h-8 fill-white" />
              </button>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Listening actively... Click to stop</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <button
                type="button"
                onClick={startListening}
                className="w-20 h-20 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white flex items-center justify-center shadow-xl transition-all cursor-pointer"
              >
                <Mic className="w-8 h-8" />
              </button>
              <div className="text-xs font-medium text-slate-400">
                Click microphone to start real-time transcription
              </div>
            </div>
          )}
        </div>

        {/* Live Interim Transcript View */}
        {interimText && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-rose-300 italic">
            Speaking: "{interimText}"
          </div>
        )}

        {/* Full Transcript Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Transcribed Text Output
            </span>
            {transcript && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Clear text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <textarea
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your transcribed speech will appear here automatically..."
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm leading-relaxed focus:border-rose-500 focus:outline-none"
          />

          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span>Words: {transcript.trim().split(/\s+/).filter(Boolean).length}</span>
            <span>Characters: {transcript.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
