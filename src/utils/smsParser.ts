import { CardType, CategoryId, ExpenseItem, SmsMessage } from '../types/expense';

export interface ParsedSmsResult {
  isExpense: boolean;
  amount: number;
  currency: string;
  merchant: string;
  category: CategoryId;
  cardType: CardType;
  bankName: string;
  bankCode: string;
  cardLast4: string;
  date: string;
  timestamp: number;
}

export const BANK_CONFIGS: Record<string, { name: string; brandColor: string; textColor: string; logoText: string }> = {
  HDFC: { name: 'HDFC Bank', brandColor: '#004c8f', textColor: '#ffffff', logoText: 'HDFC' },
  SBI: { name: 'State Bank of India', brandColor: '#280071', textColor: '#ffffff', logoText: 'SBI' },
  ICICI: { name: 'ICICI Bank', brandColor: '#f37021', textColor: '#ffffff', logoText: 'ICICI' },
  AXIS: { name: 'Axis Bank', brandColor: '#97144d', textColor: '#ffffff', logoText: 'AXIS' },
  KOTAK: { name: 'Kotak Mahindra Bank', brandColor: '#ed1c24', textColor: '#ffffff', logoText: 'KOTAK' },
  CHASE: { name: 'Chase Bank', brandColor: '#1170cf', textColor: '#ffffff', logoText: 'CHASE' },
  CITI: { name: 'Citibank', brandColor: '#003b70', textColor: '#ffffff', logoText: 'CITI' },
  AMEX: { name: 'American Express', brandColor: '#016fd0', textColor: '#ffffff', logoText: 'AMEX' },
  BOFA: { name: 'Bank of America', brandColor: '#e31837', textColor: '#ffffff', logoText: 'BofA' },
  OTHER: { name: 'General Bank', brandColor: '#475569', textColor: '#ffffff', logoText: 'BANK' },
};

export function detectBank(sender: string, text: string): { bankName: string; bankCode: string } {
  const upperSender = sender.toUpperCase();
  const upperText = text.toUpperCase();

  if (upperSender.includes('HDFC') || upperText.includes('HDFC BANK') || upperText.includes('HDFCBK')) {
    return { bankName: 'HDFC Bank', bankCode: 'HDFC' };
  }
  if (upperSender.includes('SBI') || upperText.includes('STATE BANK') || upperText.includes('SBI CARD') || upperText.includes('SBIINB')) {
    return { bankName: 'State Bank of India', bankCode: 'SBI' };
  }
  if (upperSender.includes('ICICI') || upperText.includes('ICICI BANK') || upperText.includes('ICICIB')) {
    return { bankName: 'ICICI Bank', bankCode: 'ICICI' };
  }
  if (upperSender.includes('AXIS') || upperText.includes('AXIS BANK') || upperText.includes('AXISBK')) {
    return { bankName: 'Axis Bank', bankCode: 'AXIS' };
  }
  if (upperSender.includes('KOTAK') || upperText.includes('KOTAK BANK') || upperText.includes('KOTAKB')) {
    return { bankName: 'Kotak Mahindra Bank', bankCode: 'KOTAK' };
  }
  if (upperSender.includes('CHASE') || upperText.includes('CHASE BANK') || upperText.includes('JPMORGAN')) {
    return { bankName: 'Chase Bank', bankCode: 'CHASE' };
  }
  if (upperSender.includes('CITI') || upperText.includes('CITIBANK')) {
    return { bankName: 'Citibank', bankCode: 'CITI' };
  }
  if (upperSender.includes('AMEX') || upperText.includes('AMERICAN EXPRESS')) {
    return { bankName: 'American Express', bankCode: 'AMEX' };
  }
  if (upperSender.includes('BOFA') || upperText.includes('BANK OF AMERICA')) {
    return { bankName: 'Bank of America', bankCode: 'BOFA' };
  }

  // Fallback to sender code extraction e.g. "VM-HDFCBK" -> "HDFC"
  for (const code of Object.keys(BANK_CONFIGS)) {
    if (upperSender.includes(code) || upperText.includes(code)) {
      return { bankName: BANK_CONFIGS[code].name, bankCode: code };
    }
  }

  return { bankName: 'Partner Bank', bankCode: 'OTHER' };
}

