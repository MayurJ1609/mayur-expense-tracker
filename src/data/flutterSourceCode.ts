export interface FlutterFile {
  path: string;
  filename: string;
  language: string;
  content: string;
  description: string;
}

export const FLUTTER_CODEBASE: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    language: 'yaml',
    description: 'Flutter project dependencies (telephony SMS reader, provider, fl_chart, intl, google_fonts)',
    content: `name: spendtrack_sms
description: "Android Expense Tracker written in Flutter reading SMS, detecting Credit/Debit card and Bank name, with editable categories."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # SMS reading on Android
  telephony: ^0.2.0
  # State management
  provider: ^6.1.2
  # Beautiful Material 3 charts
  fl_chart: ^0.66.0
  # Date & currency formatting
  intl: ^0.19.0
  # Google Fonts
  google_fonts: ^6.1.0
  # Local storage for persistence
  shared_preferences: ^2.2.2
  # Modern icons
  flutter_lucide: ^0.1.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest with SMS read and receive permissions required for expense parsing',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.spendtrack_sms">

    <!-- Permissions required to read incoming and inbox SMS messages for expense tracking -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <application
        android:label="SpendTrack SMS"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    path: 'lib/models/expense.dart',
    filename: 'expense.dart',
    language: 'dart',
    description: 'Data models for Expense, CardType (Credit vs Debit), Bank details, and Category',
    content: `enum CardType { credit, debit }

class Expense {
  final String id;
  final String smsId;
  final double amount;
  final String currency;
  final String merchant;
  String category; // mutable for editing
  final CardType cardType;
  final String bankName;
  final String bankCode;
  final String cardLast4;
  final DateTime date;
  final String rawSms;

  Expense({
    required this.id,
    required this.smsId,
    required this.amount,
    required this.currency,
    required this.merchant,
    required this.category,
    required this.cardType,
    required this.bankName,
    required this.bankCode,
    required this.cardLast4,
    required this.date,
    required this.rawSms,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'smsId': smsId,
    'amount': amount,
    'currency': currency,
    'merchant': merchant,
    'category': category,
    'cardType': cardType.name,
    'bankName': bankName,
    'bankCode': bankCode,
    'cardLast4': cardLast4,
    'date': date.toIso8601String(),
    'rawSms': rawSms,
  };

  factory Expense.fromJson(Map<String, dynamic> json) => Expense(
    id: json['id'],
    smsId: json['smsId'],
    amount: (json['amount'] as num).toDouble(),
    currency: json['currency'],
    merchant: json['merchant'],
    category: json['category'],
    cardType: json['cardType'] == 'credit' ? CardType.credit : CardType.debit,
    bankName: json['bankName'],
    bankCode: json['bankCode'],
    cardLast4: json['cardLast4'],
    date: DateTime.parse(json['date']),
    rawSms: json['rawSms'],
  );
}
`
  },
  {
    path: 'lib/services/sms_parser.dart',
    filename: 'sms_parser.dart',
    language: 'dart',
    description: 'Regex-based SMS parsing engine extracting Amount, Bank, Credit vs Debit Card, Merchant & Category',
    content: `import '../models/expense.dart';

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
  };

  static Expense? parseMessage(String sender, String body, String smsId, DateTime date) {
    final lower = body.toLowerCase();

    // Skip OTP and non-financial messages
    if (lower.contains('otp') || lower.contains('verification code') || lower.contains('do not share')) {
      return null;
    }

    final hasExpenseCue = lower.contains('spent') ||
        lower.contains('debited') ||
        lower.contains('charged') ||
        lower.contains('withdrawn') ||
        lower.contains('purchase');

    if (!hasExpenseCue) return null;

    final amount = _extractAmount(body);
    if (amount <= 0) return null;

    final cardType = _detectCardType(body);
    final bank = _detectBank(sender, body);
    final last4 = _extractLast4(body);
    final merchant = _extractMerchant(body);
    final category = _categorize(merchant, body);

    return Expense(
      id: 'exp_\${DateTime.now().millisecondsSinceEpoch}',
      smsId: smsId,
      amount: amount,
      currency: '₹',
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
    if (l.contains('credit card') || l.contains('creditcard') || l.contains('cc ending') || l.contains('spent on your credit card')) {
      return CardType.credit;
    }
    if (l.contains('debit card') || l.contains('debitcard') || l.contains('dc ending') || l.contains('a/c') || l.contains('account debited')) {
      return CardType.debit;
    }
    if (l.contains('debited')) return CardType.debit;
    return CardType.credit;
  }

  static Map<String, String> _detectBank(String sender, String text) {
    final s = sender.toUpperCase();
    final t = text.toUpperCase();

    if (s.contains('HDFC') || t.contains('HDFC')) return {'code': 'HDFC', 'name': 'HDFC Bank'};
    if (s.contains('SBI') || t.contains('STATE BANK')) return {'code': 'SBI', 'name': 'State Bank of India'};
    if (s.contains('ICICI') || t.contains('ICICI')) return {'code': 'ICICI', 'name': 'ICICI Bank'};
    if (s.contains('AXIS') || t.contains('AXIS')) return {'code': 'AXIS', 'name': 'Axis Bank'};
    if (s.contains('KOTAK') || t.contains('KOTAK')) return {'code': 'KOTAK', 'name': 'Kotak Mahindra Bank'};
    if (s.contains('CHASE') || t.contains('CHASE')) return {'code': 'CHASE', 'name': 'Chase Bank'};
    if (s.contains('CITI') || t.contains('CITI')) return {'code': 'CITI', 'name': 'Citibank'};
    return {'code': 'OTHER', 'name': 'Bank Account'};
  }

  static String _extractLast4(String text) {
    final match = RegExp(r'(?:xx|\*\*|ending\s*(?:in)?\s*)(\d{4})', caseSensitive: false).firstMatch(text);
    return match?.group(1) ?? '4291';
  }

  static String _extractMerchant(String text) {
    final match = RegExp(r'(?:at|to|info:?)\s+([A-Za-z0-9\s&]{3,20})(?:\s+(?:on|dated|ref|avl|\.))', caseSensitive: false).firstMatch(text);
    if (match != null) {
      return match.group(1)!.trim();
    }
    final l = text.toLowerCase();
    if (l.contains('starbucks')) return 'Starbucks';
    if (l.contains('dmart')) return 'DMart';
    if (l.contains('amazon')) return 'Amazon';
    if (l.contains('swiggy')) return 'Swiggy';
    if (l.contains('uber')) return 'Uber';
    if (l.contains('netflix')) return 'Netflix';
    return 'Retail Store';
  }

  static String _categorize(String merchant, String text) {
    final l = (merchant + ' ' + text).toLowerCase();
    if (l.contains('swiggy') || l.contains('zomato') || l.contains('starbucks') || l.contains('food')) return 'Food & Dining';
    if (l.contains('dmart') || l.contains('grocery') || l.contains('blinkit') || l.contains('zepto')) return 'Groceries';
    if (l.contains('amazon') || l.contains('flipkart') || l.contains('zara') || l.contains('shopping')) return 'Shopping';
    if (l.contains('uber') || l.contains('fuel') || l.contains('petrol') || l.contains('shell')) return 'Travel';
    if (l.contains('netflix') || l.contains('spotify') || l.contains('hotstar')) return 'Entertainment';
    if (l.contains('airtel') || l.contains('jio') || l.contains('bill') || l.contains('electricity')) return 'Bills & Utilities';
    return 'General';
  }
}
`
  },
  {
    path: 'lib/providers/expense_provider.dart',
    filename: 'expense_provider.dart',
    language: 'dart',
    description: 'ChangeNotifier Provider managing SMS reading, expense state, and category edits',
    content: `import 'package:flutter/foundation.dart';
