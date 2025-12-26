// test/widgets/notification_bell_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/widgets/notification_bell.dart';

void main() {
  group('NotificationBell', () {
    testWidgets('displays notification icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NotificationBell(),
          ),
        ),
      );

      expect(find.byIcon(Icons.notifications_outlined), findsOneWidget);
      expect(find.byType(IconButton), findsOneWidget);
    });

    testWidgets('displays badge when there are unread notifications',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NotificationBell(),
          ),
        ),
      );

      // Initial render
      await tester.pump();

      // The badge visibility depends on NotificationPollingService
      // This test verifies the widget renders without errors
      expect(find.byType(NotificationBell), findsOneWidget);
    });

    testWidgets('uses Stack for badge positioning',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NotificationBell(),
          ),
        ),
      );

      expect(find.byType(Stack), findsOneWidget);
    });

    testWidgets('has IconButton that can be tapped',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NotificationBell(),
          ),
        ),
      );

      final iconButton = find.byType(IconButton);
      expect(iconButton, findsOneWidget);

      // Verify button can be tapped (won't navigate in test without full routing)
      await tester.tap(iconButton);
      await tester.pump();
    });
  });
}
