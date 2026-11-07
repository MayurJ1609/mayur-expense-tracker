import React, { useState } from 'react';
import { SmsMessage, ExpenseItem, CategoryItem } from '../../types/expense';
import { 
  MessageSquareText, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  CreditCard, 
  Landmark, 
  Tag, 
  Edit2,
  Copy,
  Check
} from 'lucide-react';

interface SmsInboxScreenProps {
  smsMessages: SmsMessage[];
  expenses: ExpenseItem[];
  categories: CategoryItem[];
  onOpenSimulateSms: () => void;
  onEditCategory: (expense: ExpenseItem) => void;
}

export const SmsInboxScreen: React.FC<SmsInboxScreenProps> = ({
  smsMessages,
  expenses,
  categories,
  onOpenSimulateSms,
  onEditCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'parsed' | 'otp'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter SMS
  const filteredMessages = smsMessages.filter((msg) => {
    if (filterStatus === 'parsed' && msg.status !== 'parsed') return false;
    if (filterStatus === 'otp' && msg.status !== 'otp') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return msg.body.toLowerCase().includes(q) || msg.sender.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Android SMS Inbox & Parser</h2>
          <p className="text-xs text-slate-400">
            Real-time SMS listener parses bank text messages into categorized expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh SMS scan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSimulateSms}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Bank SMS</span>
          </button>
        </div>
      </div>

      {/* Android System Telephony Permission Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-800/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">RECEIVE_SMS & READ_SMS</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Granted
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automatic regex parser reads incoming bank transaction SMS instantly without user intervention.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bank sender (HDFCBK, SBIINB) or SMS text..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All SMS ({smsMessages.length})
          </button>
          <button
            onClick={() => setFilterStatus('parsed')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              filterStatus === 'parsed'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Parsed Expenses ({smsMessages.filter((m) => m.status === 'parsed').length})
          </button>
          <button
            onClick={() => setFilterStatus('otp')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              filterStatus === 'otp'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OTP & Ignored ({smsMessages.filter((m) => m.status === 'otp').length})
          </button>
        </div>
      </div>

      {/* SMS Messages Stream */}
      <div className="space-y-3.5">
        {filteredMessages.map((msg) => {
          // Find matching parsed expense if any
          const matchingExpense = expenses.find((e) => e.smsId === msg.id || e.rawSmsText === msg.body);
          const isParsed = msg.status === 'parsed' && matchingExpense;

          const cat = matchingExpense 
            ? (categories.find(c => c.id === matchingExpense.category) || { name: matchingExpense.category, color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)' })
            : null;

          return (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isParsed
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-900/80 opacity-75'
              }`}
            >
              {/* Header: Sender ID & Timestamp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isParsed ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {msg.sender.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.receivedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {new Date(msg.receivedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isParsed ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Parsed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {msg.status === 'otp' ? 'OTP Message' : 'Ignored'}
                    </span>
                  )}

                  <button
                    onClick={() => handleCopyText(msg.id, msg.body)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Copy SMS text"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Raw SMS Message Body */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed">
                &ldquo;{msg.body}&rdquo;
              </div>

              {/* Extracted Data Pills if Parsed */}
              {isParsed && matchingExpense && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Entity Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Amount */}
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-bold tabular-nums">
                      {matchingExpense.currency} {matchingExpense.amount.toLocaleString('en-IN')}
                    </span>

                    {/* Credit Card vs Debit Card */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                      matchingExpense.cardType === 'credit'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                    }`}>
                      <CreditCard className="w-3 h-3" />
                      <span>{matchingExpense.cardType === 'credit' ? 'Credit Card' : 'Debit Card'}</span>
                      <span>· **{matchingExpense.cardLast4}</span>
                    </span>

                    {/* Bank Name */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60 text-[11px]">
                      <Landmark className="w-3 h-3 text-indigo-400" />
                      <span>{matchingExpense.bankName}</span>
                    </span>
                  </div>

                  {/* Category Pill with Edit Action */}
                  {cat && (
                    <button
                      type="button"
                      onClick={() => onEditCategory(matchingExpense)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95 group shadow-sm ring-1 ring-slate-700/60 hover:ring-indigo-400"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                      title="Click to edit category"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{cat.name}</span>
                      <Edit2 className="w-3 h-3 opacity-60 group-hover:opacity-100 ml-0.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
