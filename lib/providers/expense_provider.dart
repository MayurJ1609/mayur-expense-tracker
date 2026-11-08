import 'package:flutter/material.dart';
import '../models/expense.dart';
import '../data/initial_data.dart';
import '../services/sms_parser.dart';

class ExpenseProvider extends ChangeNotifier {
  final List<Expense> _expenses = List.from(initialExpenses);
  final List<SmsMessageItem> _smsList = List.from(initialSmsList);
  final List<CardAccount> _cards = List.from(initialCards);
  final List<CategoryItem> _categories = List.from(initialCategories);

  double _monthlyBudget = 35000.0;
  CardType? _filterCardType;
  String _searchQuery = '';

  List<Expense> get expenses => _expenses;
  List<SmsMessageItem> get smsList => _smsList;
  List<CardAccount> get cards => _cards;
  List<CategoryItem> get categories => _categories;
  double get monthlyBudget => _monthlyBudget;
  CardType? get filterCardType => _filterCardType;
  String get searchQuery => _searchQuery;

  double get totalSpent => _expenses.fold(0.0, (sum, item) => sum + item.amount);

  double get creditCardSpent => _expenses
      .where((e) => e.cardType == CardType.credit)
      .fold(0.0, (sum, item) => sum + item.amount);

  double get debitCardSpent => _expenses
      .where((e) => e.cardType == CardType.debit)
      .fold(0.0, (sum, item) => sum + item.amount);

  CategoryItem getCategoryById(String id) {
    return _categories.firstWhere(
      (c) => c.id == id,
      orElse: () => CategoryItem(
        id: id,
        name: id[0].toUpperCase() + id.substring(1),
        icon: Icons.tag,
        color: const Color(0xFF6366F1),
      ),
    );
  }

  List<Expense> get filteredExpenses {
    return _expenses.where((e) {
      if (_filterCardType != null && e.cardType != _filterCardType) {
        return false;
      }
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase().trim();
        final matchMerchant = e.merchant.toLowerCase().contains(q);
        final matchBank = e.bankName.toLowerCase().contains(q);
        final matchCategory = getCategoryById(e.category).name.toLowerCase().contains(q);
        final matchLast4 = e.cardLast4.contains(q);
        return matchMerchant || matchBank || matchCategory || matchLast4;
      }
      return true;
    }).toList();
  }

  Map<String, double> get categoryBreakdown {
    final Map<String, double> map = {};
    for (final exp in _expenses) {
      map[exp.category] = (map[exp.category] ?? 0.0) + exp.amount;
    }
    return map;
  }

  void setFilterCardType(CardType? type) {
    _filterCardType = type;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void updateExpenseCategory(String expenseId, String newCategoryId) {
    final index = _expenses.indexWhere((e) => e.id == expenseId);
    if (index != -1) {
      _expenses[index].category = newCategoryId;
      _expenses[index].isEdited = true;
      notifyListeners();
    }
  }

  String addCustomCategory(String name) {
    final id = 'cat_${name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '_')}_${DateTime.now().millisecondsSinceEpoch % 1000}';
    final colors = [
      const Color(0xFF06B6D4),
      const Color(0xFF14B8A6),
      const Color(0xFFF59E0B),
      const Color(0xFFEC4899),
      const Color(0xFF8B5CF6),
      const Color(0xFF6366F1),
    ];
    final color = colors[_categories.length % colors.length];

    _categories.add(CategoryItem(
      id: id,
      name: name,
      icon: Icons.label,
      color: color,
    ));
    notifyListeners();
    return id;
  }

  bool addSimulatedSms(String sender, String body) {
    final smsId = 'sms-${DateTime.now().millisecondsSinceEpoch}';
    final now = DateTime.now();

    final isOtp = SmsParserService.isOtpMessage(body);
    final parsed = SmsParserService.parseMessage(sender, body, smsId, now);

    final status = isOtp
        ? 'otp'
        : (parsed != null ? 'parsed' : 'skipped');

    final bankCode = parsed?.bankCode ?? 'OTHER';

    _smsList.insert(
      0,
      SmsMessageItem(
        id: smsId,
        sender: sender,
        bankCode: bankCode,
        receivedAt: now,
        body: body,
        status: status,
      ),
    );

    if (parsed != null) {
      _expenses.insert(0, parsed);
      notifyListeners();
      return true;
    }

    notifyListeners();
    return false;
  }
}
