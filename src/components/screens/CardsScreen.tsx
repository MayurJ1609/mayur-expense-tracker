import React, { useState } from 'react';
import { CardAccount, ExpenseItem, CardType } from '../../types/expense';
import { 
  CreditCard, 
  Landmark, 
  Download, 
  Settings2, 
  Sliders, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CardsScreenProps {
  cards: CardAccount[];
  expenses: ExpenseItem[];
  currency: string;
  monthlyBudget: number;
  onUpdateMonthlyBudget: (newBudget: number) => void;
  onUpdateCurrency: (symbol: string) => void;
}

export const CardsScreen: React.FC<CardsScreenProps> = ({
  cards,
  expenses,
  currency,
  monthlyBudget,
  onUpdateMonthlyBudget,
  onUpdateCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(monthlyBudget.toString());

  // Group expenses by bank
  const bankStats = React.useMemo(() => {
    const map = new Map<string, { bankName: string; bankCode: string; creditTotal: number; debitTotal: number; count: number }>();

    expenses.forEach((e) => {
      const current = map.get(e.bankCode) || {
        bankName: e.bankName,
        bankCode: e.bankCode,
        creditTotal: 0,
        debitTotal: 0,
        count: 0,
      };

      if (e.cardType === 'credit') {
        current.creditTotal += e.amount;
      } else {
        current.debitTotal += e.amount;
      }
      current.count += 1;
      map.set(e.bankCode, current);
    });

    return Array.from(map.values()).sort((a, b) => (b.creditTotal + b.debitTotal) - (a.creditTotal + a.debitTotal));
  }, [expenses]);

  const filteredCards = cards.filter((c) => {
    if (activeTab === 'credit') return c.cardType === 'credit';
    if (activeTab === 'debit') return c.cardType === 'debit';
    return true;
  });

  const handleSaveBudget = () => {
    const num = parseFloat(budgetValue);
    if (!isNaN(num) && num > 0) {
      onUpdateMonthlyBudget(num);
      setIsEditingBudget(false);
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Amount', 'Currency', 'Category', 'Card Type', 'Bank Name', 'Card Last 4', 'Raw SMS'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.amount,
      e.currency,
      e.category,
      e.cardType,
      `"${e.bankName}"`,
      e.cardLast4,
      `"${e.rawSmsText.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spendtrack_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Cards & Bank Accounts</h2>
          <p className="text-xs text-slate-400">
            Detected Credit and Debit cards with bank breakdown & limits
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Filter Tabs for Cards */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Cards ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'credit'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Credit Cards ({cards.filter(c => c.cardType === 'credit').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('debit')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'debit'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Debit Cards ({cards.filter(c => c.cardType === 'debit').length})</span>
        </button>
      </div>

      {/* Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card) => {
          // Calculate spend for this specific card
          const cardExpenses = expenses.filter(
            (e) => e.cardLast4 === card.last4 && e.cardType === card.cardType
          );
          const currentSpent = cardExpenses.reduce((sum, item) => sum + item.amount, 0);
          const limitPercent = card.limit ? Math.min(Math.round((currentSpent / card.limit) * 100), 100) : 0;

          return (
            <div
              key={card.id}
              className={`p-5 rounded-3xl bg-gradient-to-br ${card.cardColor} border border-slate-700/60 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4 text-white`}
            >
              {/* Top Row: Bank Name, Card Network & Type */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    {card.bankName}
                  </span>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                    card.cardType === 'credit'
                      ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40'
                      : 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                  }`}>
                    {card.cardType === 'credit' ? 'CREDIT CARD' : 'DEBIT CARD'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold italic text-slate-200 font-mono tracking-wider">
                    {card.cardNetwork}
                  </span>
                  {card.billingCycleDay && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Cycle Day {card.billingCycleDay}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Card Number in Chip Style */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300/40 flex items-center justify-center">
                    <div className="w-5 h-3 border border-amber-600/50 rounded-sm" />
                  </div>
                  <span className="text-sm font-mono tracking-widest text-slate-300">
                    •••• •••• •••• {card.last4}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Spend details & Progress */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Monthly Spend</span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {currency} {currentSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {card.limit ? (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Credit Limit</span>
                      <span className="text-xs font-semibold text-slate-300 tabular-nums">
                        {currency} {card.limit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Linked Account</span>
                      <span className="text-xs font-semibold text-slate-300">Active</span>
                    </div>
                  )}
                </div>

                {card.limit && (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${limitPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 text-right block">
                      {limitPercent}% credit limit used
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bank-wise Expense Aggregation Table */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Bank Spend Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">{bankStats.length} Banks Detected</span>
        </div>

        <div className="space-y-3">
          {bankStats.map((b) => {
            const total = b.creditTotal + b.debitTotal;
            return (
              <div
                key={b.bankCode}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {b.bankCode.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.bankName}</h4>
                      <span className="text-[11px] text-slate-400">{b.count} SMS transactions</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white tabular-nums block">
                      {currency} {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Sub-breakdown: Credit vs Debit for this bank */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-purple-950/30 text-purple-300">
                    <span className="text-[11px]">Credit Card:</span>
                    <span className="font-semibold tabular-nums">
                      {currency} {b.creditTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-950/30 text-emerald-300">
                    <span className="text-[11px]">Debit Card:</span>
                    <span className="font-semibold tabular-nums">
                      {currency} {b.debitTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Applet Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly Budget Setting */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Monthly Budget Goal</span>
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSaveBudget}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white tabular-nums">
                  {currency} {monthlyBudget.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Currency Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Display Currency</span>
            <div className="flex items-center gap-2">
              {['₹', '$', '€', '£'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => onUpdateCurrency(sym)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currency === sym
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