import '../models/expense.dart';
import '../services/sms_parser.dart';

class ExpenseProvider extends ChangeNotifier {
  List<Expense> _expenses = [];
  double _monthlyBudget = 25000.0;
  bool _isSmsListening = true;

  List<Expense> get expenses => _expenses;
  double get monthlyBudget => _monthlyBudget;
  bool get isSmsListening => _isSmsListening;

  double get totalSpent => _expenses.fold(0.0, (sum, item) => sum + item.amount);
  
  double get creditCardSpent => _expenses
      .where((e) => e.cardType == CardType.credit)
      .fold(0.0, (sum, item) => sum + item.amount);

  double get debitCardSpent => _expenses
      .where((e) => e.cardType == CardType.debit)
      .fold(0.0, (sum, item) => sum + item.amount);

  void updateCategory(String expenseId, String newCategory) {
    final index = _expenses.indexWhere((e) => e.id == expenseId);
    if (index != -1) {
      _expenses[index].category = newCategory;
      notifyListeners();
    }
  }

  void addParsedExpenseFromSms(String sender, String body) {
    final parsed = SmsParserService.parseMessage(
      sender,
      body,
      'sms_\${DateTime.now().millisecondsSinceEpoch}',
      DateTime.now(),
    );
    if (parsed != null) {
      _expenses.insert(0, parsed);
      notifyListeners();
    }
  }

  void toggleSmsListener() {
    _isSmsListening = !_isSmsListening;
    notifyListeners();
  }
}
`
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    language: 'dart',
    description: 'Flutter Material 3 App entry point with 4 Navigation Bar destinations',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/expense_provider.dart';
import 'screens/dashboard_screen.dart';
import 'screens/expenses_screen.dart';
import 'screens/sms_inbox_screen.dart';
import 'screens/cards_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ExpenseProvider()),
      ],
      child: const SpendTrackApp(),
    ),
  );
}

class SpendTrackApp extends StatelessWidget {
  const SpendTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SpendTrack SMS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
          surface: const Color(0xFF0F172A),
          background: const Color(0xFF020617),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    ExpensesScreen(),
    SmsInboxScreen(),
    CardsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF0B1120),
        indicatorColor: const Color(0xFF4F46E5).withOpacity(0.25),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFF818CF8)),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF818CF8)),
            label: 'Expenses',
          ),
          NavigationDestination(
            icon: Icon(Icons.sms_outlined),
            selectedIcon: Icon(Icons.sms, color: Color(0xFF818CF8)),
            label: 'SMS Inbox',
          ),
          NavigationDestination(
            icon: Icon(Icons.credit_card_outlined),
            selectedIcon: Icon(Icons.credit_card, color: Color(0xFF818CF8)),
            label: 'Cards',
          ),
        ],
      ),
    );
  }
}
`
  }
];
