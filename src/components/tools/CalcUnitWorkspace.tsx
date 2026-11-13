import React, { useEffect, useState } from 'react';
import { Calculator, ArrowLeftRight, Globe, RefreshCw } from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { CurrencyItem } from './ToolCustomControls';
import {
  evaluateMathExpression,
  calculatePercentage,
  calculateDiscount,
  calculateDateDifference,
  calculateTimeArithmetic,
  calculateBmrAndTdee,
  calculateInterest,
  calculateInternationalIncomeTax,
  TaxCountry,
  calculateSalaryBreakdown,
  calculateProfitAndLoss,
  calculateAttendance,
  calculateElectricityBill,
  calculateFuelTripCost,
  calculateStatistics,
  calculateRatio,
  calculateFractions,
  calculateProbability,
  formatTimeInZones,
} from '../../services/calcAdvancedEngine';
import { calculateGpa, calculateMarksPercentage } from '../../services/educationToolsEngine';
import { CONVERTER_SPECS, DEFAULT_USD_FX_RATES } from '../../services/unitConverterEngine';

interface CalcUnitWorkspaceProps {
  tool: ToolDefinition;
  currency: CurrencyItem;
  onResultGenerated: (resultText: string) => void;
}

export const CalcUnitWorkspace: React.FC<CalcUnitWorkspaceProps> = ({
  tool,
  currency,
  onResultGenerated,
}) => {
  // Scientific & Standard Calculator state
  const [expr, setExpr] = useState('sin(30) + sqrt(144) * 2');
  const [degreeMode, setDegreeMode] = useState(true);
  const [calcDisplay, setCalcDisplay] = useState('24.5');
  const [calcError, setCalcError] = useState('');

  // Percentage
  const [pctMode, setPctMode] = useState<'percentOf' | 'whatPercent' | 'change'>('percentOf');
  const [pctA, setPctA] = useState(20);
  const [pctB, setPctB] = useState(250);

  // Discount
  const [origPrice, setOrigPrice] = useState(199.99);
  const [discountPct, setDiscountPct] = useState(25);
  const [salesTaxPct, setSalesTaxPct] = useState(8);

  // Date diff
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-11-12');

  // Time arithmetic
  const [tH1, setTH1] = useState(2);
  const [tM1, setTM1] = useState(45);
  const [tS1, setTS1] = useState(30);
  const [tOp, setTOp] = useState<'add' | 'sub'>('add');
  const [tH2, setTH2] = useState(1);
  const [tM2, setTM2] = useState(30);
  const [tS2, setTS2] = useState(45);

  // BMR / Calorie
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bioAge, setBioAge] = useState(26);
  const [bioWeight, setBioWeight] = useState(72);
  const [bioHeight, setBioHeight] = useState(176);
  const [activity, setActivity] = useState(1.55);

  // Interest
  const [intP, setIntP] = useState(10000);
  const [intR, setIntR] = useState(7.5);
  const [intY, setIntY] = useState(5);
  const [intComp, setIntComp] = useState(12);

  // International Income Tax
  const [taxCountry, setTaxCountry] = useState<TaxCountry>('US');
  const [grossIncome, setGrossIncome] = useState(85000);

  // Salary
  const [annualSalary, setAnnualSalary] = useState(72000);
  const [salTaxPct, setSalTaxPct] = useState(18);
  const [workHours, setWorkHours] = useState(40);

  // Profit & Loss
  const [costPrice, setCostPrice] = useState(45);
  const [sellPrice, setSellPrice] = useState(79);
  const [unitsCount, setUnitsCount] = useState(100);

  // GPA / CGPA / Marks / Attendance
  const [gpaRows, setGpaRows] = useState([
    { course: 'Mathematics', credits: 4, grade: 'A' },
    { course: 'Computer Science', credits: 4, grade: 'A-' },
    { course: 'Physics', credits: 3, grade: 'B+' },
  ]);
  const [marksGot, setMarksGot] = useState(462);
  const [marksTotal, setMarksTotal] = useState(500);
  const [attPresent, setAttPresent] = useState(64);
  const [attConducted, setAttConducted] = useState(80);
  const [attTarget, setAttTarget] = useState(75);

  // Electricity / Fuel / Speed
  const [watts, setWatts] = useState(1500);
  const [hoursDay, setHoursDay] = useState(6);
  const [billDays, setBillDays] = useState(30);
  const [kwhRate, setKwhRate] = useState(0.16);

  const [fuelDist, setFuelDist] = useState(420);
  const [fuelEff, setFuelEff] = useState(18);
  const [fuelPrice, setFuelPrice] = useState(1.45);

  const [speedDist, setSpeedDist] = useState(150);
  const [speedHours, setSpeedHours] = useState(2.5);

  // Average / Stats / Ratio / Fraction / Sqrt / Probability
  const [statsInput, setStatsInput] = useState('12, 18, 24, 24, 30, 42');
  const [ratioA, setRatioA] = useState(16);
  const [ratioB, setRatioB] = useState(9);
  const [ratioScaleA, setRatioScaleA] = useState(1920);
  const [fracN1, setFracN1] = useState(3);
  const [fracD1, setFracD1] = useState(4);
  const [fracOp, setFracOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [fracN2, setFracN2] = useState(2);
  const [fracD2, setFracD2] = useState(5);
  const [sqrtVal, setSqrtVal] = useState(144);
  const [probFav, setProbFav] = useState(3);
  const [probTotal, setProbTotal] = useState(12);
  const [probB, setProbB] = useState(0.5);

  // World Timezone
  const [tzInput, setTzInput] = useState(() => new Date().toISOString().slice(0, 16));

  // === UNIT CONVERTER STATE ===
  const spec = CONVERTER_SPECS[tool.id];
  const [convVal, setConvVal] = useState('10');
  const [convFrom, setConvFrom] = useState(spec?.defaultFrom || '');
  const [convTo, setConvTo] = useState(spec?.defaultTo || '');
  const [fxRates, setFxRates] = useState<Record<string, number>>(DEFAULT_USD_FX_RATES);
  const [fxStatus, setFxStatus] = useState<'reference' | 'live'>('reference');

  useEffect(() => {
    if (spec) {
      setConvFrom(spec.defaultFrom);
      setConvTo(spec.defaultTo);
      setConvVal(spec.inputType === 'text' ? (spec.defaultFrom === '2' ? '101101' : spec.defaultFrom === '16' ? 'FF' : '42') : '10');
    }
  }, [tool.id]);

  // Live conversion output for Unit Converters
  const unitConversion = spec ? spec.convert(convVal, convFrom, convTo, fxRates) : null;

  useEffect(() => {
    if (tool.category === 'unit-converter' && unitConversion) {
      onResultGenerated(
        `${convVal} ${convFrom} = ${unitConversion.output} ${convTo}` +
          (unitConversion.formulaNote ? `\nFormula: ${unitConversion.formulaNote}` : '')
      );
    }
  }, [tool.id, convVal, convFrom, convTo, fxRates]);

  const refreshLiveFxRates = async () => {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD');
      const data = await res.json();
      if (data?.rates) {
        setFxRates({ ...DEFAULT_USD_FX_RATES, USD: 1, ...data.rates });
        setFxStatus('live');
      }
    } catch {
      setFxStatus('reference');
    }
  };

  // Evaluate scientific expression
  const runCalcExpr = (nextExpr?: string) => {
    const target = nextExpr ?? expr;
    try {
      setCalcError('');
      const val = evaluateMathExpression(target, degreeMode);
      setCalcDisplay(String(val));
      onResultGenerated(`${target} = ${val} (${degreeMode ? 'DEG' : 'RAD'})`);
    } catch (err: any) {
      setCalcError(err.message);
    }
  };

  // === UNIT CONVERTER FULL INTERACTIVE UI ===
  if (tool.category === 'unit-converter' && spec) {
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-rose-400" />
            {tool.name}
          </h3>
          {tool.id === 'currency-converter' && (
            <button
              type="button"
              onClick={refreshLiveFxRates}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-400 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {fxStatus === 'live' ? 'Live ECB Rates Active' : 'Sync Live FX Rates'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label htmlFor="unit-val-input" className="block text-xs font-bold text-slate-300 mb-1">Value</label>
            <input
              id="unit-val-input"
              type={spec.inputType}
              value={convVal}
              onChange={(e) => setConvVal(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="unit-from-select" className="block text-xs font-bold text-slate-300 mb-1">From Unit</label>
            <select
              id="unit-from-select"
              value={convFrom}
              onChange={(e) => setConvFrom(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            >
              {spec.units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              aria-label="Swap units"
              onClick={() => {
                setConvFrom(convTo);
                setConvTo(convFrom);
              }}
              className="p-3 bg-slate-900 hover:bg-rose-600 text-white rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-4">
            <label htmlFor="unit-to-select" className="block text-xs font-bold text-slate-300 mb-1">To Unit</label>
            <select
              id="unit-to-select"
              value={convTo}
              onChange={(e) => setConvTo(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
            >
              {spec.units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {unitConversion && (
          <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono" data-testid="unit-conversion-result">
                {unitConversion.output} <span className="text-sm text-slate-300">{convTo}</span>
              </div>
              {unitConversion.formulaNote && (
                <span className="text-xs text-slate-400 font-mono">{unitConversion.formulaNote}</span>
              )}
            </div>
            {unitConversion.allConversions && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                {unitConversion.allConversions.map((item) => (
                  <div key={item.unit} className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-xs">
                    <div className="text-[10px] text-slate-400 truncate">{item.unit}</div>
                    <div className="font-mono font-bold text-white truncate">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // === CALCULATORS ===
  if (tool.id === 'standard-calculator' || tool.id === 'scientific-calculator') {
    const keys =
      tool.id === 'scientific-calculator'
        ? ['sin(', 'cos(', 'tan(', 'sqrt(', 'log(', 'ln(', '(', ')', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '^', '+', 'pi', 'e', '!', '=']
        : ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '(', ')', '+', '%', 'C', '='];

    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-rose-400" />
            {tool.id === 'scientific-calculator' ? 'Scientific Math Expression Engine' : 'Standard Calculator'}
          </h3>
          <button
            type="button"
            onClick={() => setDegreeMode(!degreeMode)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-rose-400 font-bold"
          >
            Mode: {degreeMode ? 'DEG' : 'RAD'}
          </button>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <label htmlFor="calc-expr-input" className="sr-only">Math Expression</label>
          <input
            id="calc-expr-input"
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runCalcExpr();
            }}
            className="w-full bg-transparent text-slate-300 font-mono text-sm focus:outline-none"
          />
          <div className="text-3xl font-extrabold text-white font-mono text-right" data-testid="calc-display">
            {calcDisplay}
          </div>
          {calcError && <div className="text-xs text-rose-400 text-right">{calcError}</div>}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === 'C') {
                  setExpr('');
                  setCalcDisplay('0');
                } else if (k === '=') {
                  runCalcExpr();
                } else {
                  setExpr((prev) => prev + k);
                }
              }}
              className={`py-3 rounded-xl font-mono text-sm font-bold border transition-colors ${
                k === '='
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tool.id === 'percentage-calculator') {
    const res = calculatePercentage(pctMode, pctA, pctB);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'percentOf' as const, label: 'What is X% of Y?' },
            { id: 'whatPercent' as const, label: 'X is what % of Y?' },
            { id: 'change' as const, label: '% Change (X → Y)' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPctMode(m.id)}
              className={`px-3 py-2 rounded-xl font-bold border ${pctMode === m.id ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pct-a" className="block text-slate-400 mb-1">Value X</label>
            <input id="pct-a" type="number" value={pctA} onChange={(e) => setPctA(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
          <div>
            <label htmlFor="pct-b" className="block text-slate-400 mb-1">Value Y</label>
            <input id="pct-b" type="number" value={pctB} onChange={(e) => setPctB(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-sm text-emerald-400 font-bold">
          {res.summary}
        </div>
      </div>
    );
  }

  if (tool.id === 'discount-calculator') {
    const d = calculateDiscount(origPrice, discountPct, salesTaxPct);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="disc-price" className="block text-slate-400 mb-1">Original Price ({currency.symbol})</label>
            <input id="disc-price" type="number" value={origPrice} onChange={(e) => setOrigPrice(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
          <div>
            <label htmlFor="disc-pct" className="block text-slate-400 mb-1">Discount (%)</label>
            <input id="disc-pct" type="number" value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
          <div>
            <label htmlFor="disc-tax" className="block text-slate-400 mb-1">Sales Tax (%)</label>
            <input id="disc-tax" type="number" value={salesTaxPct} onChange={(e) => setSalesTaxPct(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">You Save</span><strong className="text-emerald-400 text-base">{currency.symbol}{d.savings}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Tax</span><strong className="text-white text-base">{currency.symbol}{d.taxAmount}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Final Total</span><strong className="text-rose-400 text-base">{currency.symbol}{d.finalPrice}</strong></div>
        </div>
      </div>
    );
  }

  if (tool.id === 'date-calculator') {
    let diffText = '';
    try {
      const df = calculateDateDifference(startDate, endDate);
      diffText = `${df.years}y ${df.months}m ${df.days}d (${df.totalDays.toLocaleString()} total days • ${df.totalWeeks} weeks)`;
    } catch (e: any) {
      diffText = e.message;
    }
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="date-start" className="block text-slate-400 mb-1">Start Date</label>
            <input id="date-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" />
          </div>
          <div>
            <label htmlFor="date-end" className="block text-slate-400 mb-1">End Date</label>
            <input id="date-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white" />
          </div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">{diffText}</div>
      </div>
    );
  }

  if (tool.id === 'time-calculator') {
    const tr = calculateTimeArithmetic(tH1, tM1, tS1, tOp, tH2, tM2, tS2);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 items-end">
          <div><label className="text-slate-400 block mb-1">Hrs 1</label><input type="number" value={tH1} onChange={(e) => setTH1(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" /></div>
          <div><label className="text-slate-400 block mb-1">Min 1</label><input type="number" value={tM1} onChange={(e) => setTM1(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" /></div>
          <div><label className="text-slate-400 block mb-1">Sec 1</label><input type="number" value={tS1} onChange={(e) => setTS1(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" /></div>
          <select aria-label="Time Operation" value={tOp} onChange={(e) => setTOp(e.target.value as any)} className="p-2 bg-rose-600 rounded-lg text-white font-bold">
            <option value="add">+</option>
            <option value="sub">−</option>
          </select>
          <div><label className="text-slate-400 block mb-1">Hrs 2</label><input type="number" value={tH2} onChange={(e) => setTH2(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" /></div>
          <div><label className="text-slate-400 block mb-1">Min 2</label><input type="number" value={tM2} onChange={(e) => setTM2(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" /></div>
          <div><label className="text-slate-400 block mb-1">Sec 2</label><input type="number" value={tS2} onChange={(e) => setTS2(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Result: {tr.formatted} ({tr.totalHours} hrs | {tr.totalMinutes} mins)
        </div>
      </div>
    );
  }

  if (tool.id === 'bmr-calculator' || tool.id === 'calorie-calculator') {
    const res = calculateBmrAndTdee(gender, bioAge, bioWeight, bioHeight, activity);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label htmlFor="bio-gender" className="block text-slate-400 mb-1">Sex</label>
            <select id="bio-gender" value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div><label htmlFor="bio-age" className="block text-slate-400 mb-1">Age</label><input id="bio-age" type="number" value={bioAge} onChange={(e) => setBioAge(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="bio-wt" className="block text-slate-400 mb-1">Weight (kg)</label><input id="bio-wt" type="number" value={bioWeight} onChange={(e) => setBioWeight(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="bio-ht" className="block text-slate-400 mb-1">Height (cm)</label><input id="bio-ht" type="number" value={bioHeight} onChange={(e) => setBioHeight(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div>
            <label htmlFor="bio-act" className="block text-slate-400 mb-1">Activity</label>
            <select id="bio-act" value={activity} onChange={(e) => setActivity(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
              <option value={1.2}>Sedentary (1.2×)</option>
              <option value={1.375}>Light (1.375×)</option>
              <option value={1.55}>Moderate (1.55×)</option>
              <option value={1.725}>Active (1.725×)</option>
              <option value={1.9}>Athlete (1.9×)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Basal BMR</span><strong className="text-white text-base">{res.bmr} kcal</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Maintenance TDEE</span><strong className="text-emerald-400 text-base">{res.tdee} kcal</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Fat Loss</span><strong className="text-rose-400 text-base">{res.weightLoss} kcal</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Muscle Gain</span><strong className="text-blue-400 text-base">{res.weightGain} kcal</strong></div>
        </div>
      </div>
    );
  }

  if (tool.id === 'interest-calculator' || tool.id === 'compound-interest-calculator') {
    const isComp = tool.id === 'compound-interest-calculator';
    const r = calculateInterest(intP, intR, intY, isComp ? 'compound' : 'simple', intComp);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><label htmlFor="int-p" className="block text-slate-400 mb-1">Principal ({currency.symbol})</label><input id="int-p" type="number" value={intP} onChange={(e) => setIntP(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="int-r" className="block text-slate-400 mb-1">Annual Rate (%)</label><input id="int-r" type="number" step="0.1" value={intR} onChange={(e) => setIntR(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="int-y" className="block text-slate-400 mb-1">Years</label><input id="int-y" type="number" value={intY} onChange={(e) => setIntY(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          {isComp && (
            <div>
              <label htmlFor="int-c" className="block text-slate-400 mb-1">Compounding</label>
              <select id="int-c" value={intComp} onChange={(e) => setIntComp(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
                <option value={1}>Annually (1×)</option>
                <option value={4}>Quarterly (4×)</option>
                <option value={12}>Monthly (12×)</option>
                <option value={365}>Daily (365×)</option>
              </select>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Principal</span><strong className="text-white text-base">{currency.symbol}{r.principal.toLocaleString()}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Interest Earned</span><strong className="text-emerald-400 text-base">{currency.symbol}{r.totalInterest.toLocaleString()}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Maturity Total</span><strong className="text-rose-400 text-base">{currency.symbol}{r.maturityAmount.toLocaleString()}</strong></div>
        </div>
      </div>
    );
  }

  if (tool.id === 'income-tax-calculator') {
    const t = calculateInternationalIncomeTax(taxCountry, grossIncome);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="tax-country" className="block text-slate-400 mb-1">Tax Country / Jurisdiction</label>
            <select id="tax-country" value={taxCountry} onChange={(e) => setTaxCountry(e.target.value as TaxCountry)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white">
              <option value="US">United States (USD Federal)</option>
              <option value="UK">United Kingdom (GBP PAYE)</option>
              <option value="IN">India (INR New Tax Regime)</option>
              <option value="CA">Canada (CAD Federal)</option>
              <option value="AU">Australia (AUD Resident)</option>
              <option value="DE">Germany (EUR Income Tax)</option>
            </select>
          </div>
          <div>
            <label htmlFor="tax-income" className="block text-slate-400 mb-1">Annual Gross Income ({t.currency})</label>
            <input id="tax-income" type="number" value={grossIncome} onChange={(e) => setGrossIncome(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono" data-testid="tax-result-grid">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Taxable Income</span><strong className="text-white">{t.taxableIncome.toLocaleString()} {t.currency}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Estimated Tax</span><strong className="text-rose-400">{t.estimatedTax.toLocaleString()} {t.currency}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Net Take-Home</span><strong className="text-emerald-400">{t.netIncome.toLocaleString()} {t.currency}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Effective / Marginal</span><strong className="text-white">{t.effectiveRatePct}% / {t.marginalRatePct}%</strong></div>
        </div>
      </div>
    );
  }

  if (tool.id === 'salary-calculator') {
    const s = calculateSalaryBreakdown(annualSalary, salTaxPct, workHours);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label htmlFor="sal-ann" className="block text-slate-400 mb-1">Annual Salary ({currency.symbol})</label><input id="sal-ann" type="number" value={annualSalary} onChange={(e) => setAnnualSalary(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="sal-tax" className="block text-slate-400 mb-1">Deductions / Tax (%)</label><input id="sal-tax" type="number" value={salTaxPct} onChange={(e) => setSalTaxPct(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="sal-hrs" className="block text-slate-400 mb-1">Hours / Week</label><input id="sal-hrs" type="number" value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Net Monthly</span><strong className="text-emerald-400">{currency.symbol}{s.netMonthly.toLocaleString()}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Net Bi-Weekly</span><strong className="text-white">{currency.symbol}{s.netBiweekly.toLocaleString()}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Net Weekly</span><strong className="text-white">{currency.symbol}{s.netWeekly.toLocaleString()}</strong></div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Net Hourly</span><strong className="text-rose-400">{currency.symbol}{s.netHourly}</strong></div>
        </div>
      </div>
    );
  }

  if (tool.id === 'profit-and-loss-calculator') {
    const p = calculateProfitAndLoss(costPrice, sellPrice, unitsCount);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div><label htmlFor="pl-cp" className="block text-slate-400 mb-1">Cost / Unit ({currency.symbol})</label><input id="pl-cp" type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="pl-sp" className="block text-slate-400 mb-1">Selling Price ({currency.symbol})</label><input id="pl-sp" type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="pl-un" className="block text-slate-400 mb-1">Quantity</label><input id="pl-un" type="number" value={unitsCount} onChange={(e) => setUnitsCount(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Net {p.status}: {currency.symbol}{p.amount.toLocaleString()} | Margin: {p.marginPct}% | Markup: {p.markupPct}%
        </div>
      </div>
    );
  }

  if (tool.id === 'gpa-calculator' || tool.id === 'cgpa-calculator') {
    const gpa = calculateGpa(gpaRows.map((r) => ({ courseName: r.course, credits: r.credits, grade: r.grade })));
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        {gpaRows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2">
            <input type="text" aria-label={`Course ${idx + 1}`} value={row.course} onChange={(e) => setGpaRows(gpaRows.map((r, i) => (i === idx ? { ...r, course: e.target.value } : r)))} className="col-span-6 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white" />
            <input type="number" aria-label={`Credits ${idx + 1}`} value={row.credits} onChange={(e) => setGpaRows(gpaRows.map((r, i) => (i === idx ? { ...r, credits: Number(e.target.value) } : r)))} className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono" />
            <select aria-label={`Grade ${idx + 1}`} value={row.grade} onChange={(e) => setGpaRows(gpaRows.map((r, i) => (i === idx ? { ...r, grade: e.target.value } : r)))} className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold">
              {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => setGpaRows([...gpaRows, { course: `Subject ${gpaRows.length + 1}`, credits: 3, grade: 'A' }])} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold">+ Add Course</button>
          <div className="font-mono text-base font-extrabold text-emerald-400">
            {tool.id === 'cgpa-calculator' ? `CGPA (10-pt equiv): ${(gpa.gpa * 2.5).toFixed(2)}` : `GPA: ${gpa.gpa} / 4.0`}
          </div>
        </div>
      </div>
    );
  }

  if (tool.id === 'marks-percentage-calculator') {
    const m = calculateMarksPercentage(marksGot, marksTotal);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="m-obt" className="block text-slate-400 mb-1">Marks Obtained</label><input id="m-obt" type="number" value={marksGot} onChange={(e) => setMarksGot(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="m-max" className="block text-slate-400 mb-1">Maximum Marks</label><input id="m-max" type="number" value={marksTotal} onChange={(e) => setMarksTotal(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Percentage: {m.percentage}% — {m.grade}
        </div>
      </div>
    );
  }

  if (tool.id === 'attendance-calculator') {
    const a = calculateAttendance(attPresent, attConducted, attTarget);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div><label htmlFor="att-p" className="block text-slate-400 mb-1">Attended</label><input id="att-p" type="number" value={attPresent} onChange={(e) => setAttPresent(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="att-c" className="block text-slate-400 mb-1">Total Conducted</label><input id="att-c" type="number" value={attConducted} onChange={(e) => setAttConducted(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label htmlFor="att-t" className="block text-slate-400 mb-1">Required (%)</label><input id="att-t" type="number" value={attTarget} onChange={(e) => setAttTarget(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400">
          Current: <strong>{a.currentPct}%</strong> ({a.status}) — {a.actionText}
        </div>
      </div>
    );
  }

  if (tool.id === 'electricity-bill-calculator') {
    const e = calculateElectricityBill(watts, hoursDay, billDays, kwhRate);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><label className="block text-slate-400 mb-1">Appliance Watts (W)</label><input type="number" value={watts} onChange={(ev) => setWatts(Number(ev.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Hours / Day</label><input type="number" value={hoursDay} onChange={(ev) => setHoursDay(Number(ev.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Days</label><input type="number" value={billDays} onChange={(ev) => setBillDays(Number(ev.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Rate / kWh ({currency.symbol})</label><input type="number" step="0.01" value={kwhRate} onChange={(ev) => setKwhRate(Number(ev.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Energy Consumed: {e.totalKwh} kWh | Total Estimated Cost: {currency.symbol}{e.totalCost}
        </div>
      </div>
    );
  }

  if (tool.id === 'fuel-cost-calculator') {
    const f = calculateFuelTripCost(fuelDist, fuelEff, fuelPrice);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-slate-400 mb-1">Distance (km or mi)</label><input type="number" value={fuelDist} onChange={(e) => setFuelDist(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Efficiency (km/L or MPG)</label><input type="number" value={fuelEff} onChange={(e) => setFuelEff(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Fuel Price / unit ({currency.symbol})</label><input type="number" step="0.05" value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Fuel Needed: {f.fuelNeeded} units | Total Trip Fuel Cost: {currency.symbol}{f.totalCost}
        </div>
      </div>
    );
  }

  if (tool.id === 'speed-calculator') {
    const spd = speedHours > 0 ? speedDist / speedHours : 0;
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-slate-400 mb-1">Distance (km or mi)</label><input type="number" value={speedDist} onChange={(e) => setSpeedDist(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Time Taken (Hours)</label><input type="number" step="0.1" value={speedHours} onChange={(e) => setSpeedHours(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Average Speed: {spd.toFixed(2)} units/hour ({(spd / 3.6).toFixed(2)} m/s if km/h)
        </div>
      </div>
    );
  }

  if (tool.id === 'average-calculator') {
    const nums = statsInput.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n));
    const st = calculateStatistics(nums);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <label htmlFor="stats-nums" className="block text-slate-400">Numbers (comma or space separated):</label>
        <input id="stats-nums" type="text" value={statsInput} onChange={(e) => setStatsInput(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Mean</span><strong className="text-emerald-400">{st.mean}</strong></div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Median</span><strong className="text-white">{st.median}</strong></div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Mode</span><strong className="text-white">{st.mode}</strong></div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><span className="text-slate-400 block">Std Dev (σ)</span><strong className="text-rose-400">{st.stdDev}</strong></div>
        </div>
      </div>
    );
  }

  if (tool.id === 'ratio-calculator') {
    const rt = calculateRatio(ratioA, ratioB, ratioScaleA);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-slate-400 mb-1">Ratio A</label><input type="number" value={ratioA} onChange={(e) => setRatioA(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Ratio B</label><input type="number" value={ratioB} onChange={(e) => setRatioB(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Scale Target A</label><input type="number" value={ratioScaleA} onChange={(e) => setRatioScaleA(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          Simplified: {rt.simplified} | Scaled Pair: {ratioScaleA} : {rt.scaledB ?? '—'}
        </div>
      </div>
    );
  }

  if (tool.id === 'fraction-calculator') {
    let fracOut = '';
    try {
      const f = calculateFractions(fracN1, fracD1, fracOp, fracN2, fracD2);
      fracOut = `${f.fraction} (Mixed: ${f.mixed} • Decimal: ${f.decimal})`;
    } catch (e: any) {
      fracOut = e.message;
    }
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-5 gap-2 items-center">
          <input type="number" aria-label="Numerator 1" value={fracN1} onChange={(e) => setFracN1(Number(e.target.value))} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          <input type="number" aria-label="Denominator 1" value={fracD1} onChange={(e) => setFracD1(Number(e.target.value))} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          <select aria-label="Fraction Operator" value={fracOp} onChange={(e) => setFracOp(e.target.value as any)} className="p-2.5 bg-rose-600 rounded-xl text-white font-bold text-center">
            <option value="+">+</option><option value="-">−</option><option value="*">×</option><option value="/">÷</option>
          </select>
          <input type="number" aria-label="Numerator 2" value={fracN2} onChange={(e) => setFracN2(Number(e.target.value))} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
          <input type="number" aria-label="Denominator 2" value={fracD2} onChange={(e) => setFracD2(Number(e.target.value))} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">{fracOut}</div>
      </div>
    );
  }

  if (tool.id === 'square-root-calculator') {
    const val = sqrtVal >= 0 ? Math.sqrt(sqrtVal) : NaN;
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <label htmlFor="sqrt-inp" className="block text-slate-400">Number (x):</label>
        <input id="sqrt-inp" type="number" value={sqrtVal} onChange={(e) => setSqrtVal(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-base" />
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          √{sqrtVal} = {isNaN(val) ? 'Complex (use positive real number)' : Number(val.toPrecision(10))} | Cube Root ∛{sqrtVal} = {Number(Math.cbrt(sqrtVal).toPrecision(8))}
        </div>
      </div>
    );
  }

  if (tool.id === 'probability-calculator') {
    const pr = calculateProbability(probFav, probTotal, probB);
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-slate-400 mb-1">Favorable Outcomes</label><input type="number" value={probFav} onChange={(e) => setProbFav(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Total Outcomes</label><input type="number" value={probTotal} onChange={(e) => setProbTotal(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
          <div><label className="block text-slate-400 mb-1">Event B Prob (0–1)</label><input type="number" step="0.05" min={0} max={1} value={probB} onChange={(e) => setProbB(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold">
          P(A) = {pr.pA} ({pr.percentage}) | P(not A) = {pr.pNotA} | P(A and B) = {pr.pAnd} | P(A or B) = {pr.pOr}
        </div>
      </div>
    );
  }

  if (tool.id === 'time-zone-calculator') {
    let zones: { id: string; label: string; formatted: string }[] = [];
    try {
      zones = formatTimeInZones(tzInput);
    } catch {
      zones = formatTimeInZones();
    }
    return (
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="tz-dt" className="font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-rose-400" /> Reference Date &amp; Time:
          </label>
          <input id="tz-dt" type="datetime-local" value={tzInput} onChange={(e) => setTzInput(e.target.value)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {zones.map((z) => (
            <div key={z.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] text-rose-400 font-semibold truncate">{z.label}</div>
              <div className="text-white font-mono mt-0.5">{z.formatted}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
