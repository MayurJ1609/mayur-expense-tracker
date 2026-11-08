import '../models/expense.dart';

class SmsParserService {
  static final Map<String, String> bankNames = {
    'HDFC': 'HDFC Bank',
    'SBI': 'State Bank of India',
    'ICICI': 'ICICI Bank',
    'AXIS': 'Axis Bank',
    'KOTAK': 'Kotak Mahindra Bank',
    'CHASE': 'Chase Bank',
    'CITI': 'Citibank',
    'AMEX': 'American Express',
    'PNB': 'Punjab National Bank',
    'BOB': 'Bank of Baroda',
  };

  static bool isOtpMessage(String body) {
    final lower = body.toLowerCase();
    return lower.contains('otp') ||
        lower.contains('verification code') ||
        lower.contains('do not share') ||
        lower.contains('one time password') ||
        lower.contains('valid for');
  }

  static Expense? parseMessage(String sender, String body, String smsId, DateTime date) {
    final lower = body.toLowerCase();

    // Skip OTP messages
    if (isOtpMessage(body)) {
      return null;
    }

    final hasExpenseCue = lower.contains('spent') ||
        lower.contains('debited') ||
        lower.contains('charged') ||
        lower.contains('withdrawn') ||
        lower.contains('purchase') ||
        lower.contains('paid') ||
        lower.contains('txn') ||
        lower.contains('used for');

    if (!hasExpenseCue) return null;

    final amount = _extractAmount(body);
    if (amount <= 0) return null;

    final cardType = _detectCardType(body);
    final bank = _detectBank(sender, body);
    final last4 = _extractLast4(body);
    final merchant = _extractMerchant(body);
    final category = _categorize(merchant, body);

    return Expense(
      id: 'exp_${DateTime.now().millisecondsSinceEpoch}_${smsId.hashCode % 1000}',
      smsId: smsId,
      amount: amount,
      currency: body.contains('\$') ? '\$' : '₹',
      merchant: merchant,
      category: category,
      cardType: cardType,
      bankName: bank['name']!,
      bankCode: bank['code']!,
      cardLast4: last4,
      date: date,
      rawSms: body,
    );
  }

  static double _extractAmount(String text) {
    final clean = text
        .replaceAll(RegExp(r'avail(?:able)?\s+limit[:\s]+[^\s]+', caseSensitive: false), '')
        .replaceAll(RegExp(r'avl\s+bal[:\s]+[^\s]+', caseSensitive: false), '');

    final regex = RegExp(r'(?:INR|Rs\.?|₹|\$)\s*([\d,]+(?:\.\d{1,2})?)', caseSensitive: false);
    final match = regex.firstMatch(clean);
    if (match != null) {
      final str = match.group(1)!.replaceAll(',', '');
      return double.tryParse(str) ?? 0.0;
    }
    return 0.0;
  }

  static CardType _detectCardType(String text) {
    final l = text.toLowerCase();
    if (l.contains('credit card') ||
        l.contains('creditcard') ||
        l.contains('cc ending') ||
        l.contains('spent on your credit card') ||
        l.contains('credit card xx')) {
      return CardType.credit;
    }
    if (l.contains('debit card') ||
        l.contains('debitcard') ||
        l.contains('dc ending') ||
        l.contains('a/c') ||
        l.contains('account debited') ||
        l.contains('debit card ending') ||
        l.contains('debited from')) {
      return CardType.debit;
    }
    if (l.contains('debited')) return CardType.debit;
    return CardType.credit;
  }

