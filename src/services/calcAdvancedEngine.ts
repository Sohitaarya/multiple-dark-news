/**
 * Advanced Calculator Engine covering ALL 30 Calculator Tools
 * 100% pure TypeScript mathematical, financial, international tax, health, and statistical engines.
 */

/**
 * Safe recursive-descent mathematical expression evaluator (NO eval/Function)
 * Supports: +, -, *, /, %, ^, parentheses, pi, e, sqrt, sin, cos, tan, log, ln, abs, factorial
 */
export function evaluateMathExpression(expr: string, degreeMode = true): number {
  const input = expr.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!input) return 0;

  let pos = 0;

  const peek = () => input[pos];
  const consume = () => input[pos++];

  const toRad = (v: number) => (degreeMode ? (v * Math.PI) / 180 : v);

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('Invalid factorial operand');
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const parseExpression = (): number => {
    let val = parseTerm();
    while (pos < input.length && (peek() === '+' || peek() === '-')) {
      const op = consume();
      const right = parseTerm();
      val = op === '+' ? val + right : val - right;
    }
    return val;
  };

  const parseTerm = (): number => {
    let val = parsePower();
    while (pos < input.length && (peek() === '*' || peek() === '/' || peek() === '%')) {
      const op = consume();
      const right = parsePower();
      if (op === '*') val *= right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        val /= right;
      } else {
        val %= right;
      }
    }
    return val;
  };

  const parsePower = (): number => {
    let val = parseUnary();
    if (pos < input.length && peek() === '^') {
      consume();
      const exp = parsePower();
      val = Math.pow(val, exp);
    }
    return val;
  };

  const parseUnary = (): number => {
    if (peek() === '+') {
      consume();
      return parseUnary();
    }
    if (peek() === '-') {
      consume();
      return -parseUnary();
    }
    return parsePostfix();
  };

  const parsePostfix = (): number => {
    let val = parsePrimary();
    while (pos < input.length && peek() === '!') {
      consume();
      val = factorial(val);
    }
    return val;
  };

  const parsePrimary = (): number => {
    if (peek() === '(') {
      consume();
      const val = parseExpression();
      if (peek() !== ')') throw new Error('Mismatched parentheses');
      consume();
      return val;
    }

    // Number literal
    if (/[0-9.]/.test(peek() || '')) {
      let numStr = '';
      while (pos < input.length && /[0-9.]/.test(peek())) {
        numStr += consume();
      }
      const n = Number(numStr);
      if (isNaN(n)) throw new Error('Invalid number');
      return n;
    }

    // Identifiers (functions & constants)
    let ident = '';
    while (pos < input.length && /[a-zA-Z]/.test(peek())) {
      ident += consume();
    }
    const lower = ident.toLowerCase();
    if (lower === 'pi') return Math.PI;
    if (lower === 'e') return Math.E;

    if (peek() === '(') {
      consume();
      const arg = parseExpression();
      if (peek() !== ')') throw new Error(`Missing closing parenthesis after ${lower}`);
      consume();
      switch (lower) {
        case 'sin': return Math.sin(toRad(arg));
        case 'cos': return Math.cos(toRad(arg));
        case 'tan': return Math.tan(toRad(arg));
        case 'asin': return degreeMode ? (Math.asin(arg) * 180) / Math.PI : Math.asin(arg);
        case 'acos': return degreeMode ? (Math.acos(arg) * 180) / Math.PI : Math.acos(arg);
        case 'atan': return degreeMode ? (Math.atan(arg) * 180) / Math.PI : Math.atan(arg);
        case 'sqrt':
          if (arg < 0) throw new Error('Square root of negative number');
          return Math.sqrt(arg);
        case 'cbrt': return Math.cbrt(arg);
        case 'log':
          if (arg <= 0) throw new Error('Logarithm domain error');
          return Math.log10(arg);
        case 'ln':
          if (arg <= 0) throw new Error('Natural log domain error');
          return Math.log(arg);
        case 'abs': return Math.abs(arg);
        case 'exp': return Math.exp(arg);
        case 'round': return Math.round(arg);
        case 'floor': return Math.floor(arg);
        case 'ceil': return Math.ceil(arg);
        default: throw new Error(`Unknown function: ${ident}`);
      }
    }

    throw new Error(`Unexpected token at position ${pos + 1}`);
  };

  const result = parseExpression();
  if (pos < input.length) {
    throw new Error(`Unexpected character "${input[pos]}"`);
  }
  return Number(result.toPrecision(12));
}

