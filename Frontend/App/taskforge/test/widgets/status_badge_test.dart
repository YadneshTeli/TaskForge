// test/widgets/status_badge_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/models/task.dart';
import 'package:taskforge/widgets/status_badge.dart';

void main() {
  group('StatusBadge', () {
    testWidgets('displays todo status correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(status: TaskStatus.todo),
          ),
        ),
      );

      expect(find.text('To Do'), findsOneWidget);
      expect(find.byIcon(Icons.circle_outlined), findsOneWidget);
    });

    testWidgets('displays in_progress status correctly',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(status: TaskStatus.in_progress),
          ),
        ),
      );

      expect(find.text('In Progress'), findsOneWidget);
      expect(find.byIcon(Icons.refresh), findsOneWidget);
    });

    testWidgets('displays done status correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(status: TaskStatus.done),
          ),
        ),
      );

      expect(find.text('Done'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });

    testWidgets('hides label when showLabel is false',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(
              status: TaskStatus.todo,
              showLabel: false,
            ),
          ),
        ),
      );

      expect(find.text('To Do'), findsNothing);
      expect(find.byIcon(Icons.circle_outlined), findsOneWidget);
    });

    testWidgets('displays correct colors for todo status',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(status: TaskStatus.todo),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.circle_outlined));
      expect(icon.color, Colors.grey);
    });

    testWidgets('displays correct colors for in_progress status',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(status: TaskStatus.in_progress),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.refresh));
      expect(icon.color, Colors.blue);
    });

    testWidgets('displays correct colors for done status',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StatusBadge(status: TaskStatus.done),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.check_circle));
      expect(icon.color, Colors.green);
    });
  });

  group('PriorityBadge', () {
    testWidgets('displays low priority correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(priority: TaskPriority.low),
          ),
        ),
      );

      expect(find.text('Low'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_downward), findsOneWidget);
    });

    testWidgets('displays medium priority correctly',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(priority: TaskPriority.medium),
          ),
        ),
      );

      expect(find.text('Medium'), findsOneWidget);
      expect(find.byIcon(Icons.drag_handle), findsOneWidget);
    });

    testWidgets('displays high priority correctly',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(priority: TaskPriority.high),
          ),
        ),
      );

      expect(find.text('High'), findsOneWidget);
      expect(find.byIcon(Icons.priority_high), findsOneWidget);
    });

    testWidgets('hides label when showLabel is false',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(
              priority: TaskPriority.low,
              showLabel: false,
            ),
          ),
        ),
      );

      expect(find.text('Low'), findsNothing);
      expect(find.byIcon(Icons.arrow_downward), findsOneWidget);
    });

    testWidgets('displays correct colors for low priority',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(priority: TaskPriority.low),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.arrow_downward));
      expect(icon.color, Colors.green);
    });

    testWidgets('displays correct colors for medium priority',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(priority: TaskPriority.medium),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.drag_handle));
      expect(icon.color, Colors.orange);
    });

    testWidgets('displays correct colors for high priority',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PriorityBadge(priority: TaskPriority.high),
          ),
        ),
      );

      final icon = tester.widget<Icon>(find.byIcon(Icons.priority_high));
      expect(icon.color, Colors.red);
    });
  });
}
