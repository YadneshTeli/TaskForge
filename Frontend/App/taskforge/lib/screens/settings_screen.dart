// lib/screens/settings_screen.dart
import 'package:flutter/material.dart';
import '../services/user_settings_service.dart';
import '../widgets/index.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isLoading = true;
  Map<String, dynamic> _settings = {};
  Map<String, dynamic> _notificationPrefs = {};
  
  // Settings values
  String _theme = 'system';
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _inAppNotifications = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final settings = await UserSettingsService.getSettings();
      final prefs = await UserSettingsService.getNotificationPreferences();
      
      setState(() {
        _settings = settings['settings'] ?? {};
        _notificationPrefs = prefs['preferences'] ?? {};
        
        // Extract values
        _theme = _settings['theme'] ?? 'system';
        _emailNotifications = _notificationPrefs['email'] ?? true;
        _pushNotifications = _notificationPrefs['push'] ?? true;
        _inAppNotifications = _notificationPrefs['inApp'] ?? true;
        
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading settings: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load settings. Please try again.')),
        );
      }
    }
  }

  Future<void> _updateTheme(String theme) async {
    try {
      await UserSettingsService.updateSettings({'theme': theme});
      setState(() {
        _theme = theme;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Theme updated successfully')),
        );
      }
    } catch (e) {
      debugPrint('Error updating theme: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update theme. Please try again.')),
        );
      }
    }
  }

  Future<void> _updateNotificationPreferences() async {
    try {
      await UserSettingsService.updateNotificationPreferences({
        'email': _emailNotifications,
        'push': _pushNotifications,
        'inApp': _inAppNotifications,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notification preferences updated')),
        );
      }
    } catch (e) {
      debugPrint('Error updating notification preferences: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update preferences. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Settings')),
        body: const LoadingWidget(
          message: 'Loading settings...',
          showMessage: true,
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          // Appearance Section
          _buildSectionHeader('Appearance'),
          ListTile(
            leading: const Icon(Icons.palette_outlined),
            title: const Text('Theme'),
            subtitle: Text(_theme.toUpperCase()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showThemeDialog(),
          ),
          const Divider(),
          
          // Notifications Section
          _buildSectionHeader('Notifications'),
          SwitchListTile(
            secondary: const Icon(Icons.email_outlined),
            title: const Text('Email Notifications'),
            subtitle: const Text('Receive notifications via email'),
            value: _emailNotifications,
            onChanged: (value) {
              setState(() {
                _emailNotifications = value;
              });
              _updateNotificationPreferences();
            },
          ),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_outlined),
            title: const Text('Push Notifications'),
            subtitle: const Text('Receive push notifications on your device'),
            value: _pushNotifications,
            onChanged: (value) {
              setState(() {
                _pushNotifications = value;
              });
              _updateNotificationPreferences();
            },
          ),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_active_outlined),
            title: const Text('In-App Notifications'),
            subtitle: const Text('Show notifications within the app'),
            value: _inAppNotifications,
            onChanged: (value) {
              setState(() {
                _inAppNotifications = value;
              });
              _updateNotificationPreferences();
            },
          ),
          const Divider(),
          
          // Account Section
          _buildSectionHeader('Account'),
          ListTile(
            leading: const Icon(Icons.security_outlined),
            title: const Text('Security'),
            subtitle: const Text('Password and authentication settings'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Security settings coming soon')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy'),
            subtitle: const Text('Data and privacy settings'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Privacy settings coming soon')),
              );
            },
          ),
          const Divider(),
          
          // About Section
          _buildSectionHeader('About'),
          ListTile(
            leading: const Icon(Icons.info_outlined),
            title: const Text('App Version'),
            subtitle: const Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('Help & Support'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Help coming soon')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Theme.of(context).primaryColor,
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }

  void _showThemeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('Light'),
              value: 'light',
              groupValue: _theme,
              onChanged: (value) {
                if (value != null) {
                  Navigator.of(context).pop();
                  _updateTheme(value);
                }
              },
            ),
            RadioListTile<String>(
              title: const Text('Dark'),
              value: 'dark',
              groupValue: _theme,
              onChanged: (value) {
                if (value != null) {
                  Navigator.of(context).pop();
                  _updateTheme(value);
                }
              },
            ),
            RadioListTile<String>(
              title: const Text('System Default'),
              value: 'system',
              groupValue: _theme,
              onChanged: (value) {
                if (value != null) {
                  Navigator.of(context).pop();
                  _updateTheme(value);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
