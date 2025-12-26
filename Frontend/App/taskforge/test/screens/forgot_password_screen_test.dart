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

      // Find the submit button
      final button = tester.widget<ElevatedButton>(
          find.byType(ElevatedButton));
      
      // Button should be enabled initially (onPressed is not null)
      // because _isLoading is false by default
      expect(button.onPressed, isNotNull);
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

    testWidgets('displays all required form elements',
        (WidgetTester tester) async {
      // Build the widget
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
