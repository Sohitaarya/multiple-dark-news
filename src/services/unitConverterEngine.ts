/**
 * Comprehensive Unit & Currency Conversion Engine
 * Covers ALL 20 unit-converter tool IDs with metric, US/Imperial, SI, and global currencies.
 */

export interface UnitOption {
  id: string;
  label: string;
}

export interface ConverterSpec {
  defaultFrom: string;
  defaultTo: string;
  inputType: 'number' | 'text';
  units: UnitOption[];
  convert: (value: string, from: string, to: string, customRates?: Record<string, number>) => {
    output: string;
    formulaNote?: string;
    allConversions?: { unit: string; value: string }[];
  };
}

const LENGTH_FACTORS: Record<string, number> = {
  meters: 1,
  kilometers: 1000,
  centimeters: 0.01,
  millimeters: 0.001,
  micrometers: 1e-6,
  nanometers: 1e-9,
  inches: 0.0254,
  feet: 0.3048,
  yards: 0.9144,
  miles: 1609.344,
  nauticalMiles: 1852,
};

const WEIGHT_FACTORS: Record<string, number> = {
  kilograms: 1,
  grams: 0.001,
  milligrams: 0.000001,
  metricTons: 1000,
  pounds: 0.45359237,
  ounces: 0.028349523125,
  stones: 6.35029318,
  shortTonsUS: 907.18474,
};

const STORAGE_FACTORS: Record<string, number> = {
  bits: 0.125,
  bytes: 1,
  kb: 1000,
  mb: 1000 ** 2,
  gb: 1000 ** 3,
  tb: 1000 ** 4,
  pb: 1000 ** 5,
  kib: 1024,
  mib: 1024 ** 2,
  gib: 1024 ** 3,
  tib: 1024 ** 4,
};

const AREA_FACTORS: Record<string, number> = {
  sqMeters: 1,
  sqKilometers: 1e6,
  sqCentimeters: 0.0001,
  sqFeet: 0.09290304,
  sqYards: 0.83612736,
  sqInches: 0.00064516,
  sqMiles: 2589988.110336,
  acres: 4046.8564224,
  hectares: 10000,
};

const VOLUME_FACTORS: Record<string, number> = {
  liters: 1,
  milliliters: 0.001,
  cubicMeters: 1000,
  cubicCentimeters: 0.001,
  usGallons: 3.785411784,
  ukGallons: 4.54609,
  usQuarts: 0.946352946,
  usPints: 0.473176473,
  usCups: 0.2365882365,
  usFluidOunces: 0.0295735295625,
};

const SPEED_FACTORS: Record<string, number> = {
  mps: 1,
  kmph: 1 / 3.6,
  mph: 0.44704,
  knots: 0.514444444,
  fps: 0.3048,
  mach: 343,
};

const PRESSURE_FACTORS: Record<string, number> = {
  pa: 1,
  kpa: 1000,
  mpa: 1e6,
  bar: 100000,
  psi: 6894.757293,
  atm: 101325,
  mmHg: 133.322387,
};

const ENERGY_FACTORS: Record<string, number> = {
  joules: 1,
  kilojoules: 1000,
  calories: 4.184,
  kilocalories: 4184,
  wattHours: 3600,
  kilowattHours: 3600000,
  btu: 1055.05585262,
  electronVolts: 1.602176634e-19,
};

const POWER_FACTORS: Record<string, number> = {
  watts: 1,
  kilowatts: 1000,
  megawatts: 1e6,
  horsepowerMech: 745.699872,
  horsepowerMetric: 735.49875,
  btuPerHour: 0.29307107,
};

const TIME_FACTORS: Record<string, number> = {
  nanoseconds: 1e-9,
  milliseconds: 0.001,
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 604800,
  months30: 2592000,
  years365: 31536000,
};

const ANGLE_FACTORS: Record<string, number> = {
  degrees: 1,
  radians: 180 / Math.PI,
  gradians: 0.9,
  turns: 360,
  arcminutes: 1 / 60,
  arcseconds: 1 / 3600,
};