export function detectCardType(text: string): CardType {
  const lower = text.toLowerCase();
  
  // Specific credit indicators
  if (
    lower.includes('credit card') || 
    lower.includes('creditcard') || 
    lower.includes('cc ending') || 
    lower.includes('on your cc') ||
    lower.includes('credit card xx') ||
    lower.includes('charged to your card') ||
    lower.includes('sbi card') ||
    lower.includes('sapphire') ||
    lower.includes('visa signature') ||
    lower.includes('platinum card')
  ) {
    return 'credit';
  }

  // Specific debit indicators
  if (
    lower.includes('debit card') || 
    lower.includes('debitcard') || 
    lower.includes('dc ending') || 
    lower.includes('on your dc') ||
    lower.includes('a/c') || 
    lower.includes('account debited') ||
    lower.includes('debited from a/c') ||
    lower.includes('atm withdrawal')
  ) {
    return 'debit';
  }

  // Default to debit if "debited" without credit mention
  if (lower.includes('debited') || lower.includes('withdrawn')) {
    return 'debit';
  }

  // Default to credit if "spent" or "charged"
  if (lower.includes('spent') || lower.includes('charged')) {
    return 'credit';
  }

  return 'debit';
}

export function extractCardLast4(text: string): string {
  // Matches xx1234, **1234, ending 1234, ...1234, Card ending in 1234
  const patterns = [
    /(?:card|a\/c|acct|ending|xx|\*\*)\s*(?:no\.?|in)?\s*[:.\s]*[x*X]*(\d{4})/i,
    /(?:\.\.\.|ending\s+)(\d{4})/i,
    /(?:xx|Xx|XX|\*\*)(\d{4})/,
    /\b(\d{4})\b(?=.*(?:spent|debited|card|avail))/i
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '4892'; // fallback realistic 4 digits
}

export function extractAmount(text: string): { amount: number; currency: string } {
  // Ignore OTP or balance numbers
  // Matches: Rs. 1,450.00, Rs 1450, INR 1,450, ₹1,450.50, $45.20, USD 45.20
  const cleanText = text.replace(/avail(?:able)?\s+limit[:\s]+[^\s]+/gi, '')
                        .replace(/avail(?:able)?\s+bal(?:ance)?[:\s]+[^\s]+/gi, '')
                        .replace(/bal[:\s]+[^\s]+/gi, '');

  const amountPatterns = [
    /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:\$|USD)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:EUR|€)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /for\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /spent\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /debited\s+by\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pat of amountPatterns) {
    const match = cleanText.match(pat);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        let currency = '₹';
        if (text.includes('$') || text.toUpperCase().includes('USD')) currency = '$';
        else if (text.includes('€') || text.toUpperCase().includes('EUR')) currency = '€';
        else if (text.includes('£') || text.toUpperCase().includes('GBP')) currency = '£';
        return { amount: num, currency };
      }
    }
  }

  return { amount: 0, currency: '₹' };
}

