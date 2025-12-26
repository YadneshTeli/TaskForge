// test/widgets/user_avatar_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/models/user.dart';
import 'package:taskforge/widgets/user_avatar.dart';

void main() {
  group('UserAvatar _getInitials edge cases', () {
    testWidgets('handles name with multiple consecutive spaces',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: 'John  Smith'),
          ),
        ),
      );

      // Should display 'JS' initials
      expect(find.text('JS'), findsOneWidget);
    });

    testWidgets('handles name with leading and trailing whitespace',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: '  Jane Doe  '),
          ),
        ),
      );

      // Should display 'JD' initials
      expect(find.text('JD'), findsOneWidget);
    });

    testWidgets('handles single character name with spaces',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: ' J '),
          ),
        ),
      );

      // Should display 'J' initial
      expect(find.text('J'), findsOneWidget);
    });

    testWidgets('handles name with only spaces', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: '   '),
          ),
        ),
      );

      // Should display '?' fallback
      expect(find.text('?'), findsOneWidget);
    });

    testWidgets('handles empty string name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: ''),
          ),
        ),
      );

      // Should display '?' fallback
      expect(find.text('?'), findsOneWidget);
    });

    testWidgets('handles null name and null user', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(),
          ),
        ),
      );

      // Should display '?' fallback
      expect(find.text('?'), findsOneWidget);
    });

    testWidgets('handles single word name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: 'Madonna'),
          ),
        ),
      );

      // Should display 'M' initial
      expect(find.text('M'), findsOneWidget);
    });

    testWidgets('handles three-word name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(name: 'John Paul Smith'),
          ),
        ),
      );

      // Should display first two initials 'JP'
      expect(find.text('JP'), findsOneWidget);
    });

    testWidgets('handles user with fullName', (WidgetTester tester) async {
      final user = User(
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        fullName: 'Test User',
        isActive: true,
        isOnline: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(user: user),
          ),
        ),
      );

      // Should display 'TU' initials from fullName
      expect(find.text('TU'), findsOneWidget);
    });

    testWidgets('handles user without fullName (uses username)',
        (WidgetTester tester) async {
      final user = User(
        id: '1',
        email: 'test@example.com',
        username: 'johndoe',
        role: 'user',
        fullName: null,
        isActive: true,
        isOnline: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(user: user),
          ),
        ),
      );

      // Should display 'J' initial from username
      expect(find.text('J'), findsOneWidget);
    });

    testWidgets('handles user with empty username and no fullName',
        (WidgetTester tester) async {
      final user = User(
        id: '1',
        email: 'test@example.com',
        username: '',
        role: 'user',
        fullName: null,
        isActive: true,
        isOnline: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(user: user),
          ),
        ),
      );

      // Should display '?' fallback when initials cannot be determined
      expect(find.text('?'), findsOneWidget);
    });

    testWidgets('handles user with spaces in fullName',
        (WidgetTester tester) async {
      final user = User(
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        fullName: '  Alice   Bob  ',
        isActive: true,
        isOnline: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(user: user),
          ),
        ),
      );

      // Should display 'AB' initials
      expect(find.text('AB'), findsOneWidget);
    });

    testWidgets('displays CircleAvatar with correct properties',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(
              name: 'Test User',
              radius: 30,
            ),
          ),
        ),
      );

      // Should find a CircleAvatar widget
      expect(find.byType(CircleAvatar), findsOneWidget);

      // Should display initials
      expect(find.text('TU'), findsOneWidget);
    });

    testWidgets('uses custom backgroundColor when provided',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatar(
              name: 'Test User',
              backgroundColor: Colors.red,
            ),
          ),
        ),
      );

      // Find the CircleAvatar
      final circleAvatar = tester.widget<CircleAvatar>(
        find.byType(CircleAvatar),
      );

      // Should use the custom color
      expect(circleAvatar.backgroundColor, Colors.red);
    });
  });

  group('UserAvatarWithName', () {
    testWidgets('displays user avatar and name', (WidgetTester tester) async {
      final user = User(
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        fullName: 'Test User',
        isActive: true,
        isOnline: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatarWithName(user: user),
          ),
        ),
      );

      // Should display the full name
      expect(find.text('Test User'), findsOneWidget);
      // Should display the email
      expect(find.text('test@example.com'), findsOneWidget);
      // Should display the avatar
      expect(find.byType(UserAvatar), findsOneWidget);
    });

    testWidgets('displays username when fullName is null',
        (WidgetTester tester) async {
      final user = User(
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        fullName: null,
        isActive: true,
        isOnline: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: UserAvatarWithName(user: user),
          ),
        ),
      );

      // Should display the username
      expect(find.text('testuser'), findsOneWidget);
    });
  });
}