/**
 * Reference FX rates per 1 USD (can be refreshed live by client UI)
 */
export const DEFAULT_USD_FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.5,
  CAD: 1.39,
  AUD: 1.53,
  JPY: 154.2,
  CHF: 0.88,
  CNY: 7.24,
  SGD: 1.34,
  AED: 3.6725,
  SAR: 3.75,
  NZD: 1.69,
  ZAR: 18.1,
  BRL: 5.78,
  MXN: 20.1,
  KRW: 1395,
  NGN: 1650,
  PKR: 278,
  BDT: 119.5,
};

function formatSmartNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-6) return n.toExponential(6);
  return Number(n.toPrecision(8)).toString();
}

function makeLinearConverter(
  factors: Record<string, number>,
  units: UnitOption[],
  defaultFrom: string,
  defaultTo: string
): ConverterSpec {
  return {
    defaultFrom,
    defaultTo,
    inputType: 'number',
    units,
    convert: (raw, from, to) => {
      const val = parseFloat(raw);
      if (isNaN(val)) return { output: 'Enter a valid numeric value.' };
      const fFrom = factors[from] ?? factors[defaultFrom];
      const fTo = factors[to] ?? factors[defaultTo];
      const base = val * fFrom;
      const converted = base / fTo;
      const allConversions = units.map((u) => ({
        unit: u.label,
        value: formatSmartNumber(base / factors[u.id]),
      }));
      return {
        output: formatSmartNumber(converted),
        formulaNote: `1 ${from} = ${formatSmartNumber(fFrom / fTo)} ${to}`,
        allConversions,
      };
    },
  };
}

export function convertFuelEconomy(value: number, from: string, to: string): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  // Convert to base km/L first
  let kmpl = value;
  if (from === 'l100km') kmpl = 100 / value;
  else if (from === 'mpgUS') kmpl = value * 0.425143707;
  else if (from === 'mpgUK') kmpl = value * 0.35400619;

  if (to === 'kmpl') return Number(kmpl.toFixed(4));
  if (to === 'l100km') return Number((100 / kmpl).toFixed(4));
  if (to === 'mpgUS') return Number((kmpl / 0.425143707).toFixed(4));
  if (to === 'mpgUK') return Number((kmpl / 0.35400619).toFixed(4));
  return Number(kmpl.toFixed(4));
}

export function convertBaseNumber(valueStr: string, fromBase: number, toBase: number): string {
  const clean = valueStr.trim();
  if (!clean) throw new Error('Enter a value to convert.');
  const decimalVal = parseInt(clean, fromBase);
  if (isNaN(decimalVal)) {
    throw new Error(`"${clean}" is not a valid Base-${fromBase} number.`);
  }
  return decimalVal.toString(toBase).toUpperCase();
}

export function convertCurrencyAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = DEFAULT_USD_FX_RATES
): { converted: number; rate: number } {
  const rFrom = rates[from] ?? 1;
  const rTo = rates[to] ?? 1;
  const inUsd = amount / rFrom;
  const converted = inUsd * rTo;
  return {
    converted: Number(converted.toFixed(4)),
    rate: Number((rTo / rFrom).toFixed(6)),
  };
}

