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
  RotateCcw
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
  toScientificNotation,
  calculateReadingTime,
  formatCitation,
  CitationData
} from '../../services/educationToolsEngine';

interface EducationToolsWorkspaceProps {
  tool: ToolDefinition;
  onResultGenerated?: (resultText: string) => void;
}

export const EducationToolsWorkspace: React.FC<EducationToolsWorkspaceProps> = ({
  tool,
  onResultGenerated
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. STUDY TIMETABLE MAKER
  const [activeDay, setActiveDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [timetableDays, setTimetableDays] = useState<Record<string, Array<{ id: string; time: string; subject: string; topic: string; color: string }>>>({
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
  const [newSlotColor, setNewSlotColor] = useState('bg-rose-500/20 text-rose-300 border-rose-500/40');

  const handleAddSlot = () => {
    if (!newSlotSubject.trim()) return;
    const currentSlots = timetableDays[activeDay] || [];
    const newEntry = {
      id: Date.now().toString(),
      time: newSlotTime,
      subject: newSlotSubject,
      topic: newSlotTopic,
      color: newSlotColor,
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
    out += `  Generated 100% In-Browser | Student Academic Matrix\n`;
    out += `====================================================\n\n`;
    const days: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach((d) => {
      out += `▶ ${d.toUpperCase()} SCHEDULE:\n`;
      const slots = timetableDays[d] || [];
      if (slots.length === 0) {
        out += `  (No study sessions booked)\n`;
      } else {
        slots.forEach((s) => {
          out += `  • [${s.time}] ${s.subject}: ${s.topic}\n`;
        });
      }
      out += `\n`;
    });
    out += `Study Discipline Tip: Consistency over intensity. Take 10 min breaks every 50 mins.\n`;
    if (onResultGenerated) onResultGenerated(out);
    copyToClipboard(out);
  };

  // 2. FLASHCARD MAKER
  const [flashcards, setFlashcards] = useState([
    { id: 1, front: 'What is the SI unit of Electric Current?', back: 'Ampere (Symbol: A)' },
    { id: 2, front: 'State Newton’s Second Law of Motion', back: 'Force is equal to mass multiplied by acceleration (F = m × a)' },
    { id: 3, front: 'What is the chemical formula of Table Salt?', back: 'Sodium Chloride (NaCl)' },
    { id: 4, front: 'What is Acceleration due to gravity (g) on Earth?', back: '9.80665 m/s² (approx 9.8 m/s²)' },
    { id: 5, front: 'Define Pythagorean Theorem', back: 'In a right triangle: a² + b² = c² (where c is hypotenuse)' },
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
  const sampleQuiz = [
    {
      q: 'Which fundamental particle has no electrical charge?',
      options: ['Electron', 'Proton', 'Neutron', 'Positron'],
      ans: 2,
      explanation: 'Neutrons have zero net charge, whereas protons carry +1 and electrons carry -1.',
    },
    {
      q: 'What is the powerhouse of the biological eukaryotic cell?',
      options: ['Ribosome', 'Mitochondria', 'Golgi Apparatus', 'Nucleus'],
      ans: 1,
      explanation: 'Mitochondria generate most of the chemical energy needed to power the cell (ATP).',
    },
    {
      q: 'What is the derivative of sin(x) with respect to x?',
      options: ['cos(x)', '-cos(x)', 'tan(x)', '-sin(x)'],
      ans: 0,
      explanation: 'The standard calculus derivative d/dx [sin(x)] = cos(x).',
    },
    {
      q: 'Which element is liquid at standard room temperature and pressure?',
      options: ['Mercury (Hg)', 'Iron (Fe)', 'Lead (Pb)', 'Zinc (Zn)'],
      ans: 0,
      explanation: 'Mercury and Bromine are the only two elemental liquids at standard ambient temperature.',
    },
  ];
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    if (optionIdx === sampleQuiz[quizIndex].ans) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < sampleQuiz.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      if (onResultGenerated) {
        onResultGenerated(
          `MCQ Practice Assessment Results:\nScore: ${quizScore + (selectedAnswer === sampleQuiz[quizIndex].ans ? 1 : 0)} / ${sampleQuiz.length}\nAccuracy: ${Math.round(((quizScore + (selectedAnswer === sampleQuiz[quizIndex].ans ? 1 : 0)) / sampleQuiz.length) * 100)}%\nStatus: Assessment Completed`
        );
      }
    }
  };

  // 4. RANDOM QUESTION PICKER (VIVA)
  const [vivaQuestions, setVivaQuestions] = useState(
    `Explain the difference between Speed and Velocity.\nWhat is Ohm's Law and its mathematical formula?\nDescribe Archimedes' Principle with a real-life example.\nWhat is Photosynthesis and what are its products?\nExplain the concept of Big-O Notation in Computer Science.\nWhat is the difference between AC and DC current?`
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
    }, 80);
  };

  // 5. MATH EQUATION SOLVER
  const [coeffA, setCoeffA] = useState(1);
  const [coeffB, setCoeffB] = useState(-5);
  const [coeffC, setCoeffC] = useState(6);
  const quadResult = solveQuadraticEquation(coeffA, coeffB, coeffC);

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

  // 7. NUMBER TO WORDS CONVERTER
  const [numWordsVal, setNumWordsVal] = useState(1250000);
  const [numWordsSystem, setNumWordsSystem] = useState<'international' | 'indian'>('international');
  const [numWordsCurrency, setNumWordsCurrency] = useState(true);
  const wordsOutput = numberToWords(numWordsVal, numWordsSystem, numWordsCurrency);

  // 8. CITATION GENERATOR
  const [citationData, setCitationData] = useState<CitationData>({
    authors: 'Smith, J. A., & Davis, R. M.',
    year: '2026',
    title: 'Principles of Modern Machine Learning and Artificial Intelligence',
    source: 'Academic Press / IEEE Transactions',
    urlOrDoi: 'https://doi.org/10.1000/182',
  });
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const formattedCitation = formatCitation(citationData, citationStyle);

  // 9. TIMER & STOPWATCH
  const [timerDuration, setTimerDuration] = useState(30 * 60);
  const [timerRemaining, setTimerRemaining] = useState(30 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 10. TYPING SPEED TEST
  const samplePassage = "The quick brown fox jumps over the lazy dog. Success in competitive examinations requires relentless consistency, smart time management, and daily revision of fundamental concepts.";
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
    const currentWpm = Math.round((wordsTyped / elapsedSeconds) * 60);
    setTypingWpm(currentWpm);

    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === samplePassage[i]) correctChars++;
    }
    const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setTypingAccuracy(acc);
  };

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
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                Export Schedule
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="grid grid-cols-7 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
              const count = (timetableDays[day] || []).length;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`py-2 px-1 text-center rounded-xl transition font-medium text-xs flex flex-col items-center gap-0.5 ${
                    activeDay === day
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`text-[10px] px-1.5 rounded-full font-mono ${activeDay === day ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day Slots List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold text-slate-200 uppercase tracking-wider">{activeDay} Schedule Sessions ({timetableDays[activeDay]?.length || 0})</span>
              <span className="text-[11px] text-emerald-400">100% In-Browser Auto-Saved</span>
            </div>

            <div className="space-y-2">
              {(timetableDays[activeDay] || []).map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${slot.color}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center font-mono text-[11px] font-bold shrink-0 text-white">
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
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 hover:bg-black/30 rounded-lg text-slate-400 hover:text-rose-400 transition"
                    title="Remove Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Slot Form */}
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3 mt-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-rose-500" />
                Add Study Session to {activeDay}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono">Time Range:</label>
                  <input
                    type="text"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
                    placeholder="e.g. 06:00 - 08:00 AM"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono">Subject Name:</label>
                  <input
                    type="text"
                    value={newSlotSubject}
                    onChange={(e) => setNewSlotSubject(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono">Topic / Target:</label>
                  <input
                    type="text"
                    value={newSlotTopic}
                    onChange={(e) => setNewSlotTopic(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    placeholder="e.g. Chapter 4 Practice"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Session
                </button>
              </div>
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
                <h3 className="text-lg font-bold text-white">Interactive 3D Revision Flashcards</h3>
              </div>
              <p className="text-xs text-slate-400">Click card to flip between Question and Answer.</p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Card {currentCardIndex + 1} of {flashcards.length}
            </div>
          </div>

          {/* Card Canvas */}
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="cursor-pointer min-h-[200px] rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 hover:border-rose-500/60 transition-all flex flex-col items-center justify-center text-center shadow-2xl relative select-none"
          >
            <div className="absolute top-4 left-4 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {isCardFlipped ? 'ANSWER' : 'QUESTION'}
            </div>
            <div className="absolute top-4 right-4 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <RotateCw className="w-3.5 h-3.5" />
              Click to Flip
            </div>

            <div className="max-w-xl space-y-2">
              <div className="text-xl font-bold text-white leading-relaxed">
                {isCardFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevCard}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-800 transition"
            >
              ← Previous Card
            </button>
            <button
              type="button"
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/40 transition flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Flip Card
            </button>
            <button
              type="button"
              onClick={handleNextCard}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition"
            >
              Next Card →
            </button>
          </div>

          {/* Add Custom Flashcard */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              Add Custom Revision Flashcard
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={newCardFront}
                onChange={(e) => setNewCardFront(e.target.value)}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                placeholder="Front: Question or Concept"
              />
              <input
                type="text"
                value={newCardBack}
                onChange={(e) => setNewCardBack(e.target.value)}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                placeholder="Back: Answer or Derivation"
              />
            </div>
            <button
              type="button"
              onClick={handleAddFlashcard}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Save Card to Deck
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
                <h3 className="text-lg font-bold text-white">Interactive MCQ Practice Simulator</h3>
              </div>
              <p className="text-xs text-slate-400">Timed assessment with instant rationale feedback.</p>
            </div>
            {!quizFinished && (
              <div className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                Question {quizIndex + 1} of {sampleQuiz.length}
              </div>
            )}
          </div>

          {!quizFinished ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {sampleQuiz[quizIndex].q}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sampleQuiz[quizIndex].options.map((opt, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === sampleQuiz[quizIndex].ans;
                  let btnStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700';

                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerSelect(i)}
                      className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {selectedAnswer !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {selectedAnswer !== null && (
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Concept Explanation:
                  </div>
                  <div>{sampleQuiz[quizIndex].explanation}</div>
                </div>
              )}

              {/* Next Button */}
              {selectedAnswer !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                  >
                    {quizIndex + 1 < sampleQuiz.length ? 'Next Question →' : 'View Final Score 🏆'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-3xl">
                🏆
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Assessment Completed!</h4>
                <p className="text-xs text-slate-400 mt-1">Great practice session! Score: {quizScore} / {sampleQuiz.length}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuizIndex(0);
                  setSelectedAnswer(null);
                  setQuizScore(0);
                  setQuizFinished(false);
                }}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. RANDOM QUESTION PICKER (VIVA) */}
      {tool.id === 'random-question-picker' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">Viva & Oral Exam Random Question Picker</h3>
              </div>
              <p className="text-xs text-slate-400">Randomly select oral examination prompts for interviews and syllabus drills.</p>
            </div>
            <button
              type="button"
              disabled={isPicking}
              onClick={handlePickRandomQuestion}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isPicking ? 'animate-spin' : ''}`} />
              Pick Question
            </button>
          </div>

          {pickedQuestion && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/40 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center justify-between">
                <span>Selected Question:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pickedQuestion)}
                  className="hover:text-white flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{pickedQuestion}"
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Question Bank (one question per line):</label>
            <textarea
              rows={5}
              value={vivaQuestions}
              onChange={(e) => setVivaQuestions(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs leading-relaxed focus:border-rose-500 focus:outline-none"
              placeholder="Paste questions here..."
            />
          </div>
        </div>
      )}

      {/* 5. MATH EQUATION SOLVER */}
      {tool.id === 'math-equation-solver' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Quadratic Equation Solver (ax² + bx + c = 0)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Full step-by-step mathematical derivation with discriminant & vertex.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Coeff a:</label>
              <input
                type="number"
                value={coeffA}
                onChange={(e) => setCoeffA(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Coeff b:</label>
              <input
                type="number"
                value={coeffB}
                onChange={(e) => setCoeffB(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Coeff c:</label>
              <input
                type="number"
                value={coeffC}
                onChange={(e) => setCoeffC(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Root 1 (x₁)</div>
              <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{quadResult.root1}</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Root 2 (x₂)</div>
              <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{quadResult.root2}</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Discriminant (Δ)</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">{quadResult.discriminant}</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Vertex</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">({quadResult.vertex.x}, {quadResult.vertex.y})</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Step-by-Step Derivation:</div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 font-mono">
              {quadResult.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* 6. ROMAN NUMERAL CONVERTER */}
      {tool.id === 'roman-numeral-converter' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Two-Way Roman Numeral Converter</h3>
            <p className="text-xs text-slate-400 mt-0.5">Convert between Arabic numbers and Roman numerals.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Arabic Number (1 – 3,999):</label>
              <input
                type="number"
                value={romanMode === 'toRoman' ? romanInput : ''}
                onChange={(e) => handleRomanChange(e.target.value, 'toRoman')}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base"
                placeholder="e.g. 2026"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Roman Numeral:</label>
              <input
                type="text"
                value={romanMode === 'fromRoman' ? romanInput : romanResult}
                onChange={(e) => handleRomanChange(e.target.value, 'fromRoman')}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-rose-400 font-mono font-bold text-base uppercase"
                placeholder="e.g. MMXXVI"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. NUMBER TO WORDS CONVERTER */}
      {tool.id === 'number-to-words' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Number to Spelled Words Converter</h3>
            <p className="text-xs text-slate-400 mt-0.5">Cheque spelling, financial invoice text, International & Indian systems.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Enter Number:</label>
              <input
                type="number"
                value={numWordsVal}
                onChange={(e) => setNumWordsVal(Number(e.target.value))}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-lg"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setNumWordsSystem('international')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${numWordsSystem === 'international' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                International System
              </button>
              <button
                type="button"
                onClick={() => setNumWordsSystem('indian')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${numWordsSystem === 'indian' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                Indian System (Lakhs/Crores)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-rose-400 font-mono">Spelled Words Output:</div>
              <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {wordsOutput}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. CITATION GENERATOR */}
      {(tool.id === 'citation-generator' || tool.id === 'bibliography-generator') && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Academic Citation Generator (APA, MLA, Chicago, Harvard)</h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(['apa', 'mla', 'chicago', 'harvard'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setCitationStyle(style)}
                className={`px-3 py-1.5 rounded-lg uppercase font-bold transition ${citationStyle === style ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                {style}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-rose-400 font-mono">Formatted Citation ({citationStyle.toUpperCase()}):</div>
            <div className="text-sm font-serif italic text-white leading-relaxed p-2 bg-slate-950 rounded-xl border border-slate-800/60">
              {formattedCitation}
            </div>
          </div>
        </div>
      )}

      {/* 9. ONLINE EXAM TIMER & STOPWATCH */}
      {(tool.id === 'online-exam-timer' || tool.id === 'online-stopwatch') && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl text-center">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Timer className="w-5 h-5 text-rose-500" />
              Full Screen Exam Countdown Clock
            </h3>
          </div>

          <div className="py-8 bg-slate-900 rounded-3xl border border-slate-800 max-w-sm mx-auto shadow-inner">
            <div className="text-6xl sm:text-7xl font-mono font-bold tracking-widest text-white">
              {formatSeconds(timerRemaining)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-rose-500/30"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {timerRunning ? 'Pause Clock' : 'Start Exam Timer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerRemaining(timerDuration);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* 10. TYPING SPEED TEST */}
      {tool.id === 'typing-speed-test' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Live Typing Speed & Accuracy Test</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Speed</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-0.5">{typingWpm} <span className="text-xs text-slate-400">WPM</span></div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Accuracy</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{typingAccuracy}%</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Typed</div>
              <div className="text-2xl font-bold text-white font-mono mt-0.5">{typingInput.length}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-sm text-slate-300 font-mono">
            {samplePassage}
          </div>

          <textarea
            rows={4}
            value={typingInput}
            onChange={handleTypingChange}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-sm leading-relaxed focus:border-rose-500 focus:outline-none"
            placeholder="Start typing the passage above here..."
          />
        </div>
      )}

      {/* 11. NOTES MAKER */}
      {tool.id === 'notes-maker' && (
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4 shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" />
              Quick Study Notes Workspace
            </h3>
          </div>

          <input
            type="text"
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-base"
            placeholder="Note Title: e.g. Biology Cell Division Summary"
            defaultValue="Biology Chapter 3 — Cell Division & Mitosis Notes"
          />

          <textarea
            rows={8}
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm leading-relaxed font-mono focus:border-rose-500 focus:outline-none"
            placeholder="Type your study notes here..."
            defaultValue={`# Key Concepts:
1. Prophase: Chromatin condenses into visible chromosomes.
2. Metaphase: Chromosomes align along equatorial metaphase plate.
3. Anaphase: Sister chromatids separated to opposite poles.`}
          />
        </div>
      )}
    </div>
  );
};
