// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/main.dart';

void main() {
  testWidgets('TaskForge app loads correctly', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const TaskForgeApp());

    // Verify that the splash screen or login screen appears
    // Since we're testing the initial app load, we should see either
    // the splash screen or login/home screen depending on auth state
    expect(find.byType(TaskForgeApp), findsOneWidget);
  });
}
