import React, { useState } from 'react';
import { ExpenseItem, CategoryItem } from '../../types/expense';
import { 
  CreditCard, 
  Landmark, 
  TrendingUp, 
  ChevronRight, 
  PieChart as PieChartIcon, 
  BarChart3,
  Tag, 
  Plus 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

interface DashboardScreenProps {
  expenses: ExpenseItem[];
  categories: CategoryItem[];
  monthlyBudget: number;
  currency: string;
  onNavigate: (screen: 'dashboard' | 'expenses' | 'sms' | 'cards') => void;
  onEditCategory: (expense: ExpenseItem) => void;
  onOpenSimulateSms: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  expenses,
  categories,
  monthlyBudget,
  currency,
  onNavigate,
  onEditCategory,
  onOpenSimulateSms,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Calculations
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetPercent = Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100);
  const remainingBudget = Math.max(monthlyBudget - totalSpent, 0);

  // Credit vs Debit calculations
  const creditExpenses = expenses.filter((e) => e.cardType === 'credit');
  const debitExpenses = expenses.filter((e) => e.cardType === 'debit');

  const creditTotal = creditExpenses.reduce((sum, item) => sum + item.amount, 0);
  const debitTotal = debitExpenses.reduce((sum, item) => sum + item.amount, 0);

  const creditPercent = totalSpent > 0 ? Math.round((creditTotal / totalSpent) * 100) : 0;
  const debitPercent = totalSpent > 0 ? 100 - creditPercent : 0;

  // Category breakdown data
  const categoryTotals = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.filter((e) => e.category === cat.id).length;
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      bgColor: cat.bgColor,
      total,
      count,
      percent: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0,
    };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  // Chart data formatted for recharts
  const chartData = categoryTotals.map((item) => ({
    name: item.name,
    shortName: item.name.split(' ')[0],
    value: item.total,
    color: item.color,
    count: item.count,
    percent: item.percent,
  }));

  // Recent 5 expenses
  const recentExpenses = [...expenses].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-slate-300">
            <span className="font-bold text-white tabular-nums">
              {currency} {Number(data.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-medium text-indigo-400 tabular-nums">
              {data.percent}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Top Banner / Live SMS Sync Status */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-xs font-semibold text-indigo-200 block">Android SMS Reader Active</span>
            <span className="text-[11px] text-indigo-300/70">
              {expenses.length} bank transactions parsed automatically
            </span>
          </div>
        </div>
        <button
          onClick={onOpenSimulateSms}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Simulate SMS</span>
        </button>
      </div>

      {/* Hero Monthly Spend Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-800/80 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              November 2026 Spend
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                {currency} {totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Budget</span>
            <span className="text-xs font-bold text-slate-200 tabular-nums">
              {currency} {monthlyBudget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                budgetPercent > 90 ? 'bg-rose-500' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{budgetPercent}% of monthly limit utilized</span>
            <span className="text-slate-300 font-medium tabular-nums">
              {currency} {remainingBudget.toLocaleString('en-IN')} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Monthly Spending Breakdown Chart (Visualizes Expenses by Category) */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        {/* Chart Header with Donut / Bar Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Spending Breakdown</h3>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setChartType('donut')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-medium ${
                chartType === 'donut'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Donut Chart"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Donut</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-medium ${
                chartType === 'bar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
          </div>
        </div>

        {/* Recharts Chart Visualization Canvas */}
        <div className="w-full h-56 relative flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="text-center text-xs text-slate-500">No expense data to visualize</div>
          ) : chartType === 'donut' ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.6}
                        className="transition-opacity duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Hole Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {activePieIndex !== null && chartData[activePieIndex] 
                    ? chartData[activePieIndex].shortName 
                    : 'Total'}
                </span>
                <span className="text-sm font-extrabold text-white tabular-nums tracking-tight">
                  {currency} {
                    activePieIndex !== null && chartData[activePieIndex]
                      ? chartData[activePieIndex].value.toLocaleString('en-IN')
                      : totalSpent.toLocaleString('en-IN')
                  }
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold tabular-nums">
                  {activePieIndex !== null && chartData[activePieIndex]
                    ? `${chartData[activePieIndex].percent}% of total`
                    : `${categoryTotals.length} categories`}
                </span>
              </div>
            </>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="shortName" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Legend Pills with percentages */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
          {categoryTotals.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('expenses')}
              onMouseEnter={() => setActivePieIndex(idx)}
              onMouseLeave={() => setActivePieIndex(null)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="truncate max-w-[85px]">{cat.name}</span>
              <span className="text-slate-400 font-semibold tabular-nums">{cat.percent}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Credit Card vs Debit Card Breakdown Split Widget (Core User Requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            Payment Method Split
          </h3>
          <span className="text-xs text-slate-400">Credit vs. Debit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Credit Card Card */}
          <div 
            onClick={() => onNavigate('expenses')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40 hover:border-purple-700/60 transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  CC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Credit Cards
                  </h4>
                  <span className="text-[11px] text-slate-400">{creditExpenses.length} transactions</span>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-400 px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/40">
                {creditPercent}%
              </span>
            </div>

            <div>
              <span className="text-lg font-bold text-white tabular-nums block">
                {currency} {creditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>HDFC, Chase, Axis, Citi</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Debit Card Card */}
          <div 
            onClick={() => onNavigate('expenses')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/40 hover:border-emerald-700/60 transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  DC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Debit Cards & A/C
                  </h4>
                  <span className="text-[11px] text-slate-400">{debitExpenses.length} transactions</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                {debitPercent}%
              </span>
            </div>

            <div>
              <span className="text-lg font-bold text-white tabular-nums block">
                {currency} {debitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${debitPercent}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>SBI, ICICI, Kotak</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent SMS-Parsed Transactions with Tap-to-Edit Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Recent SMS Transactions
          </h3>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
          >
            <span>All Expenses ({expenses.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentExpenses.map((expense) => {
            const cat = categories.find((c) => c.id === expense.category) || {
              name: expense.category,
              color: '#94a3b8',
              bgColor: 'rgba(148, 163, 184, 0.1)',
            };

            return (
              <div
                key={expense.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
              >
                {/* Left: Merchant & Bank info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{expense.merchant}</p>
                    
                    {/* Bank & Card Badge */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-300 truncate">{expense.bankName}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${
                        expense.cardType === 'credit' ? 'text-purple-400' : 'text-emerald-400'
                      }`}>
                        {expense.cardType === 'credit' ? 'CC' : 'DC'} **{expense.cardLast4}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Category Pill (Clickable to Edit) */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-white tabular-nums">
                    {expense.currency} {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>

                  <button
                    type="button"
                    onClick={() => onEditCategory(expense)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all hover:ring-1 hover:ring-indigo-400"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    title="Click to edit category"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{cat.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