export const CONVERTER_SPECS: Record<string, ConverterSpec> = {
  'length-converter': makeLinearConverter(
    LENGTH_FACTORS,
    [
      { id: 'meters', label: 'Meters (m)' },
      { id: 'kilometers', label: 'Kilometers (km)' },
      { id: 'centimeters', label: 'Centimeters (cm)' },
      { id: 'millimeters', label: 'Millimeters (mm)' },
      { id: 'inches', label: 'Inches (in)' },
      { id: 'feet', label: 'Feet (ft)' },
      { id: 'yards', label: 'Yards (yd)' },
      { id: 'miles', label: 'Miles (mi)' },
      { id: 'nauticalMiles', label: 'Nautical Miles (nmi)' },
    ],
    'meters',
    'feet'
  ),
  'weight-converter': makeLinearConverter(
    WEIGHT_FACTORS,
    [
      { id: 'kilograms', label: 'Kilograms (kg)' },
      { id: 'grams', label: 'Grams (g)' },
      { id: 'milligrams', label: 'Milligrams (mg)' },
      { id: 'metricTons', label: 'Metric Tons (t)' },
      { id: 'pounds', label: 'Pounds (lb)' },
      { id: 'ounces', label: 'Ounces (oz)' },
      { id: 'stones', label: 'Stones (st)' },
      { id: 'shortTonsUS', label: 'US Short Tons' },
    ],
    'kilograms',
    'pounds'
  ),
  'temperature-converter': {
    defaultFrom: 'C',
    defaultTo: 'F',
    inputType: 'number',
    units: [
      { id: 'C', label: 'Celsius (°C)' },
      { id: 'F', label: 'Fahrenheit (°F)' },
      { id: 'K', label: 'Kelvin (K)' },
    ],
    convert: (raw, from, to) => {
      const val = parseFloat(raw);
      if (isNaN(val)) return { output: 'Enter a valid temperature.' };
      let c = val;
      if (from === 'F') c = ((val - 32) * 5) / 9;
      if (from === 'K') c = val - 273.15;

      const f = (c * 9) / 5 + 32;
      const k = c + 273.15;
      const target = to === 'F' ? f : to === 'K' ? k : c;
      return {
        output: formatSmartNumber(target),
        formulaNote: from === 'C' && to === 'F' ? '(°C × 9/5) + 32 = °F' : 'ITS-90 Thermodynamic Scale',
        allConversions: [
          { unit: 'Celsius (°C)', value: formatSmartNumber(c) },
          { unit: 'Fahrenheit (°F)', value: formatSmartNumber(f) },
          { unit: 'Kelvin (K)', value: formatSmartNumber(k) },
        ],
      };
    },
  },
  'data-storage-converter': makeLinearConverter(
    STORAGE_FACTORS,
    [
      { id: 'bytes', label: 'Bytes (B)' },
      { id: 'kb', label: 'Kilobytes (KB)' },
      { id: 'mb', label: 'Megabytes (MB)' },
      { id: 'gb', label: 'Gigabytes (GB)' },
      { id: 'tb', label: 'Terabytes (TB)' },
      { id: 'pb', label: 'Petabytes (PB)' },
      { id: 'kib', label: 'Kibibytes (KiB)' },
      { id: 'mib', label: 'Mebibytes (MiB)' },
      { id: 'gib', label: 'Gibibytes (GiB)' },
      { id: 'tib', label: 'Tebibytes (TiB)' },
      { id: 'bits', label: 'Bits (b)' },
    ],
    'gb',
    'mb'
  ),
  'mb-to-gb': makeLinearConverter(
    STORAGE_FACTORS,
    [
      { id: 'mb', label: 'Megabytes (MB - Decimal)' },
      { id: 'gb', label: 'Gigabytes (GB - Decimal)' },
      { id: 'mib', label: 'Mebibytes (MiB - Binary)' },
      { id: 'gib', label: 'Gibibytes (GiB - Binary)' },
    ],
    'mb',
    'gb'
  ),
  'kb-to-mb': makeLinearConverter(
    STORAGE_FACTORS,
    [
      { id: 'kb', label: 'Kilobytes (KB - Decimal)' },
      { id: 'mb', label: 'Megabytes (MB - Decimal)' },
      { id: 'kib', label: 'Kibibytes (KiB - Binary)' },
      { id: 'mib', label: 'Mebibytes (MiB - Binary)' },
    ],
    'kb',
    'mb'
  ),
  'area-converter': makeLinearConverter(
    AREA_FACTORS,
    [
      { id: 'sqMeters', label: 'Square Meters (m²)' },
      { id: 'sqFeet', label: 'Square Feet (ft²)' },
      { id: 'sqYards', label: 'Square Yards (yd²)' },
      { id: 'acres', label: 'Acres (ac)' },
      { id: 'hectares', label: 'Hectares (ha)' },
      { id: 'sqKilometers', label: 'Square Kilometers (km²)' },
      { id: 'sqMiles', label: 'Square Miles (mi²)' },
      { id: 'sqCentimeters', label: 'Square Centimeters (cm²)' },
      { id: 'sqInches', label: 'Square Inches (in²)' },
    ],
    'sqMeters',
    'sqFeet'
  ),
  'volume-converter': makeLinearConverter(
    VOLUME_FACTORS,
    [
      { id: 'liters', label: 'Liters (L)' },
      { id: 'milliliters', label: 'Milliliters (mL)' },
      { id: 'cubicMeters', label: 'Cubic Meters (m³)' },
      { id: 'usGallons', label: 'US Gallons (gal)' },
      { id: 'ukGallons', label: 'UK Imperial Gallons' },
      { id: 'usQuarts', label: 'US Quarts (qt)' },
      { id: 'usPints', label: 'US Pints (pt)' },
      { id: 'usCups', label: 'US Cups' },
      { id: 'usFluidOunces', label: 'US Fluid Ounces (fl oz)' },
    ],
    'liters',
    'usGallons'
  ),
  'speed-converter': makeLinearConverter(
    SPEED_FACTORS,
    [
      { id: 'kmph', label: 'Kilometers/Hour (km/h)' },
      { id: 'mph', label: 'Miles/Hour (mph)' },
      { id: 'mps', label: 'Meters/Second (m/s)' },
      { id: 'knots', label: 'Knots (kn)' },
      { id: 'fps', label: 'Feet/Second (ft/s)' },
      { id: 'mach', label: 'Mach (at 20°C)' },
    ],
    'kmph',
    'mph'
  ),
  'pressure-converter': makeLinearConverter(
    PRESSURE_FACTORS,
    [
      { id: 'psi', label: 'PSI (lb/in²)' },
      { id: 'bar', label: 'Bar' },
      { id: 'kpa', label: 'Kilopascals (kPa)' },
      { id: 'pa', label: 'Pascals (Pa)' },
      { id: 'mpa', label: 'Megapascals (MPa)' },
      { id: 'atm', label: 'Atmospheres (atm)' },
      { id: 'mmHg', label: 'Millimeters of Mercury (mmHg)' },
    ],
    'psi',
    'bar'
  ),
  'energy-converter': makeLinearConverter(
    ENERGY_FACTORS,
    [
      { id: 'joules', label: 'Joules (J)' },
      { id: 'kilojoules', label: 'Kilojoules (kJ)' },
      { id: 'calories', label: 'Calories (cal)' },
      { id: 'kilocalories', label: 'Kilocalories (kcal)' },
      { id: 'wattHours', label: 'Watt-hours (Wh)' },
      { id: 'kilowattHours', label: 'Kilowatt-hours (kWh)' },
      { id: 'btu', label: 'BTU' },
    ],
    'kilocalories',
    'kilojoules'
  ),
  'power-converter': makeLinearConverter(
    POWER_FACTORS,
    [
      { id: 'watts', label: 'Watts (W)' },
      { id: 'kilowatts', label: 'Kilowatts (kW)' },
      { id: 'megawatts', label: 'Megawatts (MW)' },
      { id: 'horsepowerMech', label: 'Horsepower Mechanical (hp)' },
      { id: 'horsepowerMetric', label: 'Horsepower Metric (PS)' },
      { id: 'btuPerHour', label: 'BTU / hour' },
    ],
    'kilowatts',
    'horsepowerMech'
  ),
  'time-converter': makeLinearConverter(
    TIME_FACTORS,
    [
      { id: 'seconds', label: 'Seconds (s)' },
      { id: 'minutes', label: 'Minutes (min)' },
      { id: 'hours', label: 'Hours (hr)' },
      { id: 'days', label: 'Days (d)' },
      { id: 'weeks', label: 'Weeks (wk)' },
      { id: 'months30', label: 'Months (30d avg)' },
      { id: 'years365', label: 'Years (365d)' },
      { id: 'milliseconds', label: 'Milliseconds (ms)' },
    ],
    'hours',
    'minutes'
  ),
  'angle-converter': makeLinearConverter(
    ANGLE_FACTORS,
    [
      { id: 'degrees', label: 'Degrees (°)' },
      { id: 'radians', label: 'Radians (rad)' },
      { id: 'gradians', label: 'Gradians (gon)' },
      { id: 'turns', label: 'Turns / Revolutions' },
      { id: 'arcminutes', label: 'Arcminutes (′)' },
      { id: 'arcseconds', label: 'Arcseconds (″)' },
    ],
    'degrees',
    'radians'
  ),
  'fuel-economy-converter': {
    defaultFrom: 'mpgUS',
    defaultTo: 'l100km',
    inputType: 'number',
    units: [
      { id: 'kmpl', label: 'Kilometers per Liter (km/L)' },
      { id: 'l100km', label: 'Liters per 100km (L/100km)' },
      { id: 'mpgUS', label: 'Miles per US Gallon (MPG US)' },
      { id: 'mpgUK', label: 'Miles per UK Gallon (MPG UK)' },
    ],
    convert: (raw, from, to) => {
      const val = parseFloat(raw);
      if (isNaN(val) || val <= 0) return { output: 'Enter a positive fuel efficiency value.' };
      const res = convertFuelEconomy(val, from, to);
      return {
        output: String(res),
        formulaNote: 'Reciprocal metric/imperial fuel economy scaling',
        allConversions: [
          { unit: 'km/L', value: String(convertFuelEconomy(val, from, 'kmpl')) },
          { unit: 'L/100km', value: String(convertFuelEconomy(val, from, 'l100km')) },
          { unit: 'MPG (US)', value: String(convertFuelEconomy(val, from, 'mpgUS')) },
          { unit: 'MPG (UK)', value: String(convertFuelEconomy(val, from, 'mpgUK')) },
        ],
      };
    },
  },
  'binary-to-decimal': {
    defaultFrom: '2',
    defaultTo: '10',
    inputType: 'text',
    units: [
      { id: '2', label: 'Binary (Base 2)' },
      { id: '10', label: 'Decimal (Base 10)' },
      { id: '16', label: 'Hexadecimal (Base 16)' },
      { id: '8', label: 'Octal (Base 8)' },
    ],
    convert: (raw, from, to) => {
      const out = convertBaseNumber(raw, Number(from), Number(to));
      const dec = parseInt(raw.trim(), Number(from));
      return {
        output: out,
        allConversions: [
          { unit: 'Decimal (Base 10)', value: dec.toString(10) },
          { unit: 'Binary (Base 2)', value: dec.toString(2) },
          { unit: 'Octal (Base 8)', value: dec.toString(8) },
          { unit: 'Hexadecimal (Base 16)', value: dec.toString(16).toUpperCase() },
        ],
      };
    },
  },
  'decimal-to-binary': {
    defaultFrom: '10',
    defaultTo: '2',
    inputType: 'text',
    units: [
      { id: '10', label: 'Decimal (Base 10)' },
      { id: '2', label: 'Binary (Base 2)' },
      { id: '16', label: 'Hexadecimal (Base 16)' },
      { id: '8', label: 'Octal (Base 8)' },
    ],
    convert: (raw, from, to) => {
      const out = convertBaseNumber(raw, Number(from), Number(to));
      const dec = parseInt(raw.trim(), Number(from));
      return {
        output: out,
        allConversions: [
          { unit: 'Binary (Base 2)', value: dec.toString(2) },
          { unit: 'Decimal (Base 10)', value: dec.toString(10) },
          { unit: 'Hexadecimal (Base 16)', value: dec.toString(16).toUpperCase() },
          { unit: 'Octal (Base 8)', value: dec.toString(8) },
        ],
      };
    },
  },
  'hexadecimal-converter': {
    defaultFrom: '16',
    defaultTo: '10',
    inputType: 'text',
    units: [
      { id: '16', label: 'Hexadecimal (Base 16)' },
      { id: '10', label: 'Decimal (Base 10)' },
      { id: '2', label: 'Binary (Base 2)' },
      { id: '8', label: 'Octal (Base 8)' },
    ],
    convert: (raw, from, to) => {
      const out = convertBaseNumber(raw, Number(from), Number(to));
      const dec = parseInt(raw.trim(), Number(from));
      return {
        output: out,
        allConversions: [
          { unit: 'Decimal (Base 10)', value: dec.toString(10) },
          { unit: 'Hexadecimal (Base 16)', value: dec.toString(16).toUpperCase() },
          { unit: 'Binary (Base 2)', value: dec.toString(2) },
          { unit: 'Octal (Base 8)', value: dec.toString(8) },
        ],
      };
    },
  },
  'number-system-converter': {
    defaultFrom: '10',
    defaultTo: '16',
    inputType: 'text',
    units: [
      { id: '2', label: 'Binary (Base 2)' },
      { id: '8', label: 'Octal (Base 8)' },
      { id: '10', label: 'Decimal (Base 10)' },
      { id: '16', label: 'Hexadecimal (Base 16)' },
      { id: '36', label: 'Base 36 (Alphanumeric)' },
    ],
    convert: (raw, from, to) => {
      const out = convertBaseNumber(raw, Number(from), Number(to));
      const dec = parseInt(raw.trim(), Number(from));
      return {
        output: out,
        allConversions: [
          { unit: 'Binary (Base 2)', value: dec.toString(2) },
          { unit: 'Octal (Base 8)', value: dec.toString(8) },
          { unit: 'Decimal (Base 10)', value: dec.toString(10) },
          { unit: 'Hexadecimal (Base 16)', value: dec.toString(16).toUpperCase() },
        ],
      };
    },
  },
  'currency-converter': {
    defaultFrom: 'USD',
    defaultTo: 'EUR',
    inputType: 'number',
    units: [
      { id: 'USD', label: 'USD — US Dollar ($)' },
      { id: 'EUR', label: 'EUR — Euro (€)' },
      { id: 'GBP', label: 'GBP — British Pound (£)' },
      { id: 'INR', label: 'INR — Indian Rupee (₹)' },
      { id: 'CAD', label: 'CAD — Canadian Dollar (C$)' },
      { id: 'AUD', label: 'AUD — Australian Dollar (A$)' },
      { id: 'JPY', label: 'JPY — Japanese Yen (¥)' },
      { id: 'CHF', label: 'CHF — Swiss Franc' },
      { id: 'CNY', label: 'CNY — Chinese Yuan (¥)' },
      { id: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
      { id: 'AED', label: 'AED — UAE Dirham' },
      { id: 'SAR', label: 'SAR — Saudi Riyal' },
      { id: 'NZD', label: 'NZD — New Zealand Dollar' },
      { id: 'ZAR', label: 'ZAR — South African Rand' },
      { id: 'BRL', label: 'BRL — Brazilian Real (R$)' },
      { id: 'MXN', label: 'MXN — Mexican Peso' },
      { id: 'KRW', label: 'KRW — South Korean Won (₩)' },
      { id: 'NGN', label: 'NGN — Nigerian Naira (₦)' },
      { id: 'PKR', label: 'PKR — Pakistani Rupee' },
      { id: 'BDT', label: 'BDT — Bangladeshi Taka' },
    ],
    convert: (raw, from, to, customRates) => {
      const amount = parseFloat(raw);
      if (isNaN(amount)) return { output: 'Enter a valid amount.' };
      const activeRates = customRates || DEFAULT_USD_FX_RATES;
      const res = convertCurrencyAmount(amount, from, to, activeRates);
      const topTargets = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'AED'];
      return {
        output: res.converted.toLocaleString(undefined, { maximumFractionDigits: 4 }),
        formulaNote: `1 ${from} = ${res.rate} ${to}`,
        allConversions: topTargets.map((code) => ({
          unit: code,
          value: convertCurrencyAmount(amount, from, code, activeRates).converted.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          }),
        })),
      };
    },
  },
};
