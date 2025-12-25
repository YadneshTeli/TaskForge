// test/widgets/loading_widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/widgets/loading_widget.dart';

void main() {
  group('LoadingWidget', () {
    testWidgets('displays CircularProgressIndicator',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingWidget(),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('does not show message when showMessage is false',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingWidget(
              message: 'Loading data...',
              showMessage: false,
            ),
          ),
        ),
      );

      expect(find.text('Loading data...'), findsNothing);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows message when showMessage is true',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingWidget(
              message: 'Loading data...',
              showMessage: true,
            ),
          ),
        ),
      );

      expect(find.text('Loading data...'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('centers content on screen', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingWidget(),
          ),
        ),
      );

      final center = tester.widget<Center>(find.byType(Center));
      expect(center, isNotNull);
    });
  });

  group('LoadingOverlay', () {
    testWidgets('displays child widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(
              isLoading: false,
              child: Text('Child Widget'),
            ),
          ),
        ),
      );

      expect(find.text('Child Widget'), findsOneWidget);
    });

    testWidgets('does not show overlay when isLoading is false',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(
              isLoading: false,
              child: Text('Child Widget'),
            ),
          ),
        ),
      );

      expect(find.byType(LoadingWidget), findsNothing);
      expect(find.text('Child Widget'), findsOneWidget);
    });

    testWidgets('shows overlay when isLoading is true',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(
              isLoading: true,
              child: Text('Child Widget'),
            ),
          ),
        ),
      );

      expect(find.byType(LoadingWidget), findsOneWidget);
      expect(find.text('Child Widget'), findsOneWidget);
    });

    testWidgets('shows message in overlay when provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(
              isLoading: true,
              message: 'Please wait...',
              child: Text('Child Widget'),
            ),
          ),
        ),
      );

      expect(find.text('Please wait...'), findsOneWidget);
      expect(find.byType(LoadingWidget), findsOneWidget);
    });

    testWidgets('uses Stack to overlay loading indicator',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(
              isLoading: true,
              child: Text('Child Widget'),
            ),
          ),
        ),
      );

      expect(find.byType(Stack), findsOneWidget);
    });
  });
}
