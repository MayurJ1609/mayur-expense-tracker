/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ExpenseItem, 
  SmsMessage, 
  CardAccount, 
  CategoryItem, 
  ActiveScreen 
} from './types/expense';
import { 
  INITIAL_EXPENSES, 
  INITIAL_SMS_MESSAGES, 
  INITIAL_CARDS, 
  DEFAULT_CATEGORIES 
} from './data/mockData';
import { parseSms, convertParsedToExpense } from './utils/smsParser';

import { AndroidFrame } from './components/AndroidFrame';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { SmsInboxScreen } from './components/screens/SmsInboxScreen';
import { CardsScreen } from './components/screens/CardsScreen';

import { CategoryEditModal } from './components/modals/CategoryEditModal';
import { SimulateSmsModal } from './components/modals/SimulateSmsModal';
import { FlutterCodeModal } from './components/modals/FlutterCodeModal';

const STORAGE_KEYS = {
  EXPENSES: 'spendtrack_expenses_v1',
  SMS: 'spendtrack_sms_v1',
  CARDS: 'spendtrack_cards_v1',
  CATEGORIES: 'spendtrack_categories_v1',
  BUDGET: 'spendtrack_budget_v1',
  CURRENCY: 'spendtrack_currency_v1',
};

export default function App() {
  // Initialize state with localStorage fallbacks
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SMS);
      return saved ? JSON.parse(saved) : INITIAL_SMS_MESSAGES;
    } catch {
      return INITIAL_SMS_MESSAGES;
    }
  });

  const [cards, setCards] = useState<CardAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? JSON.parse(saved) : 35000;
    } catch {
      return 35000;
    }
  });

  const [currency, setCurrency] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      return saved || '₹';
    } catch {
      return '₹';
    }
  });

  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');

  // Modals state
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isSimulateSmsOpen, setIsSimulateSmsOpen] = useState(false);
  const [isFlutterCodeOpen, setIsFlutterCodeOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(smsMessages));
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(monthlyBudget));
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    } catch {
      // LocalStorage error fail-safe
    }
  }, [expenses, smsMessages, cards, categories, monthlyBudget, currency]);

  // Handler: Edit Category of an expense
  const handleSaveCategory = (expenseId: string, newCategoryId: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId ? { ...e, category: newCategoryId, isEdited: true } : e
      )
    );
  };

  // Handler: Add Custom Category
  const handleAddCustomCategory = (name: string): string => {
    const id = `cat_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const colors = ['#06b6d4', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1'];
    const chosenColor = colors[categories.length % colors.length];

    const newCategory: CategoryItem = {
      id,
      name,
      iconName: 'Tag',
      color: chosenColor,
      bgColor: `${chosenColor}20`,
      borderColor: `${chosenColor}40`,
    };

    setCategories((prev) => [...prev, newCategory]);
    return id;
  };

  // Handler: Add Simulated SMS and auto-parse expense
  const handleAddSmsAndExpense = (sender: string, body: string) => {
    const newSmsId = `sms-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newSms: SmsMessage = {
      id: newSmsId,
      sender,
      bankCode: '',
      receivedAt: nowIso,
      timestamp: Date.now(),
      body,
      isRead: true,
      status: 'parsed',
    };

    const parsedResult = parseSms(newSms);

    if (parsedResult) {
      const newExpense = convertParsedToExpense(parsedResult, newSmsId, body);
      newSms.status = 'parsed';
      newSms.parsedExpenseId = newExpense.id;
      newSms.bankCode = parsedResult.bankCode;

      setExpenses((prev) => [newExpense, ...prev]);

      // Check if this card exists, or add to card accounts
      setCards((prevCards) => {
        const existingCardIndex = prevCards.findIndex(
          (c) => c.last4 === newExpense.cardLast4 && c.cardType === newExpense.cardType
        );

        if (existingCardIndex !== -1) {
          const updated = [...prevCards];
          updated[existingCardIndex] = {
            ...updated[existingCardIndex],
            totalSpent: updated[existingCardIndex].totalSpent + newExpense.amount,
          };
          return updated;
        } else {
          // Create new card entry
          const newCard: CardAccount = {
            id: `card-${Date.now()}`,
            bankName: newExpense.bankName,
            bankCode: newExpense.bankCode,
            cardType: newExpense.cardType,
            last4: newExpense.cardLast4,
            holderName: 'ALEX R.',
            cardNetwork: 'Visa',
            cardColor:
              newExpense.cardType === 'credit'
                ? 'from-indigo-900 via-purple-950 to-slate-950'
                : 'from-emerald-900 via-teal-950 to-slate-950',
            limit: newExpense.cardType === 'credit' ? 100000 : undefined,
            totalSpent: newExpense.amount,
          };
          return [...prevCards, newCard];
        }
      });
    } else {
      newSms.status = 'otp';
    }

    setSmsMessages((prev) => [newSms, ...prev]);
  };

  return (
    <>
      <AndroidFrame
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        onOpenFlutterCode={() => setIsFlutterCodeOpen(true)}
        onOpenSimulateSms={() => setIsSimulateSmsOpen(true)}
        smsCount={smsMessages.length}
        unreadSmsCount={0}
      >
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            expenses={expenses}
            categories={categories}
            monthlyBudget={monthlyBudget}
            currency={currency}
            onNavigate={setCurrentScreen}
            onEditCategory={(exp) => setEditingExpense(exp)}
            onOpenSimulateSms={() => setIsSimulateSmsOpen(true)}
          />
        )}

        {currentScreen === 'expenses' && (
          <ExpensesScreen
            expenses={expenses}
            categories={categories}
            currency={currency}
            onEditCategory={(exp) => setEditingExpense(exp)}
            onOpenSimulateSms={() => setIsSimulateSmsOpen(true)}
          />
        )}

        {currentScreen === 'sms' && (
          <SmsInboxScreen
            smsMessages={smsMessages}
            expenses={expenses}
            categories={categories}
            onOpenSimulateSms={() => setIsSimulateSmsOpen(true)}
            onEditCategory={(exp) => setEditingExpense(exp)}
          />
        )}

        {currentScreen === 'cards' && (
          <CardsScreen
            cards={cards}
            expenses={expenses}
            currency={currency}
            monthlyBudget={monthlyBudget}
            onUpdateMonthlyBudget={setMonthlyBudget}
            onUpdateCurrency={setCurrency}
          />
        )}
      </AndroidFrame>

      {/* Category Edit Bottom Sheet Modal */}
      <CategoryEditModal
        expense={editingExpense}
        categories={categories}
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        onSaveCategory={handleSaveCategory}
        onAddCustomCategory={handleAddCustomCategory}
      />

      {/* Simulate Incoming SMS Modal */}
      <SimulateSmsModal
        isOpen={isSimulateSmsOpen}
        onClose={() => setIsSimulateSmsOpen(false)}
        onAddSmsAndExpense={handleAddSmsAndExpense}
      />

      {/* Flutter Source Code (Dart) Viewer & Downloader Modal */}
      <FlutterCodeModal
        isOpen={isFlutterCodeOpen}
        onClose={() => setIsFlutterCodeOpen(false)}
      />
    </>
  );
}
