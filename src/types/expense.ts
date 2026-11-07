export type CardType = 'credit' | 'debit';

export interface BankInfo {
  id: string;
  name: string;
  shortName: string;
  code: string; // e.g. HDFC, SBI, ICICI, CHASE
  brandColor: string; // Tailwind hex or class
  textColor: string;
  logoText: string;
}

export interface CardAccount {
  id: string;
  bankName: string;
  bankCode: string;
  cardType: CardType;
  last4: string;
  holderName: string;
  cardNetwork: 'Visa' | 'Mastercard' | 'RuPay' | 'Amex';
  cardColor: string;
  limit?: number; // for credit card
  billingCycleDay?: number;
  totalSpent: number;
}

export type CategoryId = 
  | 'food'
  | 'shopping'
  | 'groceries'
  | 'travel'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'investment'
  | 'other';

export interface CategoryItem {
  id: CategoryId | string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ExpenseItem {
  id: string;
  smsId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: CategoryId | string;
  cardType: CardType;
  bankName: string;
  bankCode: string;
  cardLast4: string;
  date: string; // ISO date
  timestamp: number;
  rawSmsText: string;
  notes?: string;
  isEdited?: boolean;
}

export interface SmsMessage {
  id: string;
  sender: string;
  bankCode: string;
  receivedAt: string;
  timestamp: number;
  body: string;
  parsedExpenseId?: string;
  isRead: boolean;
  status: 'parsed' | 'ignored' | 'otp';
}

export type ActiveScreen = 'dashboard' | 'expenses' | 'sms' | 'cards';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}
