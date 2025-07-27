import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/rest_client.dart';
import '../api/graphql_client.dart';
import '../models/user.dart';

class AuthService {
  static const _storage = FlutterSecureStorage();
  static User? _currentUser;

  static User? get currentUser => _currentUser;
  static bool get isLoggedIn => _currentUser != null;

  // Login with email and password
  static Future<User> login(String email, String password) async {
    try {
      final response = await RestClient.login(email, password);
      
      // Store tokens
      await _storage.write(key: 'access_token', value: response['token']);
      if (response['refreshToken'] != null) {
        await _storage.write(key: 'refresh_token', value: response['refreshToken']);
      }
      
      // Store user data
      _currentUser = User.fromJson(response['user']);
      await _storage.write(key: 'user_data', value: jsonEncode(_currentUser!.toJson()));
      
      // Initialize GraphQL client after login
      await GQL.initClient();
      
      return _currentUser!;
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  // Register new user
  static Future<User> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String username,
  }) async {
    try {
      final userData = {
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        'username': username,
      };
      
      final response = await RestClient.register(userData);
      
      // Store tokens
      await _storage.write(key: 'access_token', value: response['token']);
      if (response['refreshToken'] != null) {
        await _storage.write(key: 'refresh_token', value: response['refreshToken']);
      }
      
      // Store user data
      _currentUser = User.fromJson(response['user']);
      await _storage.write(key: 'user_data', value: jsonEncode(_currentUser!.toJson()));
      
      // Initialize GraphQL client after registration
      await GQL.initClient();
      
      return _currentUser!;
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  // Logout
  static Future<void> logout() async {
    try {
      await RestClient.logout();
    } catch (e) {
      // Ignore logout errors from server
    } finally {
      // Clear local data
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
      await _storage.delete(key: 'user_data');
      _currentUser = null;
      
      // Dispose GraphQL client
      GQL.disposeClient();
    }
  }

  // Check if user is already logged in (auto-login)
  static Future<bool> checkAuthStatus() async {
    try {
      final token = await _storage.read(key: 'access_token');
      final userData = await _storage.read(key: 'user_data');
      
      if (token != null && userData != null) {
        // Try to get current user from server to validate token
        try {
          _currentUser = await RestClient.getCurrentUser();
          await GQL.initClient();
          return true;
        } catch (e) {
          // Token is invalid, try to refresh
          try {
            await refreshToken();
            return true;
          } catch (refreshError) {
            // Refresh failed, clear stored data
            await logout();
            return false;
          }
        }
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }

  // Refresh access token
  static Future<void> refreshToken() async {
    try {
      final response = await RestClient.refreshToken();
      
      // Update stored tokens
      await _storage.write(key: 'access_token', value: response['token']);
      if (response['refreshToken'] != null) {
        await _storage.write(key: 'refresh_token', value: response['refreshToken']);
      }
      
      // Update user data if provided
      if (response['user'] != null) {
        _currentUser = User.fromJson(response['user']);
        await _storage.write(key: 'user_data', value: jsonEncode(_currentUser!.toJson()));
      }
    } catch (e) {
      throw Exception('Token refresh failed: $e');
    }
  }

  // Update user profile
  static Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? email,
  }) async {
    try {
      final updates = <String, dynamic>{};
      if (firstName != null) updates['firstName'] = firstName;
      if (lastName != null) updates['lastName'] = lastName;
      if (username != null) updates['username'] = username;
      if (email != null) updates['email'] = email;
      
      _currentUser = await RestClient.updateProfile(updates);
      await _storage.write(key: 'user_data', value: jsonEncode(_currentUser!.toJson()));
      
      return _currentUser!;
    } catch (e) {
      throw Exception('Profile update failed: $e');
    }
  }

  // Get current user from server
  static Future<User> getCurrentUser() async {
    try {
      _currentUser = await RestClient.getCurrentUser();
      await _storage.write(key: 'user_data', value: jsonEncode(_currentUser!.toJson()));
      return _currentUser!;
    } catch (e) {
      throw Exception('Failed to get current user: $e');
    }
  }

  // Change password
  static Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      await RestClient.dio.put('/api/auth/change-password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
    } catch (e) {
      throw Exception('Password change failed: $e');
    }
  }

  // Request password reset
  static Future<void> requestPasswordReset(String email) async {
    try {
      await RestClient.dio.post('/api/auth/forgot-password', data: {
        'email': email,
      });
    } catch (e) {
      throw Exception('Password reset request failed: $e');
    }
  }

  // Reset password with token
  static Future<void> resetPassword(String token, String newPassword) async {
    try {
      await RestClient.dio.post('/api/auth/reset-password', data: {
        'token': token,
        'newPassword': newPassword,
      });
    } catch (e) {
      throw Exception('Password reset failed: $e');
    }
  }
}