export function calculatePercentage(
  mode: 'percentOf' | 'whatPercent' | 'change',
  a: number,
  b: number
): { result: number; summary: string } {
  if (mode === 'percentOf') {
    const val = (a / 100) * b;
    return { result: Number(val.toFixed(4)), summary: `${a}% of ${b} = ${Number(val.toFixed(4))}` };
  }
  if (mode === 'whatPercent') {
    if (b === 0) return { result: 0, summary: 'Cannot divide by zero' };
    const pct = (a / b) * 100;
    return { result: Number(pct.toFixed(4)), summary: `${a} is ${Number(pct.toFixed(2))}% of ${b}` };
  }
  if (a === 0) return { result: 0, summary: 'Original value cannot be zero' };
  const diffPct = ((b - a) / a) * 100;
  return {
    result: Number(diffPct.toFixed(4)),
    summary: `Change from ${a} to ${b}: ${diffPct >= 0 ? '+' : ''}${Number(diffPct.toFixed(2))}%`,
  };
}

export function calculateDiscount(price: number, discountPct: number, extraTaxPct = 0) {
  const saved = (price * discountPct) / 100;
  const discountedPrice = price - saved;
  const tax = (discountedPrice * extraTaxPct) / 100;
  const finalPrice = discountedPrice + tax;
  return {
    originalPrice: Number(price.toFixed(2)),
    savings: Number(saved.toFixed(2)),
    discountedPrice: Number(discountedPrice.toFixed(2)),
    taxAmount: Number(tax.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
  };
}

export function calculateDateDifference(startStr: string, endStr: string) {
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    throw new Error('Please select valid start and end dates.');
  }
  const [from, to] = s <= e ? [s, e] : [e, s];
  const totalDays = Math.round((to.getTime() - from.getTime()) / 86400000);

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prevDays = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Number((totalDays / 7).toFixed(2)),
    totalHours: totalDays * 24,
  };
}

