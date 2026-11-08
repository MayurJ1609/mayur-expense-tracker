import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/expense_provider.dart';

class SimulateSmsDialog extends StatefulWidget {
  const SimulateSmsDialog({super.key});

  static void show(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const SimulateSmsDialog(),
    );
  }

  @override
  State<SimulateSmsDialog> createState() => _SimulateSmsDialogState();
}

class _SimulateSmsDialogState extends State<SimulateSmsDialog> {
  final _senderController = TextEditingController(text: 'AD-HDFCBK');
  final _bodyController = TextEditingController(
    text: 'Rs 1,850.00 spent on your HDFC Bank Credit Card xx4291 at STARBUCKS on today. Avail limit: Rs 1,46,700.00.',
  );

  final List<Map<String, String>> _templates = [
    {
      'label': '☕ Starbucks (Credit Card)',
      'sender': 'AD-HDFCBK',
      'body': 'Rs 1,850.00 spent on your HDFC Bank Credit Card xx4291 at STARBUCKS on today. Avail limit: Rs 1,46,700.00.',
    },
    {
      'label': '🛒 DMart (Debit Card)',
      'sender': 'VK-SBIINB',
      'body': 'Alert: INR 2,650.00 debited from SBI Debit Card ending 8821 at DMART SUPERMARKET. Avl Bal: INR 39,470.00.',
    },
    {
      'label': '🍔 Swiggy (Debit Card)',
      'sender': 'VK-SBIINB',
      'body': 'INR 620.00 debited from SBI Debit Card ending 8821 for transaction at SWIGGY. Avl Bal: INR 38,850.00.',
    },
    {
      'label': '🛍️ Amazon (Credit Card)',
      'sender': 'AX-AXISBK',
      'body': 'Axis Bank Credit Card xx6634 was used for INR 3,499.00 at AMAZON RETAIL on today. Available limit: INR 91,301.00.',
    },
    {
      'label': '🔐 OTP Login (Non-Expense)',
      'sender': 'AD-HDFCBK',
      'body': 'OTP for HDFC Bank NetBanking login is 948201. Valid for 10 mins. Do not share with anyone.',
    },
  ];

  @override
  void dispose() {
    _senderController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF0F172A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.sms, color: Color(0xFF818CF8), size: 20),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Simulate Bank SMS',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white60, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'QUICK PRESETS',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                  color: Color(0xFF94A3B8),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: _templates.map((tpl) {
                  return ActionChip(
                    label: Text(tpl['label']!),
                    labelStyle: const TextStyle(fontSize: 11, color: Colors.white),
                    backgroundColor: const Color(0xFF1E293B),
                    side: const BorderSide(color: Colors.white12),
                    onPressed: () {
                      setState(() {
                        _senderController.text = tpl['sender']!;
                        _bodyController.text = tpl['body']!;
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              const Text(
                'SENDER ID',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                  color: Color(0xFF94A3B8),
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _senderController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'SMS TEXT BODY',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                  color: Color(0xFF94A3B8),
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _bodyController,
                maxLines: 4,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.flash_on, size: 18),
                  label: const Text('Parse & Add Expense'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () {
                    final sender = _senderController.text.trim();
                    final body = _bodyController.text.trim();
                    if (body.isEmpty) return;

                    final provider = context.read<ExpenseProvider>();
                    final wasExpense = provider.addSimulatedSms(sender, body);

                    Navigator.pop(context);

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: wasExpense ? const Color(0xFF059669) : const Color(0xFFD97706),
                        content: Row(
                          children: [
                            Icon(
                              wasExpense ? Icons.check_circle : Icons.info,
                              color: Colors.white,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                wasExpense
                                    ? 'SMS parsed! New expense recorded.'
                                    : 'Non-expense or OTP SMS recorded.',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
