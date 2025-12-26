// test/screens/forgot_password_screen_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/screens/forgot_password_screen.dart';

void main() {
  group('ForgotPasswordScreen', () {
    
    testWidgets('displays initial UI correctly', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Should display the main UI elements
      expect(find.text('Reset Password'), findsOneWidget);
      expect(find.text('Forgot Password'), findsOneWidget);
      expect(find.text('Enter your email address and we\'ll send you a link to reset your password.'), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
      expect(find.text('Remember your password? Sign in'), findsOneWidget);
    });

    testWidgets('has email text field with proper decoration', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Find the email text field
      final emailField = find.byType(TextFormField);
      expect(emailField, findsOneWidget);
      
      // Verify it has the email icon
      expect(find.byIcon(Icons.email_outlined), findsOneWidget);
    });

    testWidgets('validates empty email', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Tap the send button without entering email
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      // Should display validation error
      expect(find.text('Please enter your email'), findsOneWidget);
    });

    testWidgets('validates invalid email format', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter invalid email
      await tester.enterText(find.byType(TextFormField), 'invalid-email');
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      // Should display validation error
      expect(find.text('Please enter a valid email'), findsOneWidget);
    });

    testWidgets('back button is present in app bar', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Verify back button exists
      expect(find.byIcon(Icons.arrow_back), findsOneWidget);
    });

    testWidgets('form key is properly initialized', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Form should exist
      expect(find.byType(Form), findsOneWidget);
    });

    testWidgets('email controller is properly disposed', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter some text
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      
      // Remove the widget
      await tester.pumpWidget(const MaterialApp(home: Scaffold()));
      
      // No errors should occur from improper disposal
      expect(tester.takeException(), isNull);
    });

    testWidgets('trims whitespace from email input', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter email with whitespace
      await tester.enterText(find.byType(TextFormField), '  test@example.com  ');
      
      // Tap send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump();

      // Should not show validation error (whitespace is trimmed)
      await tester.pumpAndSettle();
      expect(find.text('Please enter a valid email'), findsNothing);
    });

    testWidgets('displays lock reset icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Verify the lock reset icon is displayed
      expect(find.byIcon(Icons.lock_reset), findsOneWidget);
    });

    testWidgets('send button is enabled initially', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      await tester.pump();

      // Find the ElevatedButton
      final sendButton = tester.widget<ElevatedButton>(
        find.ancestor(
          of: find.text('Send Reset Link'),
          matching: find.byType(ElevatedButton),
        ),
      );

      // Button should be present and enabled
      expect(sendButton.onPressed, isNotNull);
    });
  });
}
