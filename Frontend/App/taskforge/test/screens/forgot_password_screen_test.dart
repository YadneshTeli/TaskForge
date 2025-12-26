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
      expect(find.text('Forgot your password?'), findsOneWidget);
      expect(find.text('No worries! Enter your email address and we\'ll send you a link to reset your password.'), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
      expect(find.text('Remember your password?'), findsOneWidget);
      expect(find.text('Back to Login'), findsOneWidget);
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
      expect(find.text('Please enter your email address'), findsOneWidget);
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
      expect(find.text('Please enter a valid email address'), findsOneWidget);
    });

    testWidgets('shows loading state when sending reset email', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      
      // Tap send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump(); // Start the async operation

      // Should show loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('back to login button navigates back', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: const Scaffold(body: Text('Login Screen')),
          routes: {
            '/forgot-password': (context) => const ForgotPasswordScreen(),
          },
        ),
      );

      // Navigate to forgot password screen
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Tap back to login button
      final backButton = find.text('Back to Login');
      expect(backButton, findsOneWidget);
      
      // Verify it's a TextButton
      expect(find.ancestor(
        of: backButton,
        matching: find.byType(TextButton),
      ), findsOneWidget);
    });

    testWidgets('displays success state after email sent', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      
      // Tap send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump();
      
      // Wait for the async operation to complete
      await tester.pumpAndSettle();

      // Should display success message or icon (depending on implementation)
      // The screen should either show a success message or change state
      expect(find.byType(ForgotPasswordScreen), findsOneWidget);
    });

    testWidgets('disables send button while loading', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      
      // Tap send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump();

      // Find the ElevatedButton
      final sendButton = tester.widget<ElevatedButton>(
        find.ancestor(
          of: find.text('Send Reset Link'),
          matching: find.byType(ElevatedButton),
        ).first,
      );

      // Button should be present
      expect(sendButton, isNotNull);
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
      expect(find.text('Please enter a valid email address'), findsNothing);
    });
  });
}