export function extractMerchant(text: string): string {
  // Looks for patterns:
  // "at STARBUCKS on"
  // "to SWIGGY on"
  // "vpa uber@axis"
  // "Info: DMART SUPERMARKET"
  const patterns = [
    /(?:at|to|info:?)\s+([A-Z0-9\s&'-]{3,24}?)(?:\s+(?:on|dated|ref|vpa|avl|bal|avail|\.))/i,
    /(?:at|to|info:?)\s+([A-Za-z0-9\s&'-]{3,20})$/i,
    /VPA\s+([a-zA-Z0-9._-]+@[a-zA-Z]+)/i,
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Filter out words like "your", "ATM", "Card"
      if (!/^(your|bank|card|branch|account)$/i.test(candidate)) {
        return candidate.replace(/\b\w/g, c => c.toUpperCase());
      }
    }
  }

  // Fallback checks for well-known brands in SMS body
  const brandKeywords: Record<string, string> = {
    'starbucks': 'Starbucks Coffee',
    'swiggy': 'Swiggy',
    'zomato': 'Zomato',
    'amazon': 'Amazon Retail',
    'flipkart': 'Flipkart',
    'dmart': 'DMart Supermarket',
    'blinkit': 'Blinkit Grocery',
    'zepto': 'Zepto Quick',
    'uber': 'Uber Rides',
    'ola': 'Ola Cabs',
    'netflix': 'Netflix Streaming',
    'spotify': 'Spotify Premium',
    'apple': 'Apple Services',
    'shell': 'Shell Fuel Station',
    'apollo': 'Apollo Pharmacy',
    'mcdonald': "McDonald's",
    'zara': 'Zara Fashion',
    'nike': 'Nike Store',
    'airtel': 'Airtel Broadband',
    'jio': 'Reliance Jio',
    'bookmyshow': 'BookMyShow Movies',
  };

  const lowerText = text.toLowerCase();
  for (const [key, name] of Object.entries(brandKeywords)) {
    if (lowerText.includes(key)) {
      return name;
    }
  }

  return 'Retail Merchant';
}

export function categorizeMerchant(merchant: string, text: string): CategoryId {
  const combined = (merchant + ' ' + text).toLowerCase();

  if (
    combined.includes('swiggy') ||
    combined.includes('zomato') ||
    combined.includes('starbucks') ||
    combined.includes('mcdonald') ||
    combined.includes('kfc') ||
    combined.includes('burger') ||
    combined.includes('restaurant') ||
    combined.includes('cafe') ||
    combined.includes('domino') ||
    combined.includes('dining') ||
    combined.includes('pizza') ||
    combined.includes('bakery')
  ) {
    return 'food';
  }

  if (
    combined.includes('dmart') ||
    combined.includes('blinkit') ||
    combined.includes('zepto') ||
    combined.includes('instamart') ||
    combined.includes('bigbasket') ||
    combined.includes('grocery') ||
    combined.includes('supermarket') ||
    combined.includes('nature') ||
    combined.includes('fruits') ||
    combined.includes('vegetables')
  ) {
    return 'groceries';
  }

  if (
    combined.includes('amazon') ||
    combined.includes('flipkart') ||
    combined.includes('myntra') ||
    combined.includes('zara') ||
    combined.includes('h&m') ||
    combined.includes('ajio') ||
    combined.includes('nike') ||
    combined.includes('shopping') ||
    combined.includes('decathlon') ||
    combined.includes('ikea') ||
    combined.includes('store') ||
    combined.includes('mall')
  ) {
    return 'shopping';
  }

  if (
    combined.includes('uber') ||
    combined.includes('ola') ||
    combined.includes('rapido') ||
    combined.includes('shell') ||
    combined.includes('petrol') ||
    combined.includes('fuel') ||
    combined.includes('irctc') ||
    combined.includes('flight') ||
    combined.includes('indigo') ||
    combined.includes('makemytrip') ||
    combined.includes('metro') ||
    combined.includes('travel')
  ) {
    return 'travel';
  }

  if (
    combined.includes('netflix') ||
    combined.includes('spotify') ||
    combined.includes('hotstar') ||
    combined.includes('pvr') ||
    combined.includes('inox') ||
    combined.includes('cinema') ||
    combined.includes('bookmyshow') ||
    combined.includes('youtube') ||
    combined.includes('prime') ||
    combined.includes('game') ||
    combined.includes('entertainment')
  ) {
    return 'entertainment';
  }

  if (
    combined.includes('airtel') ||
    combined.includes('jio') ||
    combined.includes('electricity') ||
    combined.includes('water') ||
    combined.includes('gas') ||
    combined.includes('bill') ||
    combined.includes('broadband') ||
    combined.includes('recharge') ||
    combined.includes('utility')
  ) {
    return 'utilities';
  }

  if (
    combined.includes('apollo') ||
    combined.includes('pharmacy') ||
    combined.includes('1mg') ||
    combined.includes('hospital') ||
    combined.includes('clinic') ||
    combined.includes('medical') ||
    combined.includes('gym') ||
    combined.includes('cult') ||
    combined.includes('fitness')
  ) {
    return 'health';
  }

  return 'other';
}

export function parseSms(message: SmsMessage): ParsedSmsResult | null {
  const text = message.body;
  const lower = text.toLowerCase();

  // Ignore OTP or non-financial SMS
  if (
    lower.includes('otp') ||
    lower.includes('one time password') ||
    lower.includes('verification code') ||
    lower.includes('secret code') ||
    lower.includes('do not share')
  ) {
    return null;
  }

  // Must have spending or debiting cues
  const hasExpenseCue = 
    lower.includes('spent') ||
    lower.includes('debited') ||
    lower.includes('charged') ||
    lower.includes('withdrawn') ||
    lower.includes('purchase') ||
    lower.includes('transaction') ||
    lower.includes('paid');

  if (!hasExpenseCue) {
    return null;
  }

  const { amount, currency } = extractAmount(text);
  if (amount <= 0) {
    return null;
  }

  const { bankName, bankCode } = detectBank(message.sender, text);
  const cardType = detectCardType(text);
  const cardLast4 = extractCardLast4(text);
  const merchant = extractMerchant(text);
  const category = categorizeMerchant(merchant, text);

  return {
    isExpense: true,
    amount,
    currency,
    merchant,
    category,
    cardType,
    bankName,
    bankCode,
    cardLast4,
    date: message.receivedAt,
    timestamp: message.timestamp,
  };
}

export function convertParsedToExpense(result: ParsedSmsResult, smsId: string, rawText: string): ExpenseItem {
  return {
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    smsId,
    amount: result.amount,
    currency: result.currency,
    merchant: result.merchant,
    category: result.category,
    cardType: result.cardType,
    bankName: result.bankName,
    bankCode: result.bankCode,
    cardLast4: result.cardLast4,
    date: result.date,
    timestamp: result.timestamp,
    rawSmsText: rawText,
  };
}
