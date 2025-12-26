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

      // Should display the main UI elements
      // Note: 'Reset Password' is the body heading, 'Forgot Password' is the AppBar title
      expect(find.text('Reset Password'), findsOneWidget); // Body heading
      expect(find.text('Forgot Password'), findsOneWidget); // AppBar title
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

      // Verify the "Remember your password? Sign in" button exists
      final signInButton = find.text('Remember your password? Sign in');
      expect(signInButton, findsOneWidget);

      // Verify it's a TextButton (which calls Navigator.pop when tapped)
      expect(
        find.ancestor(
          of: signInButton,
          matching: find.byType(TextButton),
        ),
        findsOneWidget,
      );
    });

    // Note: Tests for the success state UI (when _emailSent is true) require mocking
    // AuthService.requestPasswordReset. While mocktail is available in test_helpers.dart,
    // the current architecture uses static methods in AuthService, which cannot be mocked
    // directly without significant refactoring.
    //
    // To enable success state testing, consider one of these approaches:
    //
    // 1. Refactor ForgotPasswordScreen to accept an injectable AuthService:
    //    - Create an abstract AuthService interface
    //    - Modify the screen to accept an optional AuthService parameter
    //    - Use dependency injection or service locator pattern
    //
    // 2. Add a test-only constructor that accepts a callback:
    //    ```dart
    //    class ForgotPasswordScreen extends StatefulWidget {
    //      final Future<void> Function(String)? onPasswordResetRequest;
    //      const ForgotPasswordScreen({super.key, this.onPasswordResetRequest});
    //    }
    //    ```
    //
    // 3. Use integration tests with a test server that can return success responses
    //
    // Success state UI elements that would need testing with proper mocking:
    // - Success message container with green styling (line 158-177 in implementation)
    // - "Email sent to..." text display showing the entered email
    // - "Back to Login" OutlinedButton that calls Navigator.pop()
    // - "Send Another Email" TextButton that resets _emailSent to false
    // - Subtitle text changes to success message
    // - Form fields are hidden when in success state
    //
    // Example test structure if dependency injection were implemented:
    // ```dart
    // testWidgets('displays success UI after successful email send', (tester) async {
    //   final mockAuthService = MockAuthService();
    //   when(() => mockAuthService.requestPasswordReset(any()))
    //       .thenAnswer((_) async => Future.value());
    //   
    //   await tester.pumpWidget(MaterialApp(
    //     home: ForgotPasswordScreen(authService: mockAuthService),
    //   ));
    //   
    //   await tester.enterText(find.byType(TextFormField), 'test@example.com');
    //   await tester.tap(find.text('Send Reset Link'));
    //   await tester.pumpAndSettle();
    //   
    //   expect(find.text('Email sent to test@example.com'), findsOneWidget);
    //   expect(find.text('Back to Login'), findsOneWidget);
    //   expect(find.text('Send Another Email'), findsOneWidget);
    // });
    // ```
  });
}