export function calculateTimeArithmetic(
  h1: number,
  m1: number,
  s1: number,
  op: 'add' | 'sub',
  h2: number,
  m2: number,
  s2: number
) {
  const sec1 = h1 * 3600 + m1 * 60 + s1;
  const sec2 = h2 * 3600 + m2 * 60 + s2;
  const totalSec = op === 'add' ? sec1 + sec2 : sec1 - sec2;
  const sign = totalSec < 0 ? '-' : '';
  const abs = Math.abs(totalSec);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return {
    formatted: `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    totalSeconds: totalSec,
    totalMinutes: Number((totalSec / 60).toFixed(2)),
    totalHours: Number((totalSec / 3600).toFixed(4)),
  };
}

export function calculateBmrAndTdee(
  gender: 'male' | 'female',
  age: number,
  weightKg: number,
  heightCm: number,
  activityFactor = 1.55
) {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(gender === 'male' ? base + 5 : base - 161);
  const tdee = Math.round(bmr * activityFactor);
  return {
    bmr,
    tdee,
    mildLoss: Math.max(1200, tdee - 250),
    weightLoss: Math.max(1200, tdee - 500),
    weightGain: tdee + 400,
  };
}

export function calculateInterest(
  principal: number,
  annualRatePct: number,
  years: number,
  mode: 'simple' | 'compound',
  compoundingPerYear = 12
) {
  if (mode === 'simple') {
    const interest = (principal * annualRatePct * years) / 100;
    const total = principal + interest;
    return {
      principal: Number(principal.toFixed(2)),
      totalInterest: Number(interest.toFixed(2)),
      maturityAmount: Number(total.toFixed(2)),
    };
  }
  const r = annualRatePct / 100;
  const total = principal * Math.pow(1 + r / compoundingPerYear, compoundingPerYear * years);
  const interest = total - principal;
  return {
    principal: Number(principal.toFixed(2)),
    totalInterest: Number(interest.toFixed(2)),
    maturityAmount: Number(total.toFixed(2)),
  };
}

export type TaxCountry = 'US' | 'UK' | 'IN' | 'CA' | 'AU' | 'DE';

const TAX_BRACKETS: Record<TaxCountry, { currency: string; standardDeduction: number; brackets: [number, number][] }> = {
  US: {
    currency: 'USD',
    standardDeduction: 14600,
    brackets: [
      [11600, 0.1],
      [47150, 0.12],
      [100525, 0.22],
      [191950, 0.24],
      [243725, 0.32],
      [609350, 0.35],
      [Infinity, 0.37],
    ],
  },
  UK: {
    currency: 'GBP',
    standardDeduction: 12570,
    brackets: [
      [37700, 0.2],
      [112570, 0.4],
      [Infinity, 0.45],
    ],
  },
  IN: {
    currency: 'INR',
    standardDeduction: 75000,
    brackets: [
      [300000, 0],
      [700000, 0.05],
      [1000000, 0.1],
      [1200000, 0.15],
      [1500000, 0.2],
      [Infinity, 0.3],
    ],
  },
  CA: {
    currency: 'CAD',
    standardDeduction: 15705,
    brackets: [
      [55867, 0.15],
      [111733, 0.205],
      [173205, 0.26],
      [246752, 0.29],
      [Infinity, 0.33],
    ],
  },
  AU: {
    currency: 'AUD',
    standardDeduction: 18200,
    brackets: [
      [26800, 0.16],
      [116800, 0.3],
      [171800, 0.37],
      [Infinity, 0.45],
    ],
  },
  DE: {
    currency: 'EUR',
    standardDeduction: 11784,
    brackets: [
      [17005, 0.14],
      [66760, 0.28],
      [277825, 0.42],
      [Infinity, 0.45],
    ],
  },
};

export function calculateInternationalIncomeTax(country: TaxCountry, grossIncome: number) {
  const cfg = TAX_BRACKETS[country];
  const taxable = Math.max(0, grossIncome - cfg.standardDeduction);
  let remaining = taxable;
  let prevCap = 0;
  let tax = 0;
  let marginalRate = 0;

  for (const [cap, rate] of cfg.brackets) {
    if (remaining <= 0) break;
    const span = cap === Infinity ? remaining : Math.min(remaining, cap - prevCap);
    tax += span * rate;
    marginalRate = rate;
    remaining -= span;
    prevCap = cap;
  }

  const netIncome = grossIncome - tax;
  const effectiveRate = grossIncome > 0 ? (tax / grossIncome) * 100 : 0;

  return {
    country,
    currency: cfg.currency,
    grossIncome: Number(grossIncome.toFixed(2)),
    standardDeduction: cfg.standardDeduction,
    taxableIncome: Number(taxable.toFixed(2)),
    estimatedTax: Number(tax.toFixed(2)),
    netIncome: Number(netIncome.toFixed(2)),
    effectiveRatePct: Number(effectiveRate.toFixed(2)),
    marginalRatePct: Number((marginalRate * 100).toFixed(1)),
  };
}

export function calculateSalaryBreakdown(annualSalary: number, taxPct: number, hoursPerWeek = 40) {
  const tax = (annualSalary * taxPct) / 100;
  const netAnnual = annualSalary - tax;
  return {
    grossAnnual: Number(annualSalary.toFixed(2)),
    netAnnual: Number(netAnnual.toFixed(2)),
    netMonthly: Number((netAnnual / 12).toFixed(2)),
    netBiweekly: Number((netAnnual / 26).toFixed(2)),
    netWeekly: Number((netAnnual / 52).toFixed(2)),
    netDaily: Number((netAnnual / 260).toFixed(2)),
    netHourly: Number((netAnnual / (52 * Math.max(1, hoursPerWeek))).toFixed(2)),
  };
}

export function calculateProfitAndLoss(costPrice: number, sellingPrice: number, units = 1) {
  const totalCost = costPrice * units;
  const totalRevenue = sellingPrice * units;
  const diff = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? (diff / totalRevenue) * 100 : 0;
  const markupPct = totalCost > 0 ? (diff / totalCost) * 100 : 0;
  return {
    status: diff >= 0 ? 'Profit' : 'Loss',
    amount: Number(Math.abs(diff).toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    marginPct: Number(marginPct.toFixed(2)),
    markupPct: Number(markupPct.toFixed(2)),
  };
}

export function calculateAttendance(attended: number, conducted: number, targetPct = 75) {
  if (conducted <= 0) return { currentPct: 0, status: 'Enter conducted classes', actionText: '' };
  const currentPct = Number(((attended / conducted) * 100).toFixed(2));
  const targetRatio = targetPct / 100;
  if (currentPct >= targetPct) {
    const canMiss = Math.max(0, Math.floor(attended / targetRatio - conducted));
    return {
      currentPct,
      status: 'On Track',
      actionText: `You can safely miss up to ${canMiss} upcoming class(es) and stay above ${targetPct}%.`,
    };
  }
  const denom = 1 - targetRatio;
  const need = denom > 0 ? Math.ceil((targetRatio * conducted - attended) / denom) : 0;
  return {
    currentPct,
    status: 'Below Target',
    actionText: `You need to attend ${need} consecutive class(es) without absence to reach ${targetPct}%.`,
  };
}

export function calculateElectricityBill(watts: number, hoursPerDay: number, days: number, ratePerKwh: number) {
  const totalKwh = (watts * hoursPerDay * days) / 1000;
  const totalCost = totalKwh * ratePerKwh;
  return {
    totalKwh: Number(totalKwh.toFixed(3)),
    totalCost: Number(totalCost.toFixed(2)),
    dailyKwh: Number(((watts * hoursPerDay) / 1000).toFixed(3)),
    dailyCost: Number((((watts * hoursPerDay) / 1000) * ratePerKwh).toFixed(2)),
  };
}

export function calculateFuelTripCost(distance: number, efficiencyPerUnit: number, pricePerFuelUnit: number, mode: 'per100' | 'perUnit' = 'perUnit') {
  if (efficiencyPerUnit <= 0) return { fuelNeeded: 0, totalCost: 0 };
  const fuelNeeded = mode === 'per100' ? (distance / 100) * efficiencyPerUnit : distance / efficiencyPerUnit;
  const totalCost = fuelNeeded * pricePerFuelUnit;
  return {
    fuelNeeded: Number(fuelNeeded.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    costPerDist: distance > 0 ? Number((totalCost / distance).toFixed(3)) : 0,
  };
}

export function calculateStatistics(rawNumbers: number[]) {
  const nums = rawNumbers.filter((n) => !isNaN(n)).sort((a, b) => a - b);
  if (nums.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, mode: 'None', min: 0, max: 0, range: 0, stdDev: 0 };
  }
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const mid = Math.floor(nums.length / 2);
  const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];

  const freq: Record<number, number> = {};
  let maxFreq = 0;
  for (const n of nums) {
    freq[n] = (freq[n] || 0) + 1;
    if (freq[n] > maxFreq) maxFreq = freq[n];
  }
  const modes = Object.entries(freq)
    .filter(([, f]) => f === maxFreq && maxFreq > 1)
    .map(([v]) => v);

  const variance = nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
  return {
    count: nums.length,
    sum: Number(sum.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    mode: modes.length > 0 ? modes.join(', ') : 'No duplicate mode',
    min: nums[0],
    max: nums[nums.length - 1],
    range: Number((nums[nums.length - 1] - nums[0]).toFixed(4)),
    stdDev: Number(Math.sqrt(variance).toFixed(4)),
  };
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function calculateRatio(a: number, b: number, scaleTargetA?: number) {
  const g = gcd(a, b);
  const simpA = Math.round(a) / g;
  const simpB = Math.round(b) / g;
  const scaledB = scaleTargetA !== undefined && a !== 0 ? Number(((scaleTargetA * b) / a).toFixed(4)) : null;
  return {
    simplified: `${simpA} : ${simpB}`,
    decimalRatio: b !== 0 ? Number((a / b).toFixed(6)) : 0,
    scaledB,
  };
}

export function calculateFractions(n1: number, d1: number, op: '+' | '-' | '*' | '/', n2: number, d2: number) {
  if (d1 === 0 || d2 === 0) throw new Error('Denominator cannot be zero');
  let num = 0;
  let den = 1;
  if (op === '+') {
    num = n1 * d2 + n2 * d1;
    den = d1 * d2;
  } else if (op === '-') {
    num = n1 * d2 - n2 * d1;
    den = d1 * d2;
  } else if (op === '*') {
    num = n1 * n2;
    den = d1 * d2;
  } else {
    if (n2 === 0) throw new Error('Cannot divide by zero fraction');
    num = n1 * d2;
    den = d1 * n2;
  }
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  return {
    fraction: sDen === 1 ? String(sNum) : `${sNum}/${sDen}`,
    decimal: Number((sNum / sDen).toFixed(6)),
    mixed:
      Math.abs(sNum) > sDen && sDen !== 1
        ? `${Math.trunc(sNum / sDen)} ${Math.abs(sNum % sDen)}/${sDen}`
        : `${sNum}/${sDen}`,
  };
}

export function calculateProbability(favorable: number, total: number, secondProb = 0.5) {
  if (total <= 0) return { pA: 0, pNotA: 1, pAnd: 0, pOr: secondProb, percentage: '0%' };
  const pA = Math.min(1, Math.max(0, favorable / total));
  const pB = Math.min(1, Math.max(0, secondProb));
  return {
    pA: Number(pA.toFixed(6)),
    pNotA: Number((1 - pA).toFixed(6)),
    pAnd: Number((pA * pB).toFixed(6)),
    pOr: Number((pA + pB - pA * pB).toFixed(6)),
    percentage: `${(pA * 100).toFixed(2)}%`,
    odds: favorable > 0 && total > favorable ? `${favorable} : ${total - favorable}` : `${favorable} : 0`,
  };
}

export const GLOBAL_TIMEZONES = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { id: 'America/New_York', label: 'New York (EST/EDT)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { id: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { id: 'Europe/London', label: 'London (GMT/BST)' },
  { id: 'Europe/Berlin', label: 'Berlin / Paris (CET/CEST)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Asia/Kolkata', label: 'India / Mumbai (IST)' },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

export function formatTimeInZones(dateIsoOrNow?: string) {
  const baseDate = dateIsoOrNow ? new Date(dateIsoOrNow) : new Date();
  if (isNaN(baseDate.getTime())) throw new Error('Invalid date/time provided');
  return GLOBAL_TIMEZONES.map((tz) => {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.id,
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(baseDate);
    return { id: tz.id, label: tz.label, formatted };
  });
}
