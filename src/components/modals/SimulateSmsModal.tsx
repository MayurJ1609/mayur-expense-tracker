import React, { useState, useEffect } from 'react';
import { parseSms } from '../../utils/smsParser';
import { SmsMessage } from '../../types/expense';
import { MessageSquareText, Send, Sparkles, CheckCircle2, AlertTriangle, X, CreditCard, Landmark, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulateSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSmsAndExpense: (sender: string, body: string) => void;
}

const PRESET_MESSAGES = [
  {
    label: 'HDFC Credit Card · Starbucks',
    sender: 'AD-HDFCBK',
    text: 'Rs 1,820.00 spent on your HDFC Bank Credit Card xx4291 at STARBUCKS COFFEE on 07-Nov-26. Avail limit: Rs 1,46,730.00.',
  },
  {
    label: 'SBI Debit Card · DMart Groceries',
    sender: 'VK-SBIINB',
    text: 'Alert: INR 4,150.00 debited from SBI Debit Card ending 8821 at DMART HYPERMARKET on 07-Nov-26. Avl Bal: INR 37,970.00.',
  },
  {
    label: 'Chase Credit Card · Uber Ride',
    sender: 'CHASE',
    text: 'Chase Sapphire Credit Card ending in 1044: You made a purchase of $38.75 at UBER TECHNOLOGIES on Nov 07.',
  },
  {
    label: 'ICICI Debit Card · Shell Fuel',
    sender: 'JM-ICICIB',
    text: 'ICICI Bank Debit Card XX9012 was used for INR 2,500.00 at SHELL PETROL PUMP on 07-Nov-26. Balance: INR 16,840.00.',
  },
  {
    label: 'Axis Credit Card · Swiggy Food',
    sender: 'AX-AXISBK',
    text: 'Axis Bank Credit Card xx6634 was used for INR 620.00 at SWIGGY FOOD on 07-Nov-26. Avail limit: INR 94,180.00.',
  },
];

export const SimulateSmsModal: React.FC<SimulateSmsModalProps> = ({
  isOpen,
  onClose,
  onAddSmsAndExpense,
}) => {
  if (!isOpen) return null;

  const [sender, setSender] = useState('AD-HDFCBK');
  const [smsBody, setSmsBody] = useState(PRESET_MESSAGES[0].text);
  const [parseResult, setParseResult] = useState<any>(null);

  // Live parse effect as user changes sender or text
  useEffect(() => {
    const tempMsg: SmsMessage = {
      id: 'temp-sim',
      sender,
      bankCode: '',
      receivedAt: new Date().toISOString(),
      timestamp: Date.now(),
      body: smsBody,
      isRead: false,
      status: 'parsed',
    };
    const parsed = parseSms(tempMsg);
    setParseResult(parsed);
  }, [sender, smsBody]);

  const handleApplyPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setSender(preset.sender);
    setSmsBody(preset.text);
  };

  const handleProcess = () => {
    if (!smsBody.trim()) return;
    onAddSmsAndExpense(sender, smsBody);
    
    // Celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Android Bottom Sheet */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Simulate Incoming Bank SMS</h2>
              <p className="text-xs text-slate-400">Test real-time SMS parsing & auto-categorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Presets Bar */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Quick Test Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_MESSAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-slate-600 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sender Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                SMS Sender Header
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. AD-HDFCBK"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Bank Detection
              </label>
              <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs flex items-center gap-2">
                <Landmark className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-200 font-medium">{parseResult?.bankName || 'Detecting bank...'}</span>
              </div>
            </div>
          </div>

          {/* SMS Body Textarea */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Raw SMS Message Content
            </label>
            <textarea
              rows={3}
              value={smsBody}
              onChange={(e) => setSmsBody(e.target.value)}
              placeholder="Paste any bank transaction SMS here..."
              className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Live Regex Parser Engine Preview */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Real-Time Parser Extraction
              </span>
              {parseResult ? (
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Valid Expense SMS
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No expense cues detected
                </span>
              )}
            </div>

            {parseResult ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Amount</span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    {parseResult.currency} {parseResult.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Payment Method</span>
                  <span className={`text-xs font-bold capitalize flex items-center gap-1 ${
                    parseResult.cardType === 'credit' ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                    <CreditCard className="w-3 h-3" />
                    {parseResult.cardType} Card
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Bank & Card</span>
                  <span className="text-xs font-medium text-slate-200 truncate block">
                    {parseResult.bankName} · **{parseResult.cardLast4}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Category</span>
                  <span className="text-xs font-medium text-indigo-400 capitalize flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {parseResult.category}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Type or select an SMS with spending keywords (e.g., spent, debited, charged, at merchant, Rs/INR).
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult}
            onClick={handleProcess}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Process & Track Expense
          </button>
        </div>
      </div>
    </div>
  );
};
