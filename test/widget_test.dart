import 'package:flutter_test/flutter_test.dart';
import 'package:spendtrack_sms/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SpendTrackApp());
    expect(find.text('SpendTrack SMS'), findsOneWidget);
  });
}
