import 'package:flutter/material.dart';

enum CardType { credit, debit }

class Expense {
  final String id;
  final String smsId;
  final double amount;
  final String currency;
  final String merchant;
  String category;
  final CardType cardType;
  final String bankName;
  final String bankCode;
  final String cardLast4;
  final DateTime date;
  final String rawSms;
  bool isEdited;

  Expense({
    required this.id,
    required this.smsId,
    required this.amount,
    this.currency = '₹',
    required this.merchant,
    required this.category,
    required this.cardType,
    required this.bankName,
    required this.bankCode,
    required this.cardLast4,
    required this.date,
    required this.rawSms,
    this.isEdited = false,
  });
}

class SmsMessageItem {
  final String id;
  final String sender;
  final String bankCode;
  final DateTime receivedAt;
  final String body;
  final String status; // 'parsed', 'otp', 'skipped'
  final bool isRead;

  SmsMessageItem({
    required this.id,
    required this.sender,
    required this.bankCode,
    required this.receivedAt,
    required this.body,
    required this.status,
    this.isRead = true,
  });
}

class CardAccount {
  final String id;
  final String bankName;
  final String bankCode;
  final CardType cardType;
  final String last4;
  final double? availableBalance;
  final double? totalLimit;
  final String cardHolder;
  final List<Color> gradientColors;

  CardAccount({
    required this.id,
    required this.bankName,
    required this.bankCode,
    required this.cardType,
    required this.last4,
    this.availableBalance,
    this.totalLimit,
    this.cardHolder = 'PRIMARY USER',
    required this.gradientColors,
  });
}

class CategoryItem {
  final String id;
  final String name;
  final IconData icon;
  final Color color;

  CategoryItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
  });
}
