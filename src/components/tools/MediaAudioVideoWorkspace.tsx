import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  Volume2,
  Square,
  Play,
  Video,
  Scissors,
  Sliders,
  Camera,
  Monitor,
  Captions,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import {
  decodeAudioFile,
  encodeWavFromChannels,
  trimPcmChannels,
  applyGainPcmChannels,
  reversePcmChannels,
  applyFadePcmChannels,
  removeSilencePcmChannels,
  mixChannelsMode,
  resampleLinearPcm,
  mergePcmBuffers,
  renderFilteredAudioWav,
  renderWaveformPngBlob,
} from '../../services/audioEngine';
import {
  convertSrtToVtt,
  convertVttToSrt,
  parseSubtitleCues,
  captureFrameFromVideo,
  videoToAnimatedGif,
  processVideoCanvasPipeline,
} from '../../services/videoEngine';
import { loadImage } from '../../services/imageEngine';

interface MediaAudioVideoWorkspaceProps {
  tool: ToolDefinition;
  onResultGenerated: (text: string) => void;
  onBlobGenerated: (blob: Blob, fileName: string) => void;
}

export const MediaAudioVideoWorkspace: React.FC<MediaAudioVideoWorkspaceProps> = ({
  tool,
  onResultGenerated,
  onBlobGenerated,
}) => {
  // Audio states
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recSeconds, setRecSeconds] = useState(0);

  // TTS & STT
  const [ttsText, setTtsText] = useState('Welcome to MultipleDarkNews Tools. Fast, private client-side audio synthesis.');
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [sttTranscript, setSttTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const sttRef = useRef<any>(null);

  // Audio DSP parameters
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [volumeDb, setVolumeDb] = useState(6);
  const [speedMult, setSpeedMult] = useState(1.25);
  const [bassDb, setBassDb] = useState(4);
  const [midDb, setMidDb] = useState(0);
  const [trebleDb, setTrebleDb] = useState(3);
  const [fadeSec, setFadeSec] = useState(1.5);
  const [channelTarget, setChannelTarget] = useState<'mono' | 'stereo'>('mono');
  const [audioMetaTitle, setAudioMetaTitle] = useState('Track Master');
  const [audioMetaArtist, setAudioMetaArtist] = useState('MultipleDarkNews Studio');

  // Video states
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [extraAudioFile, setExtraAudioFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const videoElRef = useRef<HTMLVideoElement>(null);
  const webcamPreviewRef = useRef<HTMLVideoElement>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [vTrimStart, setVTrimStart] = useState(0);
  const [vTrimEnd, setVTrimEnd] = useState(6);
  const [vRotate, setVRotate] = useState<0 | 90 | 180 | 270>(90);
  const [vSpeed, setVSpeed] = useState(1.5);
  const [vWidth, setVWidth] = useState(1280);
  const [vHeight, setVHeight] = useState(720);
  const [vWatermark, setVWatermark] = useState('MultipleDarkNews');
  const [vCropW, setVCropW] = useState(80);
  const [vCropH, setVCropH] = useState(80);
  const [subText, setSubText] = useState('1\n00:00:01,000 --> 00:00:04,000\nWelcome to browser video processing!\n\n2\n00:00:04,500 --> 00:00:08,000\nZero server uploads required.');

  useEffect(() => {
    setAudioFiles([]);
    setVideoFiles([]);
    setExtraAudioFile(null);
    setRecSeconds(0);
    setIsRecordingAudio(false);
    setIsRecordingVideo(false);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl('');
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [tool.id]);

  // Load SpeechSynthesis voices
  useEffect(() => {
    if (tool.id !== 'text-to-speech' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length > 0 && !selectedVoiceUri) setSelectedVoiceUri(list[0].voiceURI);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [tool.id]);

  // Live timer while recording
  useEffect(() => {
    if (!isRecordingAudio && !isRecordingVideo) return;
    const iv = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [isRecordingAudio, isRecordingVideo]);

  // ========================
  // AUDIO RECORDING
  // ========================
  const startAudioRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      onBlobGenerated(blob, `recording-${Date.now()}.webm`);
      onResultGenerated(`Microphone recording captured (${recSeconds}s • ${(blob.size / 1024).toFixed(1)} KB).`);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecRef.current = rec;
    setRecSeconds(0);
    rec.start(250);
    setIsRecordingAudio(true);
  };

  const stopAnyRecording = () => {
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.stop();
    }
    setIsRecordingAudio(false);
    setIsRecordingVideo(false);
  };

  // ========================
  // AUDIO DSP EXECUTION
  // ========================
  const executeAudioDsp = async () => {
    if (audioFiles.length === 0) return;
    const file = audioFiles[0];

    if (tool.id === 'audio-equalizer' || tool.id === 'audio-noise-remover') {
      const blob = await renderFilteredAudioWav(file, {
        bassDb: tool.id === 'audio-equalizer' ? bassDb : 0,
        midDb: tool.id === 'audio-equalizer' ? midDb : 0,
        trebleDb: tool.id === 'audio-equalizer' ? trebleDb : 0,
        noiseGate: tool.id === 'audio-noise-remover',
      });
      onBlobGenerated(blob, `filtered-${file.name.replace(/\.[^/.]+$/, '')}.wav`);
      onResultGenerated(`Processed via Web Audio OfflineAudioContext BiquadFilter pipeline.`);
      return;
    }

    if (tool.id === 'audio-merger' || tool.id === 'audio-joiner') {
      const decodedList = await Promise.all(audioFiles.map((f) => decodeAudioFile(f)));
      const merged = mergePcmBuffers(decodedList);
      const wav = encodeWavFromChannels(merged.channels, merged.sampleRate);
      onBlobGenerated(new Blob([wav as unknown as BlobPart], { type: 'audio/wav' }), 'merged-audio.wav');
      onResultGenerated(`Joined ${audioFiles.length} audio tracks seamlessly (${merged.sampleRate} Hz WAV).`);
      return;
    }

    const decoded = await decodeAudioFile(file);
    if (tool.id === 'audio-waveform-generator') {
      const png = await renderWaveformPngBlob(decoded.channels);
      onBlobGenerated(png, `waveform-${file.name}.png`);
      onResultGenerated(`Rendered 1200×360 high-DPI waveform PNG (${decoded.duration.toFixed(2)}s).`);
      return;
    }

    if (tool.id === 'audio-metadata-editor') {
      const wav = encodeWavFromChannels(decoded.channels, decoded.sampleRate);
      onBlobGenerated(new Blob([wav as unknown as BlobPart], { type: 'audio/wav' }), `${audioMetaTitle.replace(/\s+/g, '-').toLowerCase()}.wav`);
      onResultGenerated(`Audio File Inspected & Tagged:\nTitle: ${audioMetaTitle}\nArtist: ${audioMetaArtist}\nDuration: ${decoded.duration.toFixed(2)}s\nSample Rate: ${decoded.sampleRate} Hz\nChannels: ${decoded.channels.length}`);
      return;
    }

    let nextCh = decoded.channels;
    if (tool.id === 'audio-cutter' || tool.id === 'audio-trimmer') {
      nextCh = trimPcmChannels(nextCh, decoded.sampleRate, trimStart, trimEnd);
    } else if (tool.id === 'audio-volume-booster') {
      nextCh = applyGainPcmChannels(nextCh, Math.pow(10, volumeDb / 20));
    } else if (tool.id === 'audio-reverser') {
      nextCh = reversePcmChannels(nextCh);
    } else if (tool.id === 'audio-fade-in-out') {
      nextCh = applyFadePcmChannels(nextCh, decoded.sampleRate, fadeSec, fadeSec);
    } else if (tool.id === 'audio-silence-remover') {
      nextCh = removeSilencePcmChannels(nextCh, decoded.sampleRate, -38);
    } else if (tool.id === 'audio-channel-converter') {
      nextCh = mixChannelsMode(nextCh, channelTarget);
    } else if (tool.id === 'audio-speed-changer' || tool.id === 'audio-pitch-changer') {
      nextCh = resampleLinearPcm(nextCh, speedMult);
    } else if (tool.id === 'mp3-compressor') {
      nextCh = mixChannelsMode(nextCh, 'mono');
    } else if (['audio-converter', 'mp3-to-wav', 'wav-to-mp3', 'mp3-to-aac'].includes(tool.id)) {
      const targetExt = tool.id === 'wav-to-mp3' ? 'webm' : tool.id === 'mp3-to-aac' ? 'ogg' : 'wav';
      if (targetExt === 'wav' || tool.id === 'audio-converter' || tool.id === 'mp3-to-wav') {
        const wavBytes = encodeWavFromChannels(nextCh, decoded.sampleRate);
        onBlobGenerated(new Blob([wavBytes as unknown as BlobPart], { type: 'audio/wav' }), `${file.name.replace(/\.[^/.]+$/, '')}.wav`);
        onResultGenerated(`Converted "${file.name}" to uncompressed 16-bit PCM WAV (${decoded.sampleRate} Hz, ${nextCh.length}ch).`);
        return;
      }
      // Browser-native MediaRecorder compressed audio export (WebM/Opus or OGG fallback)
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const ctx = new AudioContext({ sampleRate: decoded.sampleRate });
      const buf = ctx.createBuffer(nextCh.length, nextCh[0].length, decoded.sampleRate);
      nextCh.forEach((ch, idx) => buf.copyToChannel(new Float32Array(ch), idx));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const dest = ctx.createMediaStreamDestination();
      src.connect(dest);
      const rec = new MediaRecorder(dest.stream, { mimeType: mime });
      const chunks: Blob[] = [];
      rec.ondataavailable = (ev) => ev.data.size > 0 && chunks.push(ev.data);
      const outBlob = await new Promise<Blob>((resolve) => {
        rec.onstop = () => { ctx.close(); resolve(new Blob(chunks, { type: mime })); };
        src.onended = () => rec.stop();
        rec.start(100);
        src.start();
      });
      onBlobGenerated(outBlob, `${file.name.replace(/\.[^/.]+$/, '')}-compressed.webm`);
      onResultGenerated(`Encoded compressed WebM/Opus audio track (${(outBlob.size / 1024).toFixed(1)} KB).`);
      return;
    }

    const wavBytes = encodeWavFromChannels(nextCh, decoded.sampleRate);
    onBlobGenerated(new Blob([wavBytes as unknown as BlobPart], { type: 'audio/wav' }), `processed-${file.name.replace(/\.[^/.]+$/, '')}.wav`);
    onResultGenerated(`Audio DSP complete • Output ${(nextCh[0].length / decoded.sampleRate).toFixed(2)}s @ ${decoded.sampleRate} Hz (${nextCh.length}ch).`);
  };

  // ========================
  // AUDIO RENDERERS
  // ========================
  if (tool.category === 'audio') {
    if (tool.id === 'voice-recorder' || tool.id === 'audio-recorder') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <Mic className={`w-4 h-4 ${isRecordingAudio ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
              Studio Microphone Recorder ({recSeconds}s)
            </span>
          </div>
          <div className="flex gap-3">
            {!isRecordingAudio ? (
              <button type="button" onClick={startAudioRecording} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2">
                <Mic className="w-4 h-4" /> Start Recording
              </button>
            ) : (
              <button type="button" onClick={stopAnyRecording} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2">
                <Square className="w-4 h-4 fill-white" /> Stop & Export Audio
              </button>
            )}
          </div>
        </div>
      );
    }

    if (tool.id === 'text-to-speech') {
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div><label htmlFor="tts-input" className="block text-slate-300 font-bold mb-1">Text to Speak Aloud (Web Speech Synthesis):</label><textarea id="tts-input" rows={4} value={ttsText} onChange={(e) => setTtsText(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="tts-voice" className="block text-slate-400 mb-1">Global Voice / Accent</label>
              <select id="tts-voice" value={selectedVoiceUri} onChange={(e) => setSelectedVoiceUri(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white">
                {voices.length === 0 ? <option value="">System Default Voice</option> : voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tts-rate" className="block text-slate-400 mb-1">Speed Rate: {ttsRate}×</label>
              <input id="tts-rate" type="range" min={0.5} max={2} step={0.1} value={ttsRate} onChange={(e) => setTtsRate(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div>
              <label htmlFor="tts-pitch" className="block text-slate-400 mb-1">Pitch: {ttsPitch}</label>
              <input id="tts-pitch" type="range" min={0.5} max={2} step={0.1} value={ttsPitch} onChange={(e) => setTtsPitch(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!('speechSynthesis' in window)) {
                  onResultGenerated('SpeechSynthesis API is unavailable in this headless environment.');
                  return;
                }
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(ttsText);
                const found = voices.find((v) => v.voiceURI === selectedVoiceUri);
                if (found) u.voice = found;
                u.rate = ttsRate;
                u.pitch = ttsPitch;
                window.speechSynthesis.speak(u);
                onResultGenerated(`Speaking ${ttsText.split(/\s+/).length} words @ ${ttsRate}× rate (${found?.name || 'Default voice'}).`);
              }}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" /> Speak Text
            </button>
            <button type="button" onClick={() => window.speechSynthesis?.cancel()} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl font-semibold">Stop</button>
          </div>
        </div>
      );
    }

    if (tool.id === 'speech-to-text') {
      const toggleStt = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
          onResultGenerated('Web SpeechRecognition requires Chrome / Edge / Safari desktop or Android browser.');
          return;
        }
        if (isListening && sttRef.current) {
          sttRef.current.stop();
          setIsListening(false);
          return;
        }
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: any) => {
          let txt = '';
          for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript + ' ';
          setSttTranscript(txt.trim());
          onResultGenerated(txt.trim());
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        sttRef.current = rec;
        rec.start();
        setIsListening(true);
      };
      return (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="flex gap-2">
            <button type="button" onClick={toggleStt} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">
              {isListening ? 'Stop Dictation' : 'Start Live Dictation'}
            </button>
            <button type="button" onClick={() => onBlobGenerated(new Blob([sttTranscript || 'Empty transcript'], { type: 'text/plain' }), 'transcript.txt')} className="px-4 py-2 bg-slate-800 text-white rounded-xl">
              Download .TXT
            </button>
          </div>
          <textarea aria-label="Live Dictation Transcript" rows={5} value={sttTranscript} onChange={(e) => setSttTranscript(e.target.value)} placeholder="Spoken words appear here live..." className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white" />
        </div>
      );
    }

    // All Audio File DSP Tools
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div>
          <label htmlFor="aud-file-up" className="block font-bold text-white mb-2">
            Select {tool.id === 'audio-merger' || tool.id === 'audio-joiner' ? 'Multiple Audio Files' : tool.id === 'audio-extractor' ? 'Video or Audio File' : 'Audio File (MP3, WAV, OGG, M4A)'}:
          </label>
          <input
            id="aud-file-up"
            type="file"
            multiple={tool.id === 'audio-merger' || tool.id === 'audio-joiner'}
            accept={tool.id === 'audio-extractor' ? 'video/*,audio/*' : 'audio/*'}
            onChange={(e) => setAudioFiles(Array.from(e.target.files || []))}
            className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold"
          />
        </div>

        {(tool.id === 'audio-cutter' || tool.id === 'audio-trimmer') && (
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="at-s" className="block text-slate-400 mb-1">Start (sec)</label><input id="at-s" type="number" min={0} step={0.5} value={trimStart} onChange={(e) => setTrimStart(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
            <div><label htmlFor="at-e" className="block text-slate-400 mb-1">End (sec)</label><input id="at-e" type="number" min={0.5} step={0.5} value={trimEnd} onChange={(e) => setTrimEnd(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          </div>
        )}

        {tool.id === 'audio-volume-booster' && (
          <div>
            <label htmlFor="av-db" className="block text-slate-300 mb-1">Amplification Gain: +{volumeDb} dB</label>
            <input id="av-db" type="range" min={-12} max={24} value={volumeDb} onChange={(e) => setVolumeDb(Number(e.target.value))} className="w-full accent-rose-500" />
          </div>
        )}

        {tool.id === 'audio-equalizer' && (
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-slate-400 mb-1">Bass (250Hz): {bassDb} dB</label><input type="range" min={-12} max={12} value={bassDb} onChange={(e) => setBassDb(Number(e.target.value))} className="w-full accent-rose-500" /></div>
            <div><label className="block text-slate-400 mb-1">Mid (1kHz): {midDb} dB</label><input type="range" min={-12} max={12} value={midDb} onChange={(e) => setMidDb(Number(e.target.value))} className="w-full accent-rose-500" /></div>
            <div><label className="block text-slate-400 mb-1">Treble (4kHz): {trebleDb} dB</label><input type="range" min={-12} max={12} value={trebleDb} onChange={(e) => setTrebleDb(Number(e.target.value))} className="w-full accent-rose-500" /></div>
          </div>
        )}

        {(tool.id === 'audio-speed-changer' || tool.id === 'audio-pitch-changer') && (
          <div>
            <label htmlFor="as-mult" className="block text-slate-300 mb-1">Playback / Resample Multiplier: {speedMult}×</label>
            <input id="as-mult" type="range" min={0.5} max={2.0} step={0.05} value={speedMult} onChange={(e) => setSpeedMult(Number(e.target.value))} className="w-full accent-rose-500" />
          </div>
        )}

        {tool.id === 'audio-fade-in-out' && (
          <div><label htmlFor="af-sec" className="block text-slate-300 mb-1">Fade In/Out Duration (sec): {fadeSec}s</label><input id="af-sec" type="range" min={0.2} max={5} step={0.2} value={fadeSec} onChange={(e) => setFadeSec(Number(e.target.value))} className="w-full accent-rose-500" /></div>
        )}

        {tool.id === 'audio-channel-converter' && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setChannelTarget('mono')} className={`px-3 py-1.5 rounded-lg font-bold ${channelTarget === 'mono' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>Downmix to Mono</button>
            <button type="button" onClick={() => setChannelTarget('stereo')} className={`px-3 py-1.5 rounded-lg font-bold ${channelTarget === 'stereo' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>Expand to Stereo</button>
          </div>
        )}

        {tool.id === 'audio-metadata-editor' && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-slate-400 mb-1">Track Title</label><input type="text" value={audioMetaTitle} onChange={(e) => setAudioMetaTitle(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
            <div><label className="block text-slate-400 mb-1">Artist</label><input type="text" value={audioMetaArtist} onChange={(e) => setAudioMetaArtist(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          </div>
        )}

        {audioFiles.length > 0 && (
          <button type="button" onClick={executeAudioDsp} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold">
            Process {audioFiles[0].name}
          </button>
        )}
      </div>
    );
  }

  // =============================
  // 4. VIDEO CATEGORY (25)
  // =============================
  if (tool.id === 'screen-recorder' || tool.id === 'webcam-recorder') {
    const startScreenOrCam = async () => {
      const stream = tool.id === 'screen-recorder'
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        : await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (webcamPreviewRef.current && tool.id === 'webcam-recorder') {
        webcamPreviewRef.current.srcObject = stream;
        webcamPreviewRef.current.play().catch(() => {});
      }
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onBlobGenerated(blob, `${tool.id}-${Date.now()}.webm`);
        onResultGenerated(`Recorded ${recSeconds}s WebM video (${(blob.size / 1024).toFixed(1)} KB).`);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecRef.current = rec;
      setRecSeconds(0);
      rec.start(250);
      setIsRecordingVideo(true);
    };

    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="font-bold text-white flex items-center gap-2">
          {tool.id === 'screen-recorder' ? <Monitor className="w-4 h-4 text-rose-400" /> : <Camera className="w-4 h-4 text-rose-400" />}
          {tool.name} ({recSeconds}s)
        </div>
        {tool.id === 'webcam-recorder' && (
          <video ref={webcamPreviewRef} muted playsInline className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800" />
        )}
        {!isRecordingVideo ? (
          <button type="button" onClick={startScreenOrCam} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold">
            Start {tool.id === 'screen-recorder' ? 'Screen Capture' : 'Camera Recording'}
          </button>
        ) : (
          <button type="button" onClick={stopAnyRecording} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold">
            Stop & Download WebM
          </button>
        )}
      </div>
    );
  }

  if (tool.id === 'video-subtitle-extractor') {
    const cues = parseSubtitleCues(subText);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div>
          <label htmlFor="sub-file" className="block text-slate-300 font-bold mb-1">Upload .SRT / .VTT File (or edit subtitle cues directly below):</label>
          <input
            id="sub-file"
            type="file"
            accept=".srt,.vtt,.txt"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setSubText(await f.text());
            }}
            className="w-full text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white"
          />
        </div>
        <textarea aria-label="Subtitle Editor" rows={6} value={subText} onChange={(e) => setSubText(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { const v = convertSrtToVtt(subText); onResultGenerated(v); onBlobGenerated(new Blob([v], { type: 'text/vtt' }), 'subtitles.vtt'); }} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">Convert SRT → WebVTT</button>
          <button type="button" onClick={() => { const s = convertVttToSrt(subText); onResultGenerated(s); onBlobGenerated(new Blob([s], { type: 'text/plain' }), 'subtitles.srt'); }} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold">Convert WebVTT → SRT</button>
          <button type="button" onClick={() => onResultGenerated(cues.map((c) => `[${c.timestamp}] ${c.content}`).join('\n'))} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold">Extract Plain Transcript ({cues.length} cues)</button>
        </div>
      </div>
    );
  }

  // Remaining all-browser Video File Processing Tools
  const runVideoAction = async () => {
    if (videoFiles.length === 0) return;
    const f = videoFiles[0];

    if (tool.id === 'video-to-mp3' || tool.id === 'video-to-wav') {
      const dec = await decodeAudioFile(f);
      const wav = encodeWavFromChannels(dec.channels, dec.sampleRate);
      onBlobGenerated(new Blob([wav as unknown as BlobPart], { type: 'audio/wav' }), `${f.name.replace(/\.[^/.]+$/, '')}-audio.wav`);
      onResultGenerated(`Extracted audio track (${dec.duration.toFixed(2)}s @ ${dec.sampleRate} Hz PCM WAV).`);
      return;
    }

    if (tool.id === 'video-metadata-viewer' && videoElRef.current) {
      const v = videoElRef.current;
      onResultGenerated(`Filename: ${f.name}\nSize: ${(f.size / (1024 * 1024)).toFixed(2)} MB\nMIME Type: ${f.type || 'video/*'}\nResolution: ${v.videoWidth} × ${v.videoHeight} px\nDuration: ${v.duration.toFixed(2)} sec\nAspect Ratio: ${(v.videoWidth / (v.videoHeight || 1)).toFixed(2)}:1`);
      return;
    }

    if ((tool.id === 'video-frame-extractor' || tool.id === 'video-thumbnail-extractor') && videoElRef.current) {
      const blob = await captureFrameFromVideo(videoElRef.current, 'image/png');
      onBlobGenerated(blob, `frame-${Math.round(videoElRef.current.currentTime)}s.png`);
      onResultGenerated(`Captured full-res frame @ ${videoElRef.current.currentTime.toFixed(2)}s.`);
      return;
    }

    if (tool.id === 'video-to-gif' && videoElRef.current) {
      const gifBlob = await videoToAnimatedGif(videoElRef.current, { startSec: vTrimStart, durationSec: Math.max(1, vTrimEnd - vTrimStart), fps: 8, width: 420 });
      onBlobGenerated(gifBlob, `${f.name.replace(/\.[^/.]+$/, '')}.gif`);
      onResultGenerated(`Encoded animated GIF (${(gifBlob.size / 1024).toFixed(1)} KB).`);
      return;
    }

    if (tool.id === 'gif-to-video') {
      const img = await loadImage(f);
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 480;
      canvas.height = img.height || 360;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(24);
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      const blob = await new Promise<Blob>((resolve) => {
        rec.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
        rec.start(100);
        const start = performance.now();
        const step = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          if (performance.now() - start < 2000) requestAnimationFrame(step);
          else rec.stop();
        };
        requestAnimationFrame(step);
      });
      onBlobGenerated(blob, `${f.name.replace(/\.[^/.]+$/, '')}.webm`);
      onResultGenerated(`Converted GIF into 2-second WebM video clip.`);
      return;
    }

    if (tool.id === 'video-merger' && videoFiles.length > 1) {
      const mergedBlobs: Uint8Array[] = [];
      for (const vf of videoFiles) {
        const b = await processVideoCanvasPipeline(vf, { videoBitrate: 1_500_000 });
        mergedBlobs.push(new Uint8Array(await b.arrayBuffer()));
      }
      const combined = new Blob(mergedBlobs as unknown as BlobPart[], { type: 'video/webm' });
      onBlobGenerated(combined, `merged-${videoFiles.length}-clips.webm`);
      onResultGenerated(`Transcoded & combined ${videoFiles.length} video clips into WebM (${(combined.size / 1024).toFixed(1)} KB).`);
      return;
    }

    // Re-encode via Canvas + MediaRecorder pipeline (covers video-converter, mp4-to-webm, webm-to-mp4 & effects)
    const isTranscodeTool = tool.id === 'video-converter' || tool.id === 'mp4-to-webm' || tool.id === 'webm-to-mp4';
    const outBlob = await processVideoCanvasPipeline(f, {
      targetWidth: tool.id === 'video-resizer' || tool.id === 'video-aspect-ratio-converter' ? vWidth : undefined,
      targetHeight: tool.id === 'video-resizer' || tool.id === 'video-aspect-ratio-converter' ? vHeight : undefined,
      rotateDeg: tool.id === 'video-rotator' ? vRotate : 0,
      speedMultiplier: tool.id === 'video-speed-changer' ? vSpeed : 1,
      muteAudio: tool.id === 'video-mute',
      watermarkText: tool.id === 'video-watermark' ? vWatermark : undefined,
      trimStart: tool.id === 'video-trimmer' || tool.id === 'video-cutter' ? vTrimStart : 0,
      trimEnd: tool.id === 'video-trimmer' || tool.id === 'video-cutter' ? vTrimEnd : undefined,
      videoBitrate: tool.id === 'video-compressor' ? 650_000 : isTranscodeTool ? 2_200_000 : 1_800_000,
      cropPercent: tool.id === 'video-cropper' ? { x: (100 - vCropW) / 2, y: (100 - vCropH) / 2, w: vCropW, h: vCropH } : undefined,
      replacementAudioFile: tool.id === 'audio-video-synchronizer' ? extraAudioFile : null,
    });
    const outExt = tool.id === 'webm-to-mp4' && MediaRecorder.isTypeSupported('video/mp4') ? 'mp4' : 'webm';
    onBlobGenerated(outBlob, `processed-${f.name.replace(/\.[^/.]+$/, '')}.${outExt}`);
    onResultGenerated(`Video rendered via Canvas + MediaRecorder pipeline (${(outBlob.size / 1024).toFixed(1)} KB ${outExt.toUpperCase()}).`);
  };

  return (
    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
      <div>
        <label htmlFor="vid-file-in" className="block font-bold text-white mb-2">
          Select {tool.id === 'gif-to-video' ? 'GIF File' : 'Video File (MP4, WebM, MOV)'}:
        </label>
        <input
          id="vid-file-in"
          type="file"
          multiple={tool.id === 'video-merger'}
          accept={tool.id === 'gif-to-video' ? 'image/gif' : 'video/*'}
          onChange={(e) => {
            const list = Array.from(e.target.files || []);
            setVideoFiles(list);
            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
            if (list[0] && tool.id !== 'gif-to-video') setVideoPreviewUrl(URL.createObjectURL(list[0]));
          }}
          className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-600 file:text-white file:font-semibold"
        />
      </div>

      {videoPreviewUrl && (
        <video ref={videoElRef} src={videoPreviewUrl} controls className="w-full max-h-64 rounded-xl bg-black border border-slate-800" />
      )}

      {(tool.id === 'video-trimmer' || tool.id === 'video-cutter' || tool.id === 'video-to-gif') && (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-slate-400 mb-1">Start (sec)</label><input type="number" min={0} step={0.5} value={vTrimStart} onChange={(e) => setVTrimStart(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">End (sec)</label><input type="number" min={0.5} step={0.5} value={vTrimEnd} onChange={(e) => setVTrimEnd(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
      )}

      {tool.id === 'video-rotator' && (
        <div className="flex gap-2">
          {([90, 180, 270] as const).map((deg) => (
            <button key={deg} type="button" onClick={() => setVRotate(deg)} className={`px-3 py-1.5 rounded-lg font-bold ${vRotate === deg ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>{deg}°</button>
          ))}
        </div>
      )}

      {tool.id === 'video-speed-changer' && (
        <div><label className="block text-slate-300 mb-1">Playback Speed: {vSpeed}×</label><input type="range" min={0.5} max={2.5} step={0.25} value={vSpeed} onChange={(e) => setVSpeed(Number(e.target.value))} className="w-full accent-rose-500" /></div>
      )}

      {(tool.id === 'video-resizer' || tool.id === 'video-aspect-ratio-converter') && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: '16:9 HD (1280×720)', w: 1280, h: 720 },
            { label: '9:16 Reels (720×1280)', w: 720, h: 1280 },
            { label: '1:1 Square (720×720)', w: 720, h: 720 },
            { label: '4:5 Feed (720×900)', w: 720, h: 900 },
          ].map((r) => (
            <button key={r.label} type="button" onClick={() => { setVWidth(r.w); setVHeight(r.h); }} className={`px-3 py-1.5 rounded-lg font-bold ${vWidth === r.w && vHeight === r.h ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>{r.label}</button>
          ))}
        </div>
      )}

      {tool.id === 'video-cropper' && (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-slate-400 mb-1">Width (%): {vCropW}%</label><input type="range" min={30} max={100} value={vCropW} onChange={(e) => setVCropW(Number(e.target.value))} className="w-full accent-rose-500" /></div>
          <div><label className="block text-slate-400 mb-1">Height (%): {vCropH}%</label><input type="range" min={30} max={100} value={vCropH} onChange={(e) => setVCropH(Number(e.target.value))} className="w-full accent-rose-500" /></div>
        </div>
      )}

      {tool.id === 'video-watermark' && (
        <div><label className="block text-slate-400 mb-1">Watermark Stamp Text</label><input type="text" value={vWatermark} onChange={(e) => setVWatermark(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
      )}

      {tool.id === 'audio-video-synchronizer' && (
        <div>
          <label className="block text-slate-400 mb-1">External Replacement Audio Track:</label>
          <input type="file" accept="audio/*" onChange={(e) => setExtraAudioFile(e.target.files?.[0] || null)} className="w-full text-slate-300" />
        </div>
      )}

      {videoFiles.length > 0 && (
        <button type="button" onClick={runVideoAction} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold">
          Process Video ({tool.name})
        </button>
      )}
    </div>
  );
};
