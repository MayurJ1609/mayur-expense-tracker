import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/expense.dart';
import '../providers/expense_provider.dart';
import '../widgets/category_edit_sheet.dart';
import '../widgets/simulate_sms_dialog.dart';

class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExpenseProvider>();
    final currencyFormat = NumberFormat.currency(symbol: '₹', decimalDigits: 0);
    final dateFormat = DateFormat('dd MMM, hh:mm a');

    final expenses = provider.filteredExpenses;
    final filteredTotal = expenses.fold(0.0, (sum, e) => sum + e.amount);

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Parsed Expenses',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_comment, color: Color(0xFF818CF8)),
            onPressed: () => SimulateSmsDialog.show(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter header
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0B1120),
            child: Column(
              children: [
                TextField(
                  onChanged: provider.setSearchQuery,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Search merchant, bank, category, or card #...',
                    hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF818CF8), size: 20),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    FilterChip(
                      label: Text('All (${provider.expenses.length})'),
                      selected: provider.filterCardType == null,
                      onSelected: (_) => provider.setFilterCardType(null),
                      selectedColor: const Color(0xFF6366F1).withOpacity(0.3),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        color: provider.filterCardType == null ? Colors.white : Colors.grey.shade400,
                        fontWeight: provider.filterCardType == null ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(
                        color: provider.filterCardType == null ? const Color(0xFF6366F1) : Colors.transparent,
                      ),
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      avatar: const Icon(Icons.credit_card, size: 14, color: Color(0xFF818CF8)),
                      label: const Text('Credit Card'),
                      selected: provider.filterCardType == CardType.credit,
                      onSelected: (_) => provider.setFilterCardType(CardType.credit),
                      selectedColor: const Color(0xFF6366F1).withOpacity(0.3),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        color: provider.filterCardType == CardType.credit ? Colors.white : Colors.grey.shade400,
                        fontWeight: provider.filterCardType == CardType.credit ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(
                        color: provider.filterCardType == CardType.credit ? const Color(0xFF6366F1) : Colors.transparent,
                      ),
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      avatar: const Icon(Icons.account_balance_wallet, size: 14, color: Color(0xFF34D399)),
                      label: const Text('Debit Card'),
                      selected: provider.filterCardType == CardType.debit,
                      onSelected: (_) => provider.setFilterCardType(CardType.debit),
                      selectedColor: const Color(0xFF10B981).withOpacity(0.3),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        color: provider.filterCardType == CardType.debit ? Colors.white : Colors.grey.shade400,
                        fontWeight: provider.filterCardType == CardType.debit ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(
                        color: provider.filterCardType == CardType.debit ? const Color(0xFF10B981) : Colors.transparent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Showing ${expenses.length} results',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                    ),
                    Text(
                      'Total: ${currencyFormat.format(filteredTotal)}',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Expenses List
          Expanded(
            child: expenses.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_long, size: 48, color: Colors.white24),
                        const SizedBox(height: 12),
                        const Text(
                          'No expenses found',
                          style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Try clearing search or simulate an SMS',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Simulate Bank SMS'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () => SimulateSmsDialog.show(context),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: expenses.length,
                    itemBuilder: (context, index) {
                      final exp = expenses[index];
                      final cat = provider.getCategoryById(exp.category);
                      final isCredit = exp.cardType == CardType.credit;

                      return Card(
                        color: const Color(0xFF0F172A),
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(color: Colors.white10),
                        ),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () => CategoryEditSheet.show(context, exp),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: cat.color.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(cat.icon, color: cat.color, size: 20),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            exp.merchant,
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${exp.bankName}  •  ${isCredit ? 'Credit' : 'Debit'} **${exp.cardLast4}',
                                            style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          '${exp.currency}${exp.amount.toStringAsFixed(0)}',
                                          style: const TextStyle(
                                            fontSize: 17,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: isCredit
                                                ? const Color(0xFF6366F1).withOpacity(0.2)
                                                : const Color(0xFF10B981).withOpacity(0.2),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            isCredit ? 'CREDIT' : 'DEBIT',
                                            style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w700,
                                              color: isCredit ? const Color(0xFF818CF8) : const Color(0xFF34D399),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                const Divider(color: Colors.white10, height: 1),
                                const SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time, size: 12, color: Colors.white38),
                                        const SizedBox(width: 4),
                                        Text(
                                          dateFormat.format(exp.date),
                                          style: const TextStyle(fontSize: 11, color: Colors.white38),
                                        ),
                                      ],
                                    ),
                                    GestureDetector(
                                      onTap: () => CategoryEditSheet.show(context, exp),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: cat.color.withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: cat.color.withOpacity(0.4)),
                                        ),
                                        child: Row(
                                          children: [
                                            Text(
                                              cat.name,
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: cat.color,
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            Icon(Icons.edit, size: 11, color: cat.color),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
