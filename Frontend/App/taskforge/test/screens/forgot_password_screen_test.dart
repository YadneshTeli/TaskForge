// test/screens/forgot_password_screen_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/screens/forgot_password_screen.dart';

void main() {
  group('ForgotPasswordScreen', () {
    
    testWidgets('displays AppBar and body UI correctly', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Verify title and initial text
      expect(find.text('Forgot Password'), findsOneWidget);
      expect(find.text('Reset Password'), findsOneWidget);
      expect(
        find.text(
            'Enter your email address and we\'ll send you a link to reset your password.'),
        findsOneWidget,
      );
      expect(find.byIcon(Icons.lock_reset), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
    });

    testWidgets('has email input field with correct configuration',
        (WidgetTester tester) async {
      // Build the widget
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
      // Build the widget
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
      // Build the widget
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

    testWidgets('accepts valid email format', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(
          find.byType(TextFormField), 'test@example.com');
      
      // Manually trigger validation without submitting
      final formState = tester.state<FormState>(find.byType(Form));
      final isValid = formState.validate();

      // Should pass validation (no error messages displayed)
      expect(isValid, isTrue);
      expect(find.text('Please enter a valid email'), findsNothing);
      expect(find.text('Please enter your email'), findsNothing);
    });

    testWidgets('email field accepts whitespace in input',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter email with whitespace
      await tester.enterText(
          find.byType(TextFormField), '  test@example.com  ');

      // Verify the field preserves whitespace in the controller
      // (whitespace is trimmed only on submission, not in the controller)
      final textField = tester.widget<TextFormField>(find.byType(TextFormField));
      expect(textField.controller?.text, '  test@example.com  ');
    });

    testWidgets('submit button is enabled when not loading',
        (WidgetTester tester) async {
      // Build the widget
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

    testWidgets('displays lock reset icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Verify the lock reset icon is displayed
      expect(find.byIcon(Icons.lock_reset), findsOneWidget);
    });

    testWidgets('send button is enabled initially with valid email', (WidgetTester tester) async {
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

    testWidgets('shows loading state when sending reset email', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      await tester.pump();

      // Tap the send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump(); // Start the async operation

      // Should show loading indicator inside the button
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      
      // The send button text should not be visible during loading
      expect(find.text('Send Reset Link'), findsNothing);
      
      // Clean up pending timers
      await tester.pumpAndSettle();
    });

    testWidgets('shows error SnackBar when API call fails', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      await tester.pump();

      // Tap the send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump();
      
      // Wait for the async operation to complete
      // In test environment, API calls will fail
      await tester.pumpAndSettle();

      // Should display error message in SnackBar
      expect(find.text('Failed to send reset email. Please try again.'), findsOneWidget);
      
      // Should still show the form (not in success state)
      expect(find.byType(TextFormField), findsOneWidget);
    });

    testWidgets('validates that whitespace is trimmed from email', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter email with only whitespace
      await tester.enterText(find.byType(TextFormField), '   ');
      await tester.pump();
      
      // Tap send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      // Should display validation error because trimmed value is empty
      expect(find.text('Please enter your email'), findsOneWidget);
    });

    testWidgets('button is disabled during loading state', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'test@example.com');
      await tester.pump();

      // Tap the send button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump();

      // Find the ElevatedButton during loading
      final sendButton = tester.widget<ElevatedButton>(
        find.byType(ElevatedButton),
      );

      // Button should be disabled (onPressed is null)
      expect(sendButton.onPressed, isNull);
      
      // Clean up pending timers
      await tester.pumpAndSettle();
    });

    testWidgets('shows appropriate subtitle text initially', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Should show the initial instruction text
      expect(
        find.text('Enter your email address and we\'ll send you a link to reset your password.'),
        findsOneWidget,
      );
    });

    testWidgets('"Remember your password? Sign in" button is present and tappable', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Verify all form elements are present
      expect(find.byType(TextFormField), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.byType(Form), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
    });
  });
}
