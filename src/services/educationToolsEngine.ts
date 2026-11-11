/**
 * MultipleDarkNews Comprehensive Education & Academic Engine
 * Fully client-side, zero server egress.
 */

export interface CourseGrade {
  courseName: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0.0,
};

/**
 * Calculate GPA from courses
 */
export function calculateGpa(courses: CourseGrade[]): {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  gradeScale: string;
} {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const c of courses) {
    const pts = GRADE_POINTS[c.grade.toUpperCase()] ?? 0;
    totalPoints += pts * c.credits;
    totalCredits += c.credits;
  }

  const gpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

  return {
    gpa,
    totalCredits,
    totalPoints: Number(totalPoints.toFixed(2)),
    gradeScale: 'Standard 4.0 GPA Scale',
  };
}

/**
 * Marks / Percentage Calculator
 */
export function calculateMarksPercentage(obtained: number, maximum: number): {
  percentage: number;
  grade: string;
  fraction: string;
} {
  if (maximum <= 0) return { percentage: 0, grade: 'N/A', fraction: '0/0' };
  const percentage = Number(((obtained / maximum) * 100).toFixed(2));

  let grade = 'F (Fail)';
  if (percentage >= 90) grade = 'A+ (Distinction / Outstanding)';
  else if (percentage >= 80) grade = 'A (First Class with Honors)';
  else if (percentage >= 70) grade = 'B+ (First Class)';
  else if (percentage >= 60) grade = 'B (Second Class)';
  else if (percentage >= 50) grade = 'C (Third Class)';
  else if (percentage >= 40) grade = 'D (Pass)';

  return {
    percentage,
    grade,
    fraction: `${obtained} / ${maximum}`,
  };
}

/**
 * Solve Linear Equation (ax + b = c)
 */
export function solveLinearEquation(a: number, b: number, c: number): {
  solution: number | string;
  steps: string[];
} {
  if (a === 0) {
    if (b === c) return { solution: 'Infinite solutions', steps: ['0x = 0 (Identity)'] };
    return { solution: 'No solution', steps: [`${b} ≠ ${c} (Contradiction)`] };
  }
  const x = (c - b) / a;
  return {
    solution: Number(x.toFixed(4)),
    steps: [
      `Given: ${a}x + (${b}) = ${c}`,
      `Subtract ${b} from both sides: ${a}x = ${c - b}`,
      `Divide by ${a}: x = ${c - b} / ${a} = ${Number(x.toFixed(4))}`,
    ],
  };
}

/**
 * Solve Quadratic Equation (ax² + bx + c = 0)
 */
export function solveQuadraticEquation(a: number, b: number, c: number): {
  discriminant: number;
  nature: string;
  root1: string;
  root2: string;
  vertex: { x: number; y: number };
  steps: string[];
} {
  if (a === 0) {
    const lin = solveLinearEquation(b, c, 0);
    return {
      discriminant: 0,
      nature: 'Linear equation (a = 0)',
      root1: String(lin.solution),
      root2: 'N/A',
      vertex: { x: 0, y: 0 },
      steps: ['Since a = 0, this is a linear equation bx + c = 0.', ...lin.steps],
    };
  }

  const d = b * b - 4 * a * c;
  const vx = -b / (2 * a);
  const vy = c - (b * b) / (4 * a);

  let nature = '';
  let r1 = '';
  let r2 = '';

  if (d > 0) {
    nature = 'Two distinct real roots';
    const x1 = (-b + Math.sqrt(d)) / (2 * a);
    const x2 = (-b - Math.sqrt(d)) / (2 * a);
    r1 = x1.toFixed(4);
    r2 = x2.toFixed(4);
  } else if (d === 0) {
    nature = 'Two equal real roots (Repeated root)';
    const x = -b / (2 * a);
    r1 = x.toFixed(4);
    r2 = x.toFixed(4);
  } else {
    nature = 'Two complex conjugate roots';
    const realPart = (-b / (2 * a)).toFixed(4);
    const imagPart = (Math.sqrt(-d) / (2 * a)).toFixed(4);
    r1 = `${realPart} + ${imagPart}i`;
    r2 = `${realPart} - ${imagPart}i`;
  }

  return {
    discriminant: Number(d.toFixed(4)),
    nature,
    root1: r1,
    root2: r2,
    vertex: { x: Number(vx.toFixed(4)), y: Number(vy.toFixed(4)) },
    steps: [
      `Equation: ${a}x² + (${b})x + (${c}) = 0`,
      `Calculate Discriminant (Δ = b² - 4ac): (${b})² - 4(${a})(${c}) = ${d}`,
      `Quadratic Formula: x = (-b ± √Δ) / 2a`,
      `Root 1: x₁ = ${r1}`,
      `Root 2: x₂ = ${r2}`,
      `Parabola Vertex: (${Number(vx.toFixed(4))}, ${Number(vy.toFixed(4))})`,
    ],
  };
}