  static Map<String, String> _detectBank(String sender, String text) {
    final s = sender.toUpperCase();
    final t = text.toUpperCase();

    if (s.contains('HDFC') || t.contains('HDFC')) return {'code': 'HDFC', 'name': 'HDFC Bank'};
    if (s.contains('SBI') || t.contains('STATE BANK') || s.contains('SBIINB')) return {'code': 'SBI', 'name': 'State Bank of India'};
    if (s.contains('ICICI') || t.contains('ICICI')) return {'code': 'ICICI', 'name': 'ICICI Bank'};
    if (s.contains('AXIS') || t.contains('AXIS')) return {'code': 'AXIS', 'name': 'Axis Bank'};
    if (s.contains('KOTAK') || t.contains('KOTAK')) return {'code': 'KOTAK', 'name': 'Kotak Mahindra Bank'};
    if (s.contains('CHASE') || t.contains('CHASE')) return {'code': 'CHASE', 'name': 'Chase Bank'};
    if (s.contains('CITI') || t.contains('CITI')) return {'code': 'CITI', 'name': 'Citibank'};
    if (s.contains('AMEX') || t.contains('AMERICAN EXPRESS')) return {'code': 'AMEX', 'name': 'American Express'};
    if (s.contains('PNB') || t.contains('PUNJAB NATIONAL')) return {'code': 'PNB', 'name': 'Punjab National Bank'};
    if (s.contains('BOB') || t.contains('BANK OF BARODA')) return {'code': 'BOB', 'name': 'Bank of Baroda'};
    return {'code': 'OTHER', 'name': 'Bank Account'};
  }

  static String _extractLast4(String text) {
    final match = RegExp(r'(?:xx|\*\*|ending\s*(?:in)?\s*|a/c\s*)(\d{4})', caseSensitive: false).firstMatch(text);
    return match?.group(1) ?? '4291';
  }

  static String _extractMerchant(String text) {
    final l = text.toLowerCase();
    if (l.contains('starbucks')) return 'Starbucks';
    if (l.contains('dmart')) return 'DMart Supermarket';
    if (l.contains('amazon')) return 'Amazon';
    if (l.contains('swiggy')) return 'Swiggy';
    if (l.contains('zomato')) return 'Zomato';
    if (l.contains('uber')) return 'Uber';
    if (l.contains('ola')) return 'Ola Cabs';
    if (l.contains('netflix')) return 'Netflix';
    if (l.contains('spotify')) return 'Spotify';
    if (l.contains('zara')) return 'Zara Fashion';
    if (l.contains('shell')) return 'Shell Fuel Station';
    if (l.contains('airtel')) return 'Airtel Broadband';
    if (l.contains('flipkart')) return 'Flipkart';
    if (l.contains('blinkit')) return 'Blinkit';
    if (l.contains('zepto')) return 'Zepto';

    final match = RegExp(r'(?:at|to|info:?)\s+([A-Za-z0-9\s&]{3,22})(?:\s+(?:on|dated|ref|avl|\.))', caseSensitive: false).firstMatch(text);
    if (match != null) {
      return match.group(1)!.trim();
    }
    return 'Retail Merchant';
  }

  static String _categorize(String merchant, String text) {
    final l = (merchant + ' ' + text).toLowerCase();
    if (l.contains('swiggy') || l.contains('zomato') || l.contains('starbucks') || l.contains('food') || l.contains('mcdonald') || l.contains('kfc') || l.contains('cafe')) {
      return 'food';
    }
    if (l.contains('dmart') || l.contains('grocery') || l.contains('blinkit') || l.contains('zepto') || l.contains('supermarket')) {
      return 'groceries';
    }
    if (l.contains('amazon') || l.contains('flipkart') || l.contains('zara') || l.contains('shopping') || l.contains('myntra')) {
      return 'shopping';
    }
    if (l.contains('uber') || l.contains('ola') || l.contains('fuel') || l.contains('petrol') || l.contains('shell')) {
      return 'travel';
    }
    if (l.contains('netflix') || l.contains('spotify') || l.contains('hotstar') || l.contains('cinema') || l.contains('prime')) {
      return 'entertainment';
    }
    if (l.contains('airtel') || l.contains('jio') || l.contains('bill') || l.contains('electricity') || l.contains('broadband')) {
      return 'utilities';
    }
    if (l.contains('pharmacy') || l.contains('apollo') || l.contains('1mg') || l.contains('hospital') || l.contains('medical')) {
      return 'health';
    }
    return 'other';
  }
}
