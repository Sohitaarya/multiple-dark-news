import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  Sparkles,
  Shuffle,
  FileText,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import {
  calculateGpa,
  calculateMarksPercentage,
  solveQuadraticEquation,
  solveLinearEquation,
  toRomanNumeral,
  fromRomanNumeral,
  numberToWords,
  wordsToNumber,
  toScientificNotation,
  calculateReadingTime,
  formatCitation,
  CitationData,
} from '../../services/educationToolsEngine';

interface EducationToolsWorkspaceProps {
  tool: ToolDefinition;
  onResultGenerated?: (resultText: string) => void;
}

export const EducationToolsWorkspace: React.FC<EducationToolsWorkspaceProps> = ({
  tool,
  onResultGenerated,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. STUDY TIMETABLE MAKER
  const [activeDay, setActiveDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [timetableDays, setTimetableDays] = useState<
    Record<string, Array<{ id: string; time: string; subject: string; topic: string; color: string }>>
  >({
    Mon: [
      { id: '1', time: '06:00 - 08:00 AM', subject: 'Mathematics', topic: 'Calculus & Integration', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
      { id: '2', time: '09:00 - 12:00 PM', subject: 'College / Classes', topic: 'Lectures & Labs', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      { id: '3', time: '02:00 - 04:00 PM', subject: 'Physics', topic: 'Electromagnetism & Waves', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      { id: '4', time: '05:00 - 07:00 PM', subject: 'Chemistry', topic: 'Organic Reaction Mechanisms', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      { id: '5', time: '08:30 - 10:30 PM', subject: 'Mock Test / Revision', topic: 'Solving Previous Year Papers', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    ],
    Tue: [
      { id: '6', time: '06:00 - 08:00 AM', subject: 'Physics', topic: 'Rotational Motion & Mechanics', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      { id: '7', time: '09:00 - 12:00 PM', subject: 'College / Classes', topic: 'Lectures & Practical', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      { id: '8', time: '02:00 - 04:00 PM', subject: 'Mathematics', topic: 'Vectors & 3D Geometry', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
      { id: '9', time: '05:00 - 07:00 PM', subject: 'Computer Science', topic: 'Algorithms & Data Structures', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    ],
    Wed: [
      { id: '10', time: '06:00 - 08:00 AM', subject: 'Chemistry', topic: 'Chemical Bonding & Thermodynamics', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      { id: '11', time: '09:00 - 12:00 PM', subject: 'College / Classes', topic: 'Regular Sessions', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      { id: '12', time: '02:00 - 04:00 PM', subject: 'Mathematics', topic: 'Probability & Matrices', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    ],
    Thu: [
      { id: '13', time: '06:00 - 08:00 AM', subject: 'Mathematics', topic: 'Differential Equations', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
      { id: '14', time: '02:00 - 04:00 PM', subject: 'Physics', topic: 'Modern Physics & Optics', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ],
    Fri: [
      { id: '15', time: '06:00 - 08:00 AM', subject: 'Physics', topic: 'Fluid Mechanics & Thermal Physics', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      { id: '16', time: '02:00 - 04:00 PM', subject: 'Mathematics', topic: 'Complex Numbers', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    ],
    Sat: [
      { id: '17', time: '08:00 - 11:00 AM', subject: 'FULL MOCK EXAM', topic: 'Timed 3-Hour Full Test', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
      { id: '18', time: '01:00 - 03:00 PM', subject: 'Test Analysis', topic: 'Identify Weak Concepts', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ],
    Sun: [
      { id: '19', time: '09:00 - 11:00 AM', subject: 'Weekly Cumulative Revision', topic: 'Entire Syllabus Review', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    ],
  });

  const [newSlotTime, setNewSlotTime] = useState('07:00 - 09:00 AM');
  const [newSlotSubject, setNewSlotSubject] = useState('Mathematics');
  const [newSlotTopic, setNewSlotTopic] = useState('Topic / Chapters');

  const handleAddSlot = () => {
    if (!newSlotSubject.trim()) return;
    const currentSlots = timetableDays[activeDay] || [];
    const newEntry = {
      id: Date.now().toString(),
      time: newSlotTime,
      subject: newSlotSubject,
      topic: newSlotTopic,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
    setTimetableDays({
      ...timetableDays,
      [activeDay]: [...currentSlots, newEntry],
    });
  };

  const handleRemoveSlot = (id: string) => {
    const currentSlots = timetableDays[activeDay] || [];
    setTimetableDays({
      ...timetableDays,
      [activeDay]: currentSlots.filter((s) => s.id !== id),
    });
  };

  const exportTimetableText = () => {
    let out = `====================================================\n`;
    out += `  MULTIPLE DARK NEWS — WEEKLY STUDY TIMETABLE\n`;
    out += `====================================================\n\n`;
    const days: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach((d) => {
      out += `▶ ${d.toUpperCase()} SCHEDULE:\n`;
      const slots = timetableDays[d] || [];
      if (slots.length === 0) out += `  (No study sessions booked)\n`;
      else slots.forEach((s) => { out += `  • [${s.time}] ${s.subject}: ${s.topic}\n`; });
      out += `\n`;
    });
    if (onResultGenerated) onResultGenerated(out);
    copyToClipboard(out);
  };

  // 2. FLASHCARD MAKER
  const [flashcards, setFlashcards] = useState([
    { id: 1, front: 'What is the SI unit of Electric Current?', back: 'Ampere (Symbol: A)' },
    { id: 2, front: 'State Newton’s Second Law of Motion', back: 'Force equals mass multiplied by acceleration (F = m × a)' },
    { id: 3, front: 'What is the chemical formula of Table Salt?', back: 'Sodium Chloride (NaCl)' },
    { id: 4, front: 'Acceleration due to gravity (g) on Earth?', back: '9.80665 m/s² (approx 9.8 m/s²)' },
    { id: 5, front: 'Define Pythagorean Theorem', back: 'In a right triangle: a² + b² = c²' },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleAddFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    setFlashcards([...flashcards, { id: Date.now(), front: newCardFront, back: newCardBack }]);
    setNewCardFront('');
    setNewCardBack('');
  };

  // 3. QUIZ GENERATOR & MCQ PRACTICE
  const [quizBank, setQuizBank] = useState([
    {
      q: 'Which fundamental particle has no electrical charge?',
      options: ['Electron', 'Proton', 'Neutron', 'Positron'],
      ans: 2,
      explanation: 'Neutrons carry zero electrical charge, whereas protons carry +1 and electrons carry -1.',
    },
    {
      q: 'What is the powerhouse of the biological eukaryotic cell?',
      options: ['Ribosome', 'Mitochondria', 'Golgi Apparatus', 'Nucleus'],
      ans: 1,
      explanation: 'Mitochondria generate chemical energy (ATP) needed to power cellular functions.',
    },
    {
      q: 'What is the derivative of sin(x) with respect to x?',
      options: ['cos(x)', '-cos(x)', 'tan(x)', '-sin(x)'],
      ans: 0,
      explanation: 'Standard calculus derivative: d/dx [sin(x)] = cos(x).',
    },
    {
      q: 'Which metal is liquid at standard room temperature and pressure?',
      options: ['Mercury (Hg)', 'Iron (Fe)', 'Lead (Pb)', 'Zinc (Zn)'],
      ans: 0,
      explanation: 'Mercury is a metallic liquid at standard ambient temperature.',
    },
  ]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [customQ, setCustomQ] = useState('');
  const [customOptA, setCustomOptA] = useState('');
  const [customOptB, setCustomOptB] = useState('');
  const [customOptC, setCustomOptC] = useState('');
  const [customOptD, setCustomOptD] = useState('');
  const [customCorrectIdx, setCustomCorrectIdx] = useState(0);

  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    if (optionIdx === quizBank[quizIndex].ans) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizBank.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      if (onResultGenerated) {
        onResultGenerated(
          `MCQ Assessment Complete\nScore: ${quizScore} / ${quizBank.length}\nAccuracy: ${Math.round((quizScore / quizBank.length) * 100)}%`
        );
      }
    }
  };

  // 4. RANDOM QUESTION PICKER (VIVA)
  const [vivaQuestions, setVivaQuestions] = useState(
    `Explain the difference between Speed and Velocity.\nWhat is Ohm's Law and its mathematical formula?\nDescribe Archimedes' Principle with a real-life example.\nWhat is Photosynthesis and what are its products?\nExplain Big-O Notation in Computer Science.\nWhat is the difference between AC and DC current?`
  );
  const [pickedQuestion, setPickedQuestion] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const handlePickRandomQuestion = () => {
    const list = vivaQuestions.split('\n').map((q) => q.trim()).filter(Boolean);
    if (list.length === 0) return;
    setIsPicking(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = list[Math.floor(Math.random() * list.length)];
      setPickedQuestion(rand);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 60);
  };

  // 5. MATH EQUATION SOLVER (Quadratic & Linear)
  const [eqMode, setEqMode] = useState<'quadratic' | 'linear'>('quadratic');
  const [coeffA, setCoeffA] = useState(1);
  const [coeffB, setCoeffB] = useState(-5);
  const [coeffC, setCoeffC] = useState(6);
  const quadResult = solveQuadraticEquation(coeffA, coeffB, coeffC);
  const linearResult = solveLinearEquation(coeffA, coeffB, coeffC);

  // 6. ROMAN NUMERAL CONVERTER
  const [romanInput, setRomanInput] = useState('2026');
  const [romanResult, setRomanResult] = useState('MMXXVI');
  const [romanMode, setRomanMode] = useState<'toRoman' | 'fromRoman'>('toRoman');

  const handleRomanChange = (val: string, mode: 'toRoman' | 'fromRoman') => {
    setRomanInput(val);
    setRomanMode(mode);
    if (mode === 'toRoman') {
      const num = parseInt(val, 10);
      setRomanResult(isNaN(num) ? 'Enter a number (1-3999)' : toRomanNumeral(num));
    } else {
      const num = fromRomanNumeral(val);
      setRomanResult(isNaN(num) ? 'Invalid Roman numeral' : String(num));
    }
  };

  // 7. NUMBER TO WORDS & WORDS TO NUMBER
  const [numWordsVal, setNumWordsVal] = useState(1250000);
  const [numWordsSystem, setNumWordsSystem] = useState<'international' | 'indian'>('international');
  const [numWordsCurrency, setNumWordsCurrency] = useState(false);
  const wordsOutput = numberToWords(numWordsVal, numWordsSystem, numWordsCurrency);
  const [wordsInput, setWordsInput] = useState('two million four hundred fifty thousand seven hundred');
  const parsedWords = wordsToNumber(wordsInput);

  // 8. SCIENTIFIC NOTATION & READING TIME
  const [sciNumber, setSciNumber] = useState(299792458);
  const sciResult = toScientificNotation(sciNumber);
  const [readingSampleText, setReadingSampleText] = useState(
    'Global digital transformation empowers learners across North America, Europe, and Asia with instant client-side study calculators, focus timers, and academic citation tools that work completely offline and protect student privacy.'
  );
  const [readingWpm, setReadingWpm] = useState(200);
  const readingMetrics = calculateReadingTime(readingSampleText, readingWpm);

  // 9. CITATION & BIBLIOGRAPHY GENERATOR
  const [citationData, setCitationData] = useState<CitationData>({
    authors: 'Smith, J. A., & Davis, R. M.',
    year: '2026',
    title: 'Principles of Modern Machine Learning and Artificial Intelligence',
    source: 'Academic Press / IEEE Transactions',
    urlOrDoi: 'https://doi.org/10.1000/182',
  });
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const formattedCitation = formatCitation(citationData, citationStyle);
  const [bibList, setBibList] = useState<string[]>([
    'Smith, J. A., & Davis, R. M. (2026). Principles of Modern Machine Learning and Artificial Intelligence. Academic Press / IEEE Transactions. https://doi.org/10.1000/182',
  ]);

  // 10. EXAM TIMER & STOPWATCH (with Laps!)
  const [timerDuration, setTimerDuration] = useState(30 * 60);
  const [timerRemaining, setTimerRemaining] = useState(30 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState<string[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerRunning, timerRemaining]);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null;
    if (swRunning) {
      const start = Date.now() - swMs;
      iv = setInterval(() => setSwMs(Date.now() - start), 50);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [swRunning]);

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  // 11. TYPING SPEED TEST
  const samplePassage =
    'The quick brown fox jumps over the lazy dog. Success in competitive examinations requires relentless consistency, smart time management, and daily revision of fundamental concepts.';
  const [typingInput, setTypingInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingWpm, setTypingWpm] = useState(0);
  const [typingAccuracy, setTypingAccuracy] = useState(100);

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!typingStartTime) setTypingStartTime(Date.now());
    setTypingInput(val);

    const elapsedSeconds = typingStartTime ? Math.max((Date.now() - typingStartTime) / 1000, 1) : 1;
    const wordsTyped = val.trim().split(/\s+/).filter(Boolean).length;
    setTypingWpm(Math.round((wordsTyped / elapsedSeconds) * 60));

    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === samplePassage[i]) correctChars++;
    }
    setTypingAccuracy(val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100);
  };

  // 12. CONTROLLED STUDY NOTES (localStorage)
  const [noteTitle, setNoteTitle] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mdn_study_note_title') || 'Biology Chapter 3 — Cell Division & Mitosis Notes';
    }
    return 'Biology Chapter 3 — Cell Division & Mitosis Notes';
  });
  const [noteBody, setNoteBody] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('mdn_study_note_body') ||
        `# Key Concepts:\n1. Prophase: Chromatin condenses into visible chromosomes.\n2. Metaphase: Chromosomes align along equatorial metaphase plate.\n3. Anaphase: Sister chromatids separate to opposite poles.`
      );
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mdn_study_note_title', noteTitle);
      localStorage.setItem('mdn_study_note_body', noteBody);
    }
  }, [noteTitle, noteBody]);

  // 13. GRADE / GPA / EXAM MARKS CALCULATOR
  const [eduCourses, setEduCourses] = useState([
    { courseName: 'Computer Science', credits: 4, grade: 'A' },
    { courseName: 'Mathematics', credits: 4, grade: 'A-' },
    { courseName: 'Physics', credits: 3, grade: 'B+' },
    { courseName: 'English Literature', credits: 2, grade: 'A' },
  ]);
  const [marksObtained, setMarksObtained] = useState(465);
  const [marksMax, setMarksMax] = useState(500);
  const gpaRes = calculateGpa(eduCourses);
  const marksRes = calculateMarksPercentage(marksObtained, marksMax);

  // Reset transient interactive tool state when switching tool IDs
  useEffect(() => {
    setTimerRunning(false);
    setSwRunning(false);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setIsPicking(false);
    setIsCardFlipped(false);
  }, [tool.id]);

  return (
    <div className="space-y-6">
      {/* 1. STUDY TIMETABLE MAKER */}
      {tool.id === 'study-timetable-maker' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white tracking-wide">Interactive Weekly Study Timetable</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Customize daily subjects, schedule slots, and export a printable study matrix.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportTimetableText}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Schedule
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
              const count = (timetableDays[day] || []).length;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`py-2 px-1 text-center rounded-xl transition font-medium text-xs flex flex-col items-center gap-0.5 ${
                    activeDay === day ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`text-[10px] px-1.5 rounded-full font-mono ${activeDay === day ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              {(timetableDays[activeDay] || []).map((slot) => (
                <div key={slot.id} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${slot.color}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-slate-300">{slot.time}</div>
                      <div className="text-sm font-bold text-white truncate">{slot.subject}</div>
                      <div className="text-xs opacity-80 truncate">{slot.topic}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${slot.subject} session`}
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 hover:bg-black/30 rounded-lg text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-rose-500" /> Add Study Session to {activeDay}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label htmlFor="tt-time" className="text-[10px] text-slate-400 block mb-1 font-mono">Time Range:</label>
                  <input id="tt-time" type="text" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs" />
                </div>
                <div>
                  <label htmlFor="tt-subj" className="text-[10px] text-slate-400 block mb-1 font-mono">Subject Name:</label>
                  <input id="tt-subj" type="text" value={newSlotSubject} onChange={(e) => setNewSlotSubject(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs" />
                </div>
                <div>
                  <label htmlFor="tt-top" className="text-[10px] text-slate-400 block mb-1 font-mono">Topic / Target:</label>
                  <input id="tt-top" type="text" value={newSlotTopic} onChange={(e) => setNewSlotTopic(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs" />
                </div>
              </div>
              <button type="button" onClick={handleAddSlot} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLASHCARD MAKER */}
      {tool.id === 'flashcard-maker' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">Interactive Revision Flashcards</h3>
              </div>
              <p className="text-xs text-slate-400">Activate card to flip between Question and Answer.</p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Card {currentCardIndex + 1} of {flashcards.length}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="w-full cursor-pointer min-h-[200px] rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 hover:border-rose-500/60 transition-all flex flex-col items-center justify-center text-center shadow-2xl relative"
          >
            <span className="absolute top-4 left-4 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {isCardFlipped ? 'ANSWER' : 'QUESTION'}
            </span>
            <span className="absolute top-4 right-4 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <RotateCw className="w-3.5 h-3.5" /> Click to Flip
            </span>
            <span className="text-xl font-bold text-white leading-relaxed max-w-xl">
              {isCardFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
            </span>
          </button>

          <div className="flex items-center justify-between">
            <button type="button" onClick={handlePrevCard} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-800">← Previous Card</button>
            <button type="button" onClick={() => setIsCardFlipped(!isCardFlipped)} className="px-4 py-2 bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/40 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" /> Flip Card
            </button>
            <button type="button" onClick={handleNextCard} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold">Next Card →</button>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-500" /> Add Custom Revision Flashcard
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input aria-label="Flashcard Front Question" type="text" value={newCardFront} onChange={(e) => setNewCardFront(e.target.value)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder="Front: Question or Concept" />
              <input aria-label="Flashcard Back Answer" type="text" value={newCardBack} onChange={(e) => setNewCardBack(e.target.value)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder="Back: Answer or Derivation" />
            </div>
            <button type="button" onClick={handleAddFlashcard} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Save Card to Deck
            </button>
          </div>
        </div>
      )}

      {/* 3. QUIZ GENERATOR & MCQ PRACTICE */}
      {(tool.id === 'quiz-generator' || tool.id === 'mcq-practice-tool') && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">{tool.id === 'quiz-generator' ? 'Custom Quiz Builder & Simulator' : 'Interactive MCQ Practice Simulator'}</h3>
              </div>
              <p className="text-xs text-slate-400">Instant answer evaluation, concept explanations, and custom question builder.</p>
            </div>
            {!quizFinished && (
              <div className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                Question {quizIndex + 1} of {quizBank.length}
              </div>
            )}
          </div>

          {!quizFinished ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm sm:text-base font-bold text-white">
                {quizBank[quizIndex].q}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quizBank[quizIndex].options.map((opt, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === quizBank[quizIndex].ans;
                  let btnStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700';
                  if (selectedAnswer !== null) {
                    if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                    else btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50';
                  }
                  return (
                    <button key={i} type="button" disabled={selectedAnswer !== null} onClick={() => handleAnswerSelect(i)} className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">{String.fromCharCode(65 + i)}</span>
                        <span>{opt}</span>
                      </div>
                      {selectedAnswer !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-rose-400" /> Explanation:</div>
                  <div>{quizBank[quizIndex].explanation}</div>
                </div>
              )}

              {selectedAnswer !== null && (
                <div className="flex justify-end">
                  <button type="button" onClick={handleNextQuizQuestion} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold">
                    {quizIndex + 1 < quizBank.length ? 'Next Question →' : 'View Final Score'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
              <h4 className="text-xl font-bold text-white">Assessment Completed!</h4>
              <p className="text-xs text-slate-400">Score: {quizScore} / {quizBank.length} ({Math.round((quizScore / quizBank.length) * 100)}%)</p>
              <button type="button" onClick={() => { setQuizIndex(0); setSelectedAnswer(null); setQuizScore(0); setQuizFinished(false); }} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Restart Quiz
              </button>
            </div>
          )}

          {tool.id === 'quiz-generator' && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="font-bold text-slate-300 uppercase">Add Custom Question to Quiz Bank</div>
              <input type="text" placeholder="Question prompt..." value={customQ} onChange={(e) => setCustomQ(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input type="text" placeholder="Option A" value={customOptA} onChange={(e) => setCustomOptA(e.target.value)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                <input type="text" placeholder="Option B" value={customOptB} onChange={(e) => setCustomOptB(e.target.value)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                <input type="text" placeholder="Option C" value={customOptC} onChange={(e) => setCustomOptC(e.target.value)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                <input type="text" placeholder="Option D" value={customOptD} onChange={(e) => setCustomOptD(e.target.value)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-slate-400">Correct Option:
                  <select value={customCorrectIdx} onChange={(e) => setCustomCorrectIdx(Number(e.target.value))} className="ml-2 p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white">
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!customQ.trim() || !customOptA.trim() || !customOptB.trim()) return;
                    setQuizBank([...quizBank, { q: customQ, options: [customOptA, customOptB, customOptC || 'Option C', customOptD || 'Option D'], ans: customCorrectIdx, explanation: 'Custom study bank question.' }]);
                    setCustomQ(''); setCustomOptA(''); setCustomOptB(''); setCustomOptC(''); setCustomOptD('');
                  }}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
                >
                  Add to Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. RANDOM QUESTION PICKER (VIVA) */}
      {tool.id === 'random-question-picker' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Shuffle className="w-5 h-5 text-rose-500" /> Viva &amp; Oral Exam Question Picker</h3>
              <p className="text-xs text-slate-400">Randomly pick study or interview questions from your custom prompt bank.</p>
            </div>
            <button type="button" disabled={isPicking} onClick={handlePickRandomQuestion} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Shuffle className={`w-3.5 h-3.5 ${isPicking ? 'animate-spin' : ''}`} /> Pick Question
            </button>
          </div>
          {pickedQuestion && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-rose-400 uppercase font-bold">
                <span>Selected Question</span>
                <button type="button" onClick={() => copyToClipboard(pickedQuestion)} className="hover:text-white">{copied ? 'Copied!' : 'Copy'}</button>
              </div>
              <div className="text-base sm:text-lg font-bold text-white">"{pickedQuestion}"</div>
            </div>
          )}
          <div>
            <label htmlFor="viva-bank" className="text-xs font-mono text-slate-400 block mb-1.5">Question Bank (one question per line):</label>
            <textarea id="viva-bank" rows={5} value={vivaQuestions} onChange={(e) => setVivaQuestions(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs" />
          </div>
        </div>
      )}

      {/* 5. MATH EQUATION SOLVER (Quadratic + Linear) */}
      {tool.id === 'math-equation-solver' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-rose-500" /> Algebra Equation Solver</h3>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setEqMode('quadratic')} className={`px-3 py-1.5 rounded-lg font-bold ${eqMode === 'quadratic' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>Quadratic (ax²+bx+c=0)</button>
              <button type="button" onClick={() => setEqMode('linear')} className={`px-3 py-1.5 rounded-lg font-bold ${eqMode === 'linear' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>Linear (ax+b=c)</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><label htmlFor="eq-a" className="font-mono text-slate-400 block mb-1">Coeff a:</label><input id="eq-a" type="number" value={coeffA} onChange={(e) => setCoeffA(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm" /></div>
            <div><label htmlFor="eq-b" className="font-mono text-slate-400 block mb-1">Coeff b:</label><input id="eq-b" type="number" value={coeffB} onChange={(e) => setCoeffB(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm" /></div>
            <div><label htmlFor="eq-c" className="font-mono text-slate-400 block mb-1">{eqMode === 'quadratic' ? 'Coeff c:' : 'Target c:'}</label><input id="eq-c" type="number" value={coeffC} onChange={(e) => setCoeffC(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm" /></div>
          </div>

          {eqMode === 'quadratic' ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">ROOT x₁</div><div className="text-base font-bold text-rose-400 font-mono">{quadResult.root1}</div></div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">ROOT x₂</div><div className="text-base font-bold text-rose-400 font-mono">{quadResult.root2}</div></div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">DISCRIMINANT</div><div className="text-base font-bold text-white font-mono">{quadResult.discriminant}</div></div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">VERTEX</div><div className="text-base font-bold text-white font-mono">({quadResult.vertex.x}, {quadResult.vertex.y})</div></div>
              </div>
              <ol className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 list-decimal list-inside space-y-1 text-xs text-slate-300 font-mono">
                {quadResult.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </>
          ) : (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-lg font-bold text-rose-400">Solution: x = {linearResult.solution}</div>
              <ol className="list-decimal list-inside text-slate-300 space-y-1">
                {linearResult.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* 6. ROMAN NUMERAL CONVERTER */}
      {tool.id === 'roman-numeral-converter' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Two-Way Roman Numeral Converter</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="rom-num" className="font-mono text-slate-400 block mb-1">Arabic Number (1 – 3,999):</label>
              <input id="rom-num" type="number" value={romanMode === 'toRoman' ? romanInput : romanResult} onChange={(e) => handleRomanChange(e.target.value, 'toRoman')} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base" />
            </div>
            <div>
              <label htmlFor="rom-sym" className="font-mono text-slate-400 block mb-1">Roman Numeral:</label>
              <input id="rom-sym" type="text" value={romanMode === 'fromRoman' ? romanInput : romanResult} onChange={(e) => handleRomanChange(e.target.value, 'fromRoman')} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-rose-400 font-mono font-bold text-base uppercase" />
            </div>
          </div>
        </div>
      )}

      {/* 7. NUMBER TO WORDS & WORDS TO NUMBER */}
      {tool.id === 'number-to-words' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Number to Spelled Words Converter</h3>
          <div>
            <label htmlFor="ntw-inp" className="font-mono text-slate-400 block mb-1">Enter Number:</label>
            <input id="ntw-inp" type="number" value={numWordsVal} onChange={(e) => setNumWordsVal(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setNumWordsSystem('international')} className={`px-3 py-1.5 rounded-lg font-bold ${numWordsSystem === 'international' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'}`}>International (Millions/Billions)</button>
            <button type="button" onClick={() => setNumWordsSystem('indian')} className={`px-3 py-1.5 rounded-lg font-bold ${numWordsSystem === 'indian' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'}`}>Indian (Lakhs/Crores)</button>
            <label className="flex items-center gap-1.5 ml-auto text-slate-300">
              <input type="checkbox" checked={numWordsCurrency} onChange={(e) => setNumWordsCurrency(e.target.checked)} className="accent-rose-500" /> Cheque Currency Suffix
            </label>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-base font-bold text-white">{wordsOutput}</div>
        </div>
      )}

      {tool.id === 'words-to-number' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">English Words to Number Parser</h3>
          <div>
            <label htmlFor="wtn-inp" className="font-mono text-slate-400 block mb-1">Spelled Number Words (supports Million, Billion, Trillion, Lakh, Crore):</label>
            <input id="wtn-inp" type="text" value={wordsInput} onChange={(e) => setWordsInput(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-rose-400 font-mono">NUMERIC VALUE</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-0.5">{parsedWords.error ? parsedWords.error : parsedWords.formatted}</div>
            </div>
            {parsedWords.value !== null && (
              <button type="button" onClick={() => copyToClipboard(String(parsedWords.value))} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold">
                {copied ? 'Copied!' : 'Copy Digits'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. SCIENTIFIC NOTATION & READING TIME */}
      {tool.id === 'scientific-notation-converter' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Scientific &amp; Engineering Notation Converter</h3>
          <div>
            <label htmlFor="sci-inp" className="font-mono text-slate-400 block mb-1">Enter Decimal or Large Number:</label>
            <input id="sci-inp" type="number" step="any" value={sciNumber} onChange={(e) => setSciNumber(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">SCIENTIFIC</div><div className="text-sm font-bold text-rose-400 mt-1">{sciResult.scientific}</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">ENGINEERING</div><div className="text-sm font-bold text-white mt-1">{sciResult.engineering}</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">E-NOTATION</div><div className="text-sm font-bold text-emerald-400 mt-1">{sciResult.exponential}</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">ORDER OF MAGNITUDE</div><div className="text-sm font-bold text-white mt-1">10^{sciResult.magnitude}</div></div>
          </div>
        </div>
      )}

      {tool.id === 'reading-time-calculator' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Article Reading &amp; Speech Time Calculator</h3>
            <label className="text-slate-300 flex items-center gap-2">Speed ({readingWpm} WPM):
              <input type="range" min={100} max={400} step={10} value={readingWpm} onChange={(e) => setReadingWpm(Number(e.target.value))} className="accent-rose-500" />
            </label>
          </div>
          <textarea aria-label="Article text for reading time" rows={5} value={readingSampleText} onChange={(e) => setReadingSampleText(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">SILENT READING</div><div className="text-lg font-bold text-rose-400">{readingMetrics.readingMinutes}m {readingMetrics.readingSeconds}s</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">SPEAKING (130 WPM)</div><div className="text-lg font-bold text-emerald-400">{readingMetrics.speakingMinutes}m {readingMetrics.speakingSeconds}s</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">WORDS</div><div className="text-lg font-bold text-white">{readingMetrics.words}</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">SENTENCES</div><div className="text-lg font-bold text-white">{readingMetrics.sentences}</div></div>
          </div>
        </div>
      )}

      {/* 9. CITATION & BIBLIOGRAPHY GENERATOR */}
      {(tool.id === 'citation-generator' || tool.id === 'bibliography-generator') && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white">Academic Citation &amp; Bibliography Builder</h3>
            <div className="flex gap-1.5">
              {(['apa', 'mla', 'chicago', 'harvard'] as const).map((style) => (
                <button key={style} type="button" onClick={() => setCitationStyle(style)} className={`px-3 py-1.5 rounded-lg uppercase font-bold ${citationStyle === style ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'}`}>{style}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label htmlFor="cit-auth" className="block text-slate-400 mb-1">Authors (Last, F. M.)</label><input id="cit-auth" type="text" value={citationData.authors} onChange={(e) => setCitationData({ ...citationData, authors: e.target.value })} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
            <div><label htmlFor="cit-yr" className="block text-slate-400 mb-1">Publication Year</label><input id="cit-yr" type="text" value={citationData.year} onChange={(e) => setCitationData({ ...citationData, year: e.target.value })} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
            <div className="sm:col-span-2"><label htmlFor="cit-tit" className="block text-slate-400 mb-1">Title of Article / Book</label><input id="cit-tit" type="text" value={citationData.title} onChange={(e) => setCitationData({ ...citationData, title: e.target.value })} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
            <div><label htmlFor="cit-src" className="block text-slate-400 mb-1">Journal / Publisher</label><input id="cit-src" type="text" value={citationData.source} onChange={(e) => setCitationData({ ...citationData, source: e.target.value })} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
            <div><label htmlFor="cit-doi" className="block text-slate-400 mb-1">URL or DOI</label><input id="cit-doi" type="text" value={citationData.urlOrDoi || ''} onChange={(e) => setCitationData({ ...citationData, urlOrDoi: e.target.value })} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" /></div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-rose-400 font-mono">Formatted Citation ({citationStyle.toUpperCase()})</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => copyToClipboard(formattedCitation)} className="px-2.5 py-1 bg-slate-800 text-white rounded-lg">{copied ? 'Copied!' : 'Copy'}</button>
                <button type="button" onClick={() => setBibList([...bibList, formattedCitation])} className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold">+ Add to Bibliography</button>
              </div>
            </div>
            <div className="text-sm font-serif italic text-white p-3 bg-slate-950 rounded-xl border border-slate-800/60">{formattedCitation}</div>
          </div>

          {bibList.length > 0 && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-300">
                <span>Saved Bibliography References ({bibList.length})</span>
                <button type="button" onClick={() => copyToClipboard(bibList.join('\n\n'))} className="text-rose-400 hover:underline">Copy Full Bibliography</button>
              </div>
              {bibList.map((entry, idx) => (
                <div key={idx} className="flex justify-between gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-serif">
                  <span>{entry}</span>
                  <button type="button" onClick={() => setBibList(bibList.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 shrink-0">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 10. EXAM TIMER & STOPWATCH */}
      {tool.id === 'online-exam-timer' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl text-center">
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2 border-b border-slate-800 pb-4">
            <Timer className="w-5 h-5 text-rose-500" /> Full-Screen Exam Countdown Timer
          </h3>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[15, 30, 60, 90, 180].map((mins) => (
              <button key={mins} type="button" onClick={() => { setTimerRunning(false); setTimerDuration(mins * 60); setTimerRemaining(mins * 60); }} className={`px-3 py-1.5 rounded-lg font-mono font-bold ${timerDuration === mins * 60 ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>{mins} min</button>
            ))}
          </div>
          <div className="py-8 bg-slate-900 rounded-3xl border border-slate-800 max-w-sm mx-auto">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-widest text-white">{formatSeconds(timerRemaining)}</div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={() => setTimerRunning(!timerRunning)} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {timerRunning ? 'Pause Clock' : 'Start Exam Timer'}
            </button>
            <button type="button" onClick={() => { setTimerRunning(false); setTimerRemaining(timerDuration); }} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      )}

      {tool.id === 'online-stopwatch' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl text-center">
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2 border-b border-slate-800 pb-4">
            <Clock className="w-5 h-5 text-rose-500" /> Precision Study Stopwatch &amp; Lap Recorder
          </h3>
          <div className="py-8 bg-slate-900 rounded-3xl border border-slate-800 max-w-sm mx-auto">
            <div className="text-5xl sm:text-6xl font-mono font-bold text-white">{formatStopwatch(swMs)}</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setSwRunning(!swRunning)} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center gap-2">
              {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {swRunning ? 'Pause' : 'Start Stopwatch'}
            </button>
            <button type="button" onClick={() => setSwLaps((prev) => [formatStopwatch(swMs), ...prev])} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold">Record Lap</button>
            <button type="button" onClick={() => { setSwRunning(false); setSwMs(0); setSwLaps([]); }} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold">Reset</button>
          </div>
          {swLaps.length > 0 && (
            <div className="max-w-sm mx-auto text-left space-y-1 text-xs font-mono">
              {swLaps.map((lap, idx) => (
                <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between text-slate-300">
                  <span>Lap #{swLaps.length - idx}</span><span className="text-rose-400 font-bold">{lap}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 11. TYPING SPEED TEST */}
      {tool.id === 'typing-speed-test' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Live Typing Speed &amp; Accuracy Test</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">SPEED</div><div className="text-2xl font-bold text-rose-400 font-mono">{typingWpm} WPM</div></div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">ACCURACY</div><div className="text-2xl font-bold text-emerald-400 font-mono">{typingAccuracy}%</div></div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 font-mono">TYPED</div><div className="text-2xl font-bold text-white font-mono">{typingInput.length}</div></div>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-sm text-slate-300 font-mono">{samplePassage}</div>
          <textarea aria-label="Typing test area" rows={4} value={typingInput} onChange={handleTypingChange} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-sm" placeholder="Start typing the passage above here..." />
        </div>
      )}

      {/* 12. CONTROLLED STUDY NOTES MAKER */}
      {tool.id === 'notes-maker' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4 shadow-2xl text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-rose-500" /> Quick Study Notes Workspace</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([`# ${noteTitle}\n\n${noteBody}`], { type: 'text/markdown' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `${noteTitle.slice(0, 30).replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'study-notes'}.md`;
                  a.click();
                }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export .MD
              </button>
              <button type="button" onClick={() => copyToClipboard(`${noteTitle}\n\n${noteBody}`)} className="px-3 py-1.5 bg-slate-800 text-white rounded-xl font-semibold">{copied ? 'Copied!' : 'Copy Notes'}</button>
            </div>
          </div>
          <input aria-label="Study note title" type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-base" placeholder="Note Title" />
          <textarea aria-label="Study note markdown body" rows={8} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm font-mono" placeholder="Type your study notes here..." />
        </div>
      )}

      {/* 13. GRADE / EDUCATION GPA CALCULATOR */}
      {(tool.id === 'grade-calculator' || tool.id === 'education-gpa-calculator') && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">{tool.id === 'grade-calculator' ? 'Weighted Course Grade & GPA Calculator' : 'Academic Semester GPA Calculator'}</h3>
            <button type="button" onClick={() => setEduCourses([...eduCourses, { courseName: `Course ${eduCourses.length + 1}`, credits: 3, grade: 'A' }])} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold">+ Add Course</button>
          </div>
          <div className="space-y-2">
            {eduCourses.map((c, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input aria-label={`Course ${idx + 1} name`} type="text" value={c.courseName} onChange={(e) => { const next = [...eduCourses]; next[idx].courseName = e.target.value; setEduCourses(next); }} className="col-span-6 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white" />
                <input aria-label={`Course ${idx + 1} credits`} type="number" min={1} max={10} value={c.credits} onChange={(e) => { const next = [...eduCourses]; next[idx].credits = Number(e.target.value); setEduCourses(next); }} className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" />
                <select aria-label={`Course ${idx + 1} grade`} value={c.grade} onChange={(e) => { const next = [...eduCourses]; next[idx].grade = e.target.value; setEduCourses(next); }} className="col-span-2 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono">
                  {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <button type="button" aria-label={`Delete course ${idx + 1}`} onClick={() => setEduCourses(eduCourses.filter((_, i) => i !== idx))} className="col-span-1 text-slate-400 hover:text-rose-400 font-bold">×</button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">GPA (4.0 SCALE)</div><div className="text-2xl font-bold text-rose-400">{gpaRes.gpa}</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">TOTAL CREDITS</div><div className="text-2xl font-bold text-white">{gpaRes.totalCredits}</div></div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">GRADE POINTS</div><div className="text-2xl font-bold text-emerald-400">{gpaRes.totalPoints}</div></div>
          </div>
        </div>
      )}

      {/* 14. EXAM MARKS CALCULATOR */}
      {tool.id === 'exam-marks-calculator' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-2xl text-xs">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Exam Marks &amp; Division Percentage Calculator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label htmlFor="ex-obt" className="block text-slate-400 mb-1">Marks Obtained:</label><input id="ex-obt" type="number" value={marksObtained} onChange={(e) => setMarksObtained(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base" /></div>
            <div><label htmlFor="ex-max" className="block text-slate-400 mb-1">Maximum Possible Marks:</label><input id="ex-max" type="number" min={1} value={marksMax} onChange={(e) => setMarksMax(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">PERCENTAGE</div><div className="text-2xl font-bold text-rose-400 mt-1">{marksRes.percentage}%</div></div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">SCORE FRACTION</div><div className="text-lg font-bold text-white mt-1">{marksRes.fraction}</div></div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><div className="text-[10px] text-slate-400">CLASSIFICATION</div><div className="text-sm font-bold text-emerald-400 mt-1">{marksRes.grade}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};
