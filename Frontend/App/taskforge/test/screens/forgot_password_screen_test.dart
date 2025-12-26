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

      // Find email field
      final emailField = find.byType(TextFormField);
      expect(emailField, findsOneWidget);

      // Verify email icon
      expect(find.byIcon(Icons.email_outlined), findsOneWidget);
    });

    testWidgets('validates empty email', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Tap submit button without entering email
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
      await tester.enterText(find.byType(TextFormField), 'invalidemail');
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
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      // Should not display validation error for email format
      expect(find.text('Please enter a valid email'), findsNothing);
      expect(find.text('Please enter your email'), findsNothing);
    });

    testWidgets('shows loading state when submitting',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(
          find.byType(TextFormField), 'test@example.com');

      // Tap submit button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump(); // Start the async operation

      // Should display loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Send Reset Link'), findsNothing);
    });

    testWidgets('displays success message after sending email',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(
          find.byType(TextFormField), 'test@example.com');

      // Tap submit button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      // Should display success message (either snackbar or updated UI)
      // Note: Actual behavior depends on AuthService implementation
      final successText = find.textContaining(RegExp(
          r'Password reset email sent!|We\'ve sent you an email with instructions'));
      expect(successText, findsWidgets);
    });

    testWidgets('back button navigates back', (WidgetTester tester) async {
      // Build the widget with navigation
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => Center(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ForgotPasswordScreen(),
                      ),
                    );
                  },
                  child: const Text('Go to Forgot Password'),
                ),
              ),
            ),
          ),
        ),
      );

      // Navigate to ForgotPasswordScreen
      await tester.tap(find.text('Go to Forgot Password'));
      await tester.pumpAndSettle();

      // Verify we're on ForgotPasswordScreen
      expect(find.text('Forgot Password'), findsOneWidget);

      // Tap back button
      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();

      // Should navigate back
      expect(find.text('Go to Forgot Password'), findsOneWidget);
      expect(find.text('Forgot Password'), findsNothing);
    });

    testWidgets('email field has correct keyboard type',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Find email field
      final emailField = tester.widget<TextFormField>(find.byType(TextFormField));

      // Verify keyboard type is email
      expect(emailField.keyboardType, TextInputType.emailAddress);
    });

    testWidgets('email field autofocuses', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Find email field
      final emailField = tester.widget<TextFormField>(find.byType(TextFormField));

      // Verify autofocus is enabled
      expect(emailField.autofocus, true);
    });

    testWidgets('form has correct structure', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Verify form structure
      expect(find.byType(Form), findsOneWidget);
      expect(find.byType(SafeArea), findsOneWidget);
      expect(find.byType(SingleChildScrollView), findsOneWidget);
    });

    testWidgets('displays lock icon with correct size',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Find lock icon
      final iconFinder = find.byIcon(Icons.lock_reset);
      expect(iconFinder, findsOneWidget);

      // Verify icon size
      final icon = tester.widget<Icon>(iconFinder);
      expect(icon.size, 80);
    });

    testWidgets('button is disabled during loading',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: ForgotPasswordScreen(),
        ),
      );

      // Enter valid email
      await tester.enterText(
          find.byType(TextFormField), 'test@example.com');

      // Tap submit button
      await tester.tap(find.text('Send Reset Link'));
      await tester.pump(); // Start the async operation

      // Try to find and tap the button again (should be disabled)
      final button = tester.widget<ElevatedButton>(
          find.byType(ElevatedButton));
      expect(button.onPressed, isNull);
    });
  });
}
