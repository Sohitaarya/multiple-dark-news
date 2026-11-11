/**
 * Calculate loan EMI and interest breakdown
 */
export function calculateLoanEmi(
  principal: number,
  annualInterestRate: number,
  tenureYears: number
) {
  const monthlyRate = annualInterestRate / 12 / 100;
  const tenureMonths = tenureYears * 12;

  if (monthlyRate === 0) {
    const monthlyPayment = principal / tenureMonths;
    return {
      monthlyEmi: monthlyPayment,
      totalPayment: principal,
      totalInterest: 0,
      tenureMonths,
    };
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEmi: Math.round(emi * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    tenureMonths,
  };
}

/**
 * Calculate BMI with WHO classification
 */
export function calculateBmi(weightKg: number, heightCm: number) {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'Invalid input' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  let color = 'text-green-500';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-500';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    color = 'text-orange-500';
  } else if (bmi >= 30) {
    category = 'Obese';
    color = 'text-rose-500';
  }

  return { bmi, category, color };
}

/**
 * Calculate Age in years, months, and days
 */
export function calculateAge(birthDateString: string) {
  const birth = new Date(birthDateString);
  const now = new Date();

  if (isNaN(birth.getTime()) || birth > now) {
    return { valid: false, message: 'Please provide a valid past date of birth.' };
  }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Next birthday calculation
  let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < now) {
    nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const daysUntilNextBirthday = Math.ceil(
    (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    valid: true,
    years,
    months,
    days,
    daysUntilNextBirthday,
    totalDaysLived: Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

/**
 * Calculate GST (Inclusive / Exclusive)
 */
export function calculateGst(amount: number, gstRatePercent: number, type: 'exclusive' | 'inclusive' = 'exclusive') {
  if (type === 'exclusive') {
    const gstAmount = (amount * gstRatePercent) / 100;
    const totalAmount = amount + gstAmount;
    return {
      baseAmount: amount,
      gstAmount: Number(gstAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      cgst: Number((gstAmount / 2).toFixed(2)),
      sgst: Number((gstAmount / 2).toFixed(2)),
    };
  } else {
    const baseAmount = (amount * 100) / (100 + gstRatePercent);
    const gstAmount = amount - baseAmount;
    return {
      baseAmount: Number(baseAmount.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      totalAmount: amount,
      cgst: Number((gstAmount / 2).toFixed(2)),
      sgst: Number((gstAmount / 2).toFixed(2)),
    };
  }
}

/**
 * Length unit conversions (base unit: meters)
 */
export const LENGTH_UNITS: Record<string, number> = {
  meters: 1,
  kilometers: 1000,
  centimeters: 0.01,
  millimeters: 0.001,
  inches: 0.0254,
  feet: 0.3048,
  yards: 0.9144,
  miles: 1609.344,
};

export function convertLength(value: number, from: string, to: string): number {
  const fromFactor = LENGTH_UNITS[from] || 1;
  const toFactor = LENGTH_UNITS[to] || 1;
  const inMeters = value * fromFactor;
  return Number((inMeters / toFactor).toFixed(6));
}

/**
 * Weight unit conversions (base unit: kilograms)
 */
export const WEIGHT_UNITS: Record<string, number> = {
  kilograms: 1,
  grams: 0.001,
  milligrams: 0.000001,
  pounds: 0.45359237,
  ounces: 0.0283495,
  metricTons: 1000,
};

export function convertWeight(value: number, from: string, to: string): number {
  const fromFactor = WEIGHT_UNITS[from] || 1;
  const toFactor = WEIGHT_UNITS[to] || 1;
  const inKg = value * fromFactor;
  return Number((inKg / toFactor).toFixed(6));
}

/**
 * Temperature conversions
 */
export function convertTemperature(value: number, from: 'C' | 'F' | 'K', to: 'C' | 'F' | 'K'): number {
  // Convert from to Celsius first
  let c = value;
  if (from === 'F') c = ((value - 32) * 5) / 9;
  if (from === 'K') c = value - 273.15;

  // Convert Celsius to to
  let res = c;
  if (to === 'F') res = (c * 9) / 5 + 32;
  if (to === 'K') res = c + 273.15;

  return Number(res.toFixed(2));
}

/**
 * Digital storage conversions (base unit: bytes)
 */
export const STORAGE_UNITS: Record<string, number> = {
  bytes: 1,
  kb: 1000,
  mb: 1000 * 1000,
  gb: 1000 * 1000 * 1000,
  tb: 1000 * 1000 * 1000 * 1000,
  kib: 1024,
  mib: 1024 * 1024,
  gib: 1024 * 1024 * 1024,
  tib: 1024 * 1024 * 1024 * 1024,
};

export function convertStorage(value: number, from: string, to: string): number {
  const fromFactor = STORAGE_UNITS[from] || 1;
  const toFactor = STORAGE_UNITS[to] || 1;
  const inBytes = value * fromFactor;
  return Number((inBytes / toFactor).toFixed(6));
}
