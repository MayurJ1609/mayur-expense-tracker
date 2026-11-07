import React, { useState, useMemo } from 'react';
import { ExpenseItem, CategoryItem, CardType } from '../../types/expense';
import { 
  Search, 
  CreditCard, 
  Landmark, 
  Tag, 
  Filter, 
  Edit2, 
  ChevronDown, 
  FileText,
  Calendar,
  X
} from 'lucide-react';

interface ExpensesScreenProps {
  expenses: ExpenseItem[];
  categories: CategoryItem[];
  currency: string;
  onEditCategory: (expense: ExpenseItem) => void;
  onOpenSimulateSms: () => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  categories,
  currency,
  onEditCategory,
  onOpenSimulateSms,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardType, setSelectedCardType] = useState<CardType | 'all'>('all');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSmsId, setExpandedSmsId] = useState<string | null>(null);

  // Extract unique banks from current expenses
  const availableBanks = useMemo(() => {
    const map = new Map<string, string>();
    expenses.forEach((e) => {
      map.set(e.bankCode, e.bankName);
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [expenses]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMerchant = e.merchant.toLowerCase().includes(q);
        const matchesBank = e.bankName.toLowerCase().includes(q);
        const matchesLast4 = e.cardLast4.includes(q);
        const matchesCategory = e.category.toLowerCase().includes(q);
        if (!matchesMerchant && !matchesBank && !matchesLast4 && !matchesCategory) {
          return false;
        }
      }

      // Card Type filter
      if (selectedCardType !== 'all' && e.cardType !== selectedCardType) {
        return false;
      }

      // Bank filter
      if (selectedBank !== 'all' && e.bankCode !== selectedBank) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses, searchQuery, selectedCardType, selectedBank, selectedCategory]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Expense Ledger & Categories</h2>
          <p className="text-xs text-slate-400">
            Tap any category badge to re-classify your credit or debit expenses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500 font-medium mr-1.5">Total:</span>
            <span className="font-bold text-white tabular-nums">
              {currency} {totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search merchant, bank name (HDFC, SBI...), card **4291..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="w-6 h-6 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Segment: All / Credit Card / Debit Card */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setSelectedCardType('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
            selectedCardType === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({expenses.length})
        </button>
        <button
          onClick={() => setSelectedCardType('credit')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            selectedCardType === 'credit'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Credit Cards ({expenses.filter(e => e.cardType === 'credit').length})</span>
        </button>
        <button
          onClick={() => setSelectedCardType('debit')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            selectedCardType === 'debit'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Debit Cards ({expenses.filter(e => e.cardType === 'debit').length})</span>
        </button>
      </div>

      {/* Secondary Dropdown Filters: Bank & Category */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bank Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">Bank:</span>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Banks</option>
            {availableBanks.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button if any active */}
        {(selectedCardType !== 'all' || selectedBank !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCardType('all');
              setSelectedBank('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <Tag className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No matching expenses found</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Try adjusting your search or filters, or simulate a new bank SMS to track more transactions.
          </p>
          <button
            onClick={onOpenSimulateSms}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md inline-flex items-center gap-1.5"
          >
            Simulate Bank SMS
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const cat = categories.find((c) => c.id === expense.category) || {
              name: expense.category,
              color: '#94a3b8',
              bgColor: 'rgba(148, 163, 184, 0.1)',
            };
            const isSmsExpanded = expandedSmsId === expense.id;

            return (
              <div
                key={expense.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all space-y-3 shadow-sm"
              >
                {/* Main Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Bank Icon Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5 text-indigo-400" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{expense.merchant}</h4>
                      
                      {/* Bank Name & Card Type Indicator */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs mt-0.5">
                        <span className="font-medium text-slate-300">{expense.bankName}</span>
                        <span className="text-slate-600">·</span>
                        
                        {/* High-visibility Credit vs Debit Card Indicator */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          expense.cardType === 'credit'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        }`}>
                          <CreditCard className="w-3 h-3" />
                          <span>{expense.cardType === 'credit' ? 'Credit Card' : 'Debit Card'}</span>
                          <span>· **{expense.cardLast4}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-white tabular-nums block">
                      {expense.currency} {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Category Badge (Interactive Edit) & Raw SMS Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  {/* Category Pill with Edit Pen */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Category:</span>
                    <button
                      type="button"
                      onClick={() => onEditCategory(expense)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition-all hover:scale-105 active:scale-95 group shadow-sm ring-1 ring-slate-700/50 hover:ring-indigo-500"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                      title="Click to edit category"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{cat.name}</span>
                      <Edit2 className="w-3 h-3 opacity-60 group-hover:opacity-100 ml-0.5" />
                    </button>
                  </div>

                  {/* Raw SMS Source Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedSmsId(isSmsExpanded ? null : expense.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{isSmsExpanded ? 'Hide SMS' : 'View SMS'}</span>
                  </button>
                </div>

                {/* Collapsible Raw SMS Drawer */}
                {isSmsExpanded && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed animate-in fade-in duration-150">
                    <span className="text-slate-500 font-semibold block mb-0.5">SOURCE SMS BODY:</span>
                    &ldquo;{expense.rawSmsText}&rdquo;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
