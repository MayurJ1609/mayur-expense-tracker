import React, { useState } from 'react';
import { ExpenseItem, CategoryItem } from '../../types/expense';
import { X, Check, Tag, CreditCard, Landmark, Plus } from 'lucide-react';

interface CategoryEditModalProps {
  expense: ExpenseItem | null;
  categories: CategoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (expenseId: string, newCategoryId: string) => void;
  onAddCustomCategory: (name: string) => string;
}

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  expense,
  categories,
  isOpen,
  onClose,
  onSaveCategory,
  onAddCustomCategory,
}) => {
  if (!isOpen || !expense) return null;

  const [selectedCatId, setSelectedCatId] = useState<string>(expense.category);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSave = () => {
    let finalCatId = selectedCatId;
    if (isCreatingNew && newCategoryName.trim()) {
      finalCatId = onAddCustomCategory(newCategoryName.trim());
    }
    onSaveCategory(expense.id, finalCatId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Android Bottom Sheet Feel */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Edit Expense Category</h2>
              <p className="text-xs text-slate-400">Reclassify transaction & update statistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Merchant</span>
                <p className="text-base font-semibold text-white">{expense.merchant}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</span>
                <p className="text-lg font-bold text-emerald-400 tabular-nums">
                  {expense.currency} {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Bank & Card Detail Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/50 text-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-200">
                <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{expense.bankName}</span>
              </span>

              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${
                expense.cardType === 'credit'
                  ? 'bg-purple-950/70 text-purple-300 border border-purple-800/50'
                  : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
              }`}>
                <CreditCard className="w-3.5 h-3.5" />
                <span>{expense.cardType === 'credit' ? 'Credit Card' : 'Debit Card'} · **{expense.cardLast4}</span>
              </span>

              <span className="text-slate-400 ml-auto tabular-nums">
                {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Raw SMS Source Verification */}
            <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono leading-relaxed">
              <span className="text-slate-500 font-semibold block mb-0.5">SOURCE SMS:</span>
              &ldquo;{expense.rawSmsText}&rdquo;
            </div>
          </div>

          {/* Select Category Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Choose New Category
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {isCreatingNew ? 'Select Existing' : 'Create Custom'}
              </button>
            </div>

            {isCreatingNew ? (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
                <label className="text-xs font-medium text-indigo-300 block">New Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Office Supplies, Pet Care..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.bgColor, color: cat.color }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium truncate flex-1">{cat.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Confirm Category Change
          </button>
        </div>
      </div>
    </div>
  );
};
