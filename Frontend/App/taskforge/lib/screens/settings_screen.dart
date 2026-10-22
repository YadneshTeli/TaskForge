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

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _loadSettings() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final settings = await UserSettingsService.getSettings();
      final prefs = await UserSettingsService.getNotificationPreferences();
      
      if (!mounted) return;
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
        _showSnackBar('Failed to load settings. Please try again.');
      }
    }
  }

  Future<void> _updateTheme(String theme) async {
    try {
      await UserSettingsService.updateSettings({'theme': theme});
      if (!mounted) return;
      setState(() {
        _theme = theme;
      });
      _showSnackBar('Theme updated successfully');
    } catch (e) {
      debugPrint('Error updating theme: $e');
      _showSnackBar('Failed to update theme. Please try again.');
    }
  }

  Future<void> _updateNotificationPreferences() async {
    try {
      await UserSettingsService.updateNotificationPreferences({
        'email': _emailNotifications,
        'push': _pushNotifications,
        'inApp': _inAppNotifications,
      });
      _showSnackBar('Notification preferences updated');
    } catch (e) {
      debugPrint('Failed to update notification preferences: $e');
      _showSnackBar('Failed to update notification preferences. Please try again.');
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
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
            leading: const Icon(Icons.palette_outlined),
            title: const Text('Theme'),
            subtitle: Text(_theme.toUpperCase()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showThemeDialog(),
          ),
          const Divider(height: 1),
          
          // Notifications Section
          _buildSectionHeader('Notifications'),
          SwitchListTile(
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
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
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
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
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
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
          const Divider(height: 1),
          
          // Account Section
          _buildSectionHeader('Account'),
          ListTile(
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
            leading: const Icon(Icons.security_outlined),
            title: const Text('Security'),
            subtitle: const Text('Password and authentication settings'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              _showSnackBar('Security settings coming soon');
            },
          ),
          ListTile(
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy'),
            subtitle: const Text('Data and privacy settings'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              _showSnackBar('Privacy settings coming soon');
            },
          ),
          const Divider(height: 1),
          
          // About Section
          _buildSectionHeader('About'),
          const ListTile(
            dense: true,
            visualDensity: VisualDensity(vertical: -2),
            leading: Icon(Icons.info_outlined),
            title: Text('App Version'),
            subtitle: Text('1.0.0'),
          ),
          ListTile(
            dense: true,
            visualDensity: const VisualDensity(vertical: -2),
            leading: const Icon(Icons.help_outline),
            title: const Text('Help & Support'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              _showSnackBar('Help coming soon');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 2),
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
              title: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _theme == 'light'
                    ? () {
                        Navigator.of(context).pop();
                        _updateTheme('light');
                      }
                    : null,
                child: const Text('Light'),
              ),
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
              title: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _theme == 'dark'
                    ? () {
                        Navigator.of(context).pop();
                        _updateTheme('dark');
                      }
                    : null,
                child: const Text('Dark'),
              ),
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
              title: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _theme == 'system'
                    ? () {
                        Navigator.of(context).pop();
                        _updateTheme('system');
                      }
                    : null,
                child: const Text('System Default'),
              ),
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
