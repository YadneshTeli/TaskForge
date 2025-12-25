// test/widgets/info_card_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/widgets/info_card.dart';

void main() {
  group('InfoCard', () {
    testWidgets('displays title, value, and icon',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: InfoCard(
              title: 'Total Tasks',
              value: '42',
              icon: Icons.task,
            ),
          ),
        ),
      );

      expect(find.text('Total Tasks'), findsOneWidget);
      expect(find.text('42'), findsOneWidget);
      expect(find.byIcon(Icons.task), findsOneWidget);
    });

    testWidgets('handles tap when onTap is provided',
        (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InfoCard(
              title: 'Total Tasks',
              value: '42',
              icon: Icons.task,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(InkWell));
      expect(tapped, true);
    });

    testWidgets('shows arrow icon when onTap is provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InfoCard(
              title: 'Total Tasks',
              value: '42',
              icon: Icons.task,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.arrow_forward_ios), findsOneWidget);
    });

    testWidgets('does not show arrow icon when onTap is null',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: InfoCard(
              title: 'Total Tasks',
              value: '42',
              icon: Icons.task,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.arrow_forward_ios), findsNothing);
    });

    testWidgets('uses custom color when provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: InfoCard(
              title: 'Total Tasks',
              value: '42',
              icon: Icons.task,
              color: Colors.red,
            ),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.task));
      expect(icon.color, Colors.red);
    });

    testWidgets('wraps content in Card widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: InfoCard(
              title: 'Total Tasks',
              value: '42',
              icon: Icons.task,
            ),
          ),
        ),
      );

      expect(find.byType(Card), findsOneWidget);
    });
  });

  group('StatCard', () {
    testWidgets('displays label, value, and icon',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatCard(
              label: 'Completed',
              value: '15',
              icon: Icons.check_circle,
              color: Colors.green,
            ),
          ),
        ),
      );

      expect(find.text('Completed'), findsOneWidget);
      expect(find.text('15'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });

    testWidgets('uses provided color for icon and value',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatCard(
              label: 'Completed',
              value: '15',
              icon: Icons.check_circle,
              color: Colors.green,
            ),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.check_circle));
      expect(icon.color, Colors.green);
    });

    testWidgets('uses Container with decoration', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatCard(
              label: 'Completed',
              value: '15',
              icon: Icons.check_circle,
              color: Colors.green,
            ),
          ),
        ),
      );

      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('displays different values and labels',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatCard(
              label: 'In Progress',
              value: '7',
              icon: Icons.sync,
              color: Colors.blue,
            ),
          ),
        ),
      );

      expect(find.text('In Progress'), findsOneWidget);
      expect(find.text('7'), findsOneWidget);
      expect(find.byIcon(Icons.sync), findsOneWidget);
    });
  });
}
