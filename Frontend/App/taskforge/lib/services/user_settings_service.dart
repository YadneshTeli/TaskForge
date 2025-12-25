// lib/services/user_settings_service.dart
import '../api/rest_client.dart';

class UserSettingsService {
  /// Get user settings
  static Future<Map<String, dynamic>> getSettings() async {
    try {
      final response = await RestClient.dio.get('/api/user/settings');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get settings: ${e.toString()}');
    }
  }

  /// Update user settings
  static Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> settings) async {
    try {
      final response = await RestClient.dio.put(
        '/api/user/settings',
        data: settings,
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to update settings: ${e.toString()}');
    }
  }

  /// Get notification preferences
  static Future<Map<String, dynamic>> getNotificationPreferences() async {
    try {
      final response = await RestClient.dio.get('/api/user/notification-preferences');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get notification preferences: ${e.toString()}');
    }
  }

  /// Update notification preferences
  static Future<Map<String, dynamic>> updateNotificationPreferences(
    Map<String, dynamic> preferences,
  ) async {
    try {
      final response = await RestClient.dio.put(
        '/api/user/notification-preferences',
        data: preferences,
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to update notification preferences: ${e.toString()}');
    }
  }

  /// Get user statistics
  static Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await RestClient.dio.get('/api/user/stats');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get user stats: ${e.toString()}');
    }
  }

  /// Get onboarding status
  static Future<Map<String, dynamic>> getOnboardingStatus() async {
    try {
      final response = await RestClient.dio.get('/api/user/onboarding-status');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get onboarding status: ${e.toString()}');
    }
  }

  /// Complete onboarding
  static Future<Map<String, dynamic>> completeOnboarding(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await RestClient.dio.post(
        '/api/user/complete-onboarding',
        data: data,
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to complete onboarding: ${e.toString()}');
    }
  }

  /// Search users
  static Future<List<dynamic>> searchUsers(String query) async {
    try {
      final response = await RestClient.dio.get(
        '/api/user/search',
        queryParameters: {'q': query},
      );
      return response.data['users'] as List<dynamic>;
    } catch (e) {
      throw Exception('Failed to search users: ${e.toString()}');
    }
  }

  /// Invite user
  static Future<Map<String, dynamic>> inviteUser({
    required String email,
    String? role,
    String? projectId,
  }) async {
    try {
      final response = await RestClient.dio.post(
        '/api/user/invite',
        data: {
          'email': email,
          if (role != null) 'role': role,
          if (projectId != null) 'projectId': projectId,
        },
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to invite user: ${e.toString()}');
    }
  }
}
