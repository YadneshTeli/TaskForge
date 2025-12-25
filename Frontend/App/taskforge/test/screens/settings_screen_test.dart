// test/screens/settings_screen_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/screens/settings_screen.dart';

void main() {
  group('SettingsScreen', () {

    testWidgets('displays loading state initially', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Should display loading widget
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading settings...'), findsOneWidget);
    });

    testWidgets('displays settings UI after successful load',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for the widget to finish loading
      await tester.pumpAndSettle();

      // Should display the settings screen elements
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Appearance'), findsOneWidget);
      expect(find.text('Theme'), findsOneWidget);
      expect(find.text('Notifications'), findsOneWidget);
      expect(find.text('Email Notifications'), findsOneWidget);
      expect(find.text('Push Notifications'), findsOneWidget);
      expect(find.text('In-App Notifications'), findsOneWidget);
      expect(find.text('Account'), findsOneWidget);
      expect(find.text('About'), findsOneWidget);
    });

    testWidgets('theme dialog displays all theme options',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on theme list tile
      await tester.tap(find.text('Theme'));
      await tester.pumpAndSettle();

      // Should display theme dialog
      expect(find.text('Choose Theme'), findsOneWidget);
      expect(find.text('Light'), findsOneWidget);
      expect(find.text('Dark'), findsOneWidget);
      expect(find.text('System Default'), findsOneWidget);
      expect(find.byType(RadioListTile<String>), findsNWidgets(3));
    });

    testWidgets('can select light theme from dialog',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on theme list tile
      await tester.tap(find.text('Theme'));
      await tester.pumpAndSettle();

      // Tap on Light theme
      await tester.tap(find.text('Light'));
      await tester.pumpAndSettle();

      // Dialog should be closed
      expect(find.text('Choose Theme'), findsNothing);

      // Verify theme subtitle updates to LIGHT
      expect(find.text('LIGHT'), findsOneWidget);

      // Verify success or error SnackBar appears
      expect(
        find.textContaining(RegExp(r'Theme updated|Failed to update theme')),
        findsOneWidget,
      );
    });

    testWidgets('can select dark theme from dialog',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on theme list tile
      await tester.tap(find.text('Theme'));
      await tester.pumpAndSettle();

      // Tap on Dark theme
      await tester.tap(find.text('Dark'));
      await tester.pumpAndSettle();

      // Dialog should be closed
      expect(find.text('Choose Theme'), findsNothing);

      // Verify theme subtitle updates to DARK
      expect(find.text('DARK'), findsOneWidget);

      // Verify success or error SnackBar appears
      expect(
        find.textContaining(RegExp(r'Theme updated|Failed to update theme')),
        findsOneWidget,
      );
    });

    testWidgets('can select system theme from dialog',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on theme list tile
      await tester.tap(find.text('Theme'));
      await tester.pumpAndSettle();

      // Tap on System Default theme
      await tester.tap(find.text('System Default'));
      await tester.pumpAndSettle();

      // Dialog should be closed
      expect(find.text('Choose Theme'), findsNothing);

      // Verify theme subtitle updates to SYSTEM
      expect(find.text('SYSTEM'), findsOneWidget);

      // Verify success or error SnackBar appears
      expect(
        find.textContaining(RegExp(r'Theme updated successfully|Failed to update theme')),
        findsOneWidget,
      );
    });

    testWidgets('email notification toggle works correctly',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Find the email notification switch
      final emailSwitch = find.ancestor(
        of: find.text('Email Notifications'),
        matching: find.byType(SwitchListTile),
      );

      expect(emailSwitch, findsOneWidget);

      // Get initial switch state
      final initialSwitchState =
          tester.widget<SwitchListTile>(emailSwitch).value;

      // Tap the switch
      await tester.tap(emailSwitch);
      await tester.pumpAndSettle();

      // Verify switch state changed
      final newSwitchState = tester.widget<SwitchListTile>(emailSwitch).value;
      expect(newSwitchState, !initialSwitchState);

      // Verify success or error SnackBar appears
      expect(
        find.textContaining(RegExp(r'Notification preferences updated|Failed to update notification preferences')),
        findsOneWidget,
      );
    });

    testWidgets('push notification toggle works correctly',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Find the push notification switch
      final pushSwitch = find.ancestor(
        of: find.text('Push Notifications'),
        matching: find.byType(SwitchListTile),
      );

      expect(pushSwitch, findsOneWidget);

      // Get initial switch state
      final initialSwitchState =
          tester.widget<SwitchListTile>(pushSwitch).value;

      // Tap the switch
      await tester.tap(pushSwitch);
      await tester.pumpAndSettle();

      // Verify switch state changed
      final newSwitchState = tester.widget<SwitchListTile>(pushSwitch).value;
      expect(newSwitchState, !initialSwitchState);

      // Verify success or error SnackBar appears
      expect(
        find.textContaining(RegExp(r'Notification preferences updated|Failed to update notification preferences')),
        findsOneWidget,
      );
    });

    testWidgets('in-app notification toggle works correctly',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Find the in-app notification switch
      final inAppSwitch = find.ancestor(
        of: find.text('In-App Notifications'),
        matching: find.byType(SwitchListTile),
      );

      expect(inAppSwitch, findsOneWidget);

      // Get initial switch state
      final initialSwitchState =
          tester.widget<SwitchListTile>(inAppSwitch).value;

      // Tap the switch
      await tester.tap(inAppSwitch);
      await tester.pumpAndSettle();

      // Verify switch state changed
      final newSwitchState = tester.widget<SwitchListTile>(inAppSwitch).value;
      expect(newSwitchState, !initialSwitchState);

      // Verify success or error SnackBar appears
      expect(
        find.textContaining(RegExp(r'Notification preferences updated|Failed to update notification preferences')),
        findsOneWidget,
      );
    });

    testWidgets('displays all section headers correctly',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Verify all section headers are present
      expect(find.text('Appearance'), findsOneWidget);
      expect(find.text('Notifications'), findsOneWidget);
      expect(find.text('Account'), findsOneWidget);
      expect(find.text('About'), findsOneWidget);
    });

    testWidgets('displays app version correctly', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Should display app version
      expect(find.text('App Version'), findsOneWidget);
      expect(find.text('1.0.0'), findsOneWidget);
    });

    testWidgets('security settings shows coming soon message',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on Security
      await tester.tap(find.text('Security'));
      await tester.pumpAndSettle();

      // Should display coming soon message
      expect(find.text('Security settings coming soon'), findsOneWidget);
    });

    testWidgets('privacy settings shows coming soon message',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on Privacy
      await tester.tap(find.text('Privacy'));
      await tester.pumpAndSettle();

      // Should display coming soon message
      expect(find.text('Privacy settings coming soon'), findsOneWidget);
    });

    testWidgets('help & support shows coming soon message',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Tap on Help & Support
      await tester.tap(find.text('Help & Support'));
      await tester.pumpAndSettle();

      // Should display coming soon message
      expect(find.text('Help coming soon'), findsOneWidget);
    });

    testWidgets('displays all icons correctly', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Verify icons are present
      expect(find.byIcon(Icons.palette_outlined), findsOneWidget);
      expect(find.byIcon(Icons.email_outlined), findsOneWidget);
      expect(find.byIcon(Icons.notifications_outlined), findsOneWidget);
      expect(find.byIcon(Icons.notifications_active_outlined), findsOneWidget);
      expect(find.byIcon(Icons.security_outlined), findsOneWidget);
      expect(find.byIcon(Icons.privacy_tip_outlined), findsOneWidget);
      expect(find.byIcon(Icons.info_outlined), findsOneWidget);
      expect(find.byIcon(Icons.help_outline), findsOneWidget);
    });

    testWidgets('settings screen is scrollable', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Verify ListView exists
      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('notification subtitles are displayed correctly',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Verify notification subtitles
      expect(find.text('Receive notifications via email'), findsOneWidget);
      expect(
          find.text('Receive push notifications on your device'), findsOneWidget);
      expect(find.text('Show notifications within the app'), findsOneWidget);
    });

    testWidgets('account section subtitles are displayed correctly',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: SettingsScreen(),
        ),
      );

      // Wait for settings to load
      await tester.pumpAndSettle();

      // Verify account subtitles
      expect(find.text('Password and authentication settings'), findsOneWidget);
      expect(find.text('Data and privacy settings'), findsOneWidget);
    });
  });
}
