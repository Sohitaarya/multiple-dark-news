import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Power,
  ShieldCheck,
  Bot,
  User,
  Trash2
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

export const LiveVoiceStudio: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('Idle - Click to Start');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load browser native voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoice) {
          const defaultVoice = available.find((v) => v.lang.startsWith('en')) || available[0];
          setSelectedVoice(defaultVoice.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const level = isActive ? (isSpeaking ? 0.8 : 0.25) : 0.05;
      const centerY = canvas.height / 2;
      const bars = 36;
      const barWidth = 4;
      const spacing = 8;
      const startX = (canvas.width - bars * (barWidth + spacing)) / 2;

      for (let i = 0; i < bars; i++) {
        const sinFactor = Math.sin(angle + i * 0.28);
        const dynamicHeight = Math.max(4, Math.abs(sinFactor) * 55 * level);
        const x = startX + i * (barWidth + spacing);
        const y = centerY - dynamicHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + dynamicHeight);
        if (isActive) {
          gradient.addColorStop(0, '#f43f5e'); // rose-500
          gradient.addColorStop(1, '#9f1239'); // rose-800
        } else {
          gradient.addColorStop(0, '#475569');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, dynamicHeight, 3);
        ctx.fill();
      }

      angle += 0.09;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive, isSpeaking]);

  // Local Intelligent Conversational Rule-Engine (Zero API Key Required)
  const generateLocalVoiceResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('hey')) {
      return 'Hello! I am your MultipleDarkNews voice assistant. How can I help you today?';
    }
    if (q.includes('how are you')) {
      return 'I am running at optimal performance in your browser with zero latency!';
    }
    if (q.includes('what tools') || q.includes('features') || q.includes('what can you do')) {
      return 'MultipleDarkNews platform has over 325 free tools for PDF, image manipulation, audio, video, calculators, SEO, and developer workflows!';
    }
    if (q.includes('time') || q.includes('date')) {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString()} on ${now.toDateString()}.`;
    }
    if (q.includes('pdf')) {
      return 'You can compress, merge, split, rotate, watermark, or convert PDF files directly in your browser without uploading to any remote server.';
    }
    if (q.includes('image')) {
      return 'We offer 40+ image tools including background removal, compression, resizing, vector SVG conversion, and meme creation.';
    }
    if (q.includes('joke')) {
      return 'Why do programmers prefer dark mode? Because light attracts bugs!';
    }
    if (q.includes('thank')) {
      return 'You are very welcome! Let me know if you need any other calculation or tool.';
    }

    return `I heard you ask: "${query}". You can use any of our 325+ tools on MultipleDarkNews platform to calculate or process files right now!`;
  };

  // Speak response out loud using Web SpeechSynthesis
  const speakVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      const v = voices.find((vox) => vox.name === selectedVoice);
      if (v) utterance.voice = v;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start continuous voice listening
  const startSession = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusText('SpeechRecognition API not available. Use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsActive(true);
        setStatusText('Active & Listening (Speak now...)');
        const welcome = 'Voice assistant active. Speak into your microphone.';
        setMessages((prev) => [
          ...prev,
          {
            sender: 'system',
            text: welcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakVoice(welcome);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const userQuery = lastResult[0].transcript.trim();
          if (!userQuery) return;

          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Add User message
          setMessages((prev) => [
            ...prev,
            { sender: 'user', text: userQuery, timestamp: time },
          ]);

          // Formulate and speak response
          const answer = generateLocalVoiceResponse(userQuery);

          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { sender: 'assistant', text: answer, timestamp: time },
            ]);
            speakVoice(answer);
          }, 200);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Recognition error:', e.error);
      };

      recognition.onend = () => {
        if (isActive) {
          try {
            recognition.start();
          } catch {
            // handle reconnect
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Session start error:', err);
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsActive(false);
    setIsSpeaking(false);
    setStatusText('Session Ended');
  };

  return (
    <div className="space-y-6">
      {/* 100% In-Browser Privacy Badge */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>100% In-Browser Web Speech Assistant • Zero API Key Required • Lifetime ₹0 Free</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Native Web Speech & Synthesis
        </span>
      </div>

      {/* Controller Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {statusText}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Low-latency voice assistant running directly on your device CPU/browser without external API tokens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {voices.length > 0 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs max-w-[160px] truncate"
              >
                {voices.slice(0, 15).map((v) => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isMuted ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
              title={isMuted ? 'Unmute voice' : 'Mute voice response'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {!isActive ? (
              <button
                type="button"
                onClick={startSession}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Start Voice Session</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopSession}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Power className="w-4 h-4" />
                <span>End Call</span>
              </button>
            )}
          </div>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center">
          <canvas ref={canvasRef} width={480} height={90} className="w-full max-w-lg h-[90px]" />
          <div className="text-[11px] font-mono text-slate-500 mt-2">
            {isActive ? (isSpeaking ? 'Assistant speaking...' : 'Listening to microphone...') : 'Click "Start Voice Session" to speak with the assistant'}
          </div>
        </div>
      </div>

      {/* Live Conversation Transcript */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Voice Dialogue Log</span>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="space-y-3 min-h-[140px] max-h-[360px] overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No conversation messages yet. Start a session and speak into your microphone.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : msg.sender === 'assistant' ? 'justify-start' : 'justify-center'
                }`}
              >
                {msg.sender === 'system' ? (
                  <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-rose-500 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 font-mono">
                      <span>{msg.sender === 'user' ? 'You' : 'MultipleDarkNews Voice'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