/**
 * Roman Numeral Converter (Numbers up to 3999)
 */
const ROMAN_MAP: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRomanNumeral(num: number): string {
  if (num <= 0 || num > 3999 || !Number.isInteger(num)) {
    return 'Invalid (Range: 1 – 3,999)';
  }
  let result = '';
  let n = num;
  for (const [val, sym] of ROMAN_MAP) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result;
}

export function fromRomanNumeral(romanStr: string): number {
  const roman = romanStr.trim().toUpperCase();
  const values: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = values[roman[i]];
    const nxt = values[roman[i + 1]];
    if (!cur) return NaN;
    if (nxt && cur < nxt) {
      total -= cur;
    } else {
      total += cur;
    }
  }
  return total;
}

/**
 * Number to Words Converter (International & Indian System)
 */
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ONES[n] + ' ';
  }
  return str.trim();
}

export function numberToWords(num: number, system: 'international' | 'indian' = 'international', currency = false): string {
  if (num === 0) return currency ? 'Zero Dollars Only' : 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num), system, currency);

  let result = '';
  let n = Math.floor(num);

  if (system === 'indian') {
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const remainder = n;

    if (crore > 0) result += convertHundreds(crore) + ' Crore ';
    if (lakh > 0) result += convertHundreds(lakh) + ' Lakh ';
    if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
    if (remainder > 0) result += convertHundreds(remainder);
  } else {
    const billion = Math.floor(n / 1000000000);
    n %= 1000000000;
    const million = Math.floor(n / 1000000);
    n %= 1000000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const remainder = n;

    if (billion > 0) result += convertHundreds(billion) + ' Billion ';
    if (million > 0) result += convertHundreds(million) + ' Million ';
    if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
    if (remainder > 0) result += convertHundreds(remainder);
  }

  result = result.trim();
  if (currency) {
    result += system === 'indian' ? ' Rupees Only' : ' Dollars Only';
  }
  return result;
}

/**
 * Scientific Notation Converter
 */
export function toScientificNotation(num: number): {
  scientific: string;
  engineering: string;
  exponential: string;
  magnitude: number;
} {
  if (isNaN(num)) return { scientific: '0', engineering: '0', exponential: '0', magnitude: 0 };
  const expStr = num.toExponential();
  const [mantissa, exp] = expStr.split('e');
  const exponentNum = parseInt(exp, 10);

  // Engineering notation: exponent must be multiple of 3
  const engExp = Math.floor(exponentNum / 3) * 3;
  const engMantissa = (num / Math.pow(10, engExp)).toFixed(3);

  return {
    scientific: `${parseFloat(mantissa).toFixed(4)} × 10^${exponentNum}`,
    engineering: `${engMantissa} × 10^${engExp}`,
    exponential: expStr,
    magnitude: exponentNum,
  };
}

/**
 * Reading & Speech Time Calculator
 */
export function calculateReadingTime(text: string, wpm = 200): {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  readingSeconds: number;
  speakingMinutes: number;
  speakingSeconds: number;
} {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n+/).filter(Boolean).length;

  const readingTotalSeconds = Math.ceil((words / wpm) * 60);
  const speakingTotalSeconds = Math.ceil((words / 130) * 60); // standard speech speed 130 WPM

  return {
    words,
    characters,
    sentences,
    paragraphs,
    readingMinutes: Math.floor(readingTotalSeconds / 60),
    readingSeconds: readingTotalSeconds % 60,
    speakingMinutes: Math.floor(speakingTotalSeconds / 60),
    speakingSeconds: speakingTotalSeconds % 60,
  };
}

/**
 * Academic Citation Formatter (APA 7th, MLA 9th, Chicago, Harvard)
 */
export interface CitationData {
  authors: string;
  year: string;
  title: string;
  source: string; // Journal / Publisher / Website Name
  volumeOrEdition?: string;
  pages?: string;
  urlOrDoi?: string;
}

export function formatCitation(data: CitationData, style: 'apa' | 'mla' | 'chicago' | 'harvard'): string {
  const authors = data.authors.trim() || 'Author, A. A.';
  const year = data.year.trim() || '2026';
  const title = data.title.trim() || 'Title of the Work';
  const source = data.source.trim() || 'Publisher / Journal Name';
  const url = data.urlOrDoi ? ` ${data.urlOrDoi}` : '';

  if (style === 'apa') {
    return `${authors} (${year}). ${title}. ${source}.${url}`;
  }
  if (style === 'mla') {
    return `${authors}. "${title}." ${source}, ${year}.${url}`;
  }
  if (style === 'chicago') {
    return `${authors}. "${title}." ${source} (${year}).${url}`;
  }
  return `${authors} (${year}) '${title}', ${source}.${url}`;
}
