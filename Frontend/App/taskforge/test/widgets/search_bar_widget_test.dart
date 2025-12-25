// test/widgets/search_bar_widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/widgets/search_bar_widget.dart';

void main() {
  group('SearchBarWidget', () {
    testWidgets('displays hint text', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {},
              hintText: 'Search tasks...',
            ),
          ),
        ),
      );

      expect(find.text('Search tasks...'), findsOneWidget);
    });

    testWidgets('displays default hint text when not provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {},
            ),
          ),
        ),
      );

      expect(find.text('Search...'), findsOneWidget);
    });

    testWidgets('displays search icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.search), findsOneWidget);
    });

    testWidgets('shows clear button when text is entered',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {},
            ),
          ),
        ),
      );

      // Initially no clear button
      expect(find.byIcon(Icons.clear), findsNothing);

      // Enter text
      await tester.enterText(find.byType(TextField), 'test');
      await tester.pump();

      // Clear button should appear
      expect(find.byIcon(Icons.clear), findsOneWidget);
    });

    testWidgets('clears text when clear button is tapped',
        (WidgetTester tester) async {
      String searchQuery = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {
                searchQuery = query;
              },
            ),
          ),
        ),
      );

      // Enter text
      await tester.enterText(find.byType(TextField), 'test');
      await tester.pump();

      // Tap clear button
      await tester.tap(find.byIcon(Icons.clear));
      await tester.pump();

      // Text should be cleared
      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.controller?.text, isEmpty);
      expect(searchQuery, isEmpty);
    });

    testWidgets('calls onSearch with debounce', (WidgetTester tester) async {
      String? searchedQuery;
      int callCount = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {
                searchedQuery = query;
                callCount++;
              },
              debounceTime: const Duration(milliseconds: 300),
            ),
          ),
        ),
      );

      // Enter text
      await tester.enterText(find.byType(TextField), 't');
      await tester.pump();

      // Should not call immediately
      expect(callCount, 0);

      // Wait for debounce
      await tester.pump(const Duration(milliseconds: 300));

      // Should call after debounce
      expect(callCount, 1);
      expect(searchedQuery, 't');
    });

    testWidgets('calls onClear when provided', (WidgetTester tester) async {
      bool onClearCalled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {},
              onClear: () {
                onClearCalled = true;
              },
            ),
          ),
        ),
      );

      // Enter text
      await tester.enterText(find.byType(TextField), 'test');
      await tester.pump();

      // Tap clear button
      await tester.tap(find.byIcon(Icons.clear));
      await tester.pump();

      expect(onClearCalled, true);
    });

    testWidgets('accepts text input', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {},
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'search query');
      await tester.pump();

      expect(find.text('search query'), findsOneWidget);
    });

    testWidgets('debounces multiple rapid changes', (WidgetTester tester) async {
      int callCount = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SearchBarWidget(
              onSearch: (query) {
                callCount++;
              },
              debounceTime: const Duration(milliseconds: 500),
            ),
          ),
        ),
      );

      // Enter text multiple times rapidly
      await tester.enterText(find.byType(TextField), 'a');
      await tester.pump(const Duration(milliseconds: 100));
      
      await tester.enterText(find.byType(TextField), 'ab');
      await tester.pump(const Duration(milliseconds: 100));
      
      await tester.enterText(find.byType(TextField), 'abc');
      await tester.pump(const Duration(milliseconds: 100));

      // Should not have called yet
      expect(callCount, 0);

      // Wait for debounce
      await tester.pump(const Duration(milliseconds: 500));

      // Should only call once
      expect(callCount, 1);
    });
  });
}
