import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';
import '../models/user.dart';

class RestClient {
  static final Dio _dio = Dio();
  static const _storage = FlutterSecureStorage();
  static bool _initialized = false;

  static Dio get dio => _dio;

  static Future<void> init() async {
    if (_initialized) return;

    _dio.options.baseUrl = ApiConstants.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    _dio.options.headers = {"Content-Type": "application/json"};

    // Add interceptor for authentication
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired, redirect to login
          await _storage.delete(key: 'access_token');
          await _storage.delete(key: 'refresh_token');
        }
        handler.next(error);
      },
    ));

    _initialized = true;
  }

  // Auth endpoints
  static Future<Map<String, dynamic>> login(String email, String password) async {
    await init();
    try {
      final response = await _dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    await init();
    try {
      final response = await _dio.post('/api/auth/register', data: userData);
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<void> logout() async {
    await init();
    try {
      await _dio.post('/api/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
    }
  }

  static Future<Map<String, dynamic>> refreshToken() async {
    await init();
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      final response = await _dio.post('/api/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // User endpoints
  static Future<User> getCurrentUser() async {
    await init();
    try {
      final response = await _dio.get('/api/auth/me');
      return User.fromJson(response.data['user']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<User> updateProfile(Map<String, dynamic> userData) async {
    await init();
    try {
      final response = await _dio.put('/api/auth/profile', data: userData);
      return User.fromJson(response.data['user']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // File upload endpoints
  static Future<Map<String, dynamic>> uploadFile(File file) async {
    await init();
    try {
      String fileName = file.path.split('/').last;
      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _dio.post('/api/upload', data: formData);
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<List<Map<String, dynamic>>> uploadMultipleFiles(List<File> files) async {
    await init();
    try {
      FormData formData = FormData();
      
      for (File file in files) {
        String fileName = file.path.split('/').last;
        formData.files.add(MapEntry(
          'files',
          await MultipartFile.fromFile(file.path, filename: fileName),
        ));
      }

      final response = await _dio.post('/api/upload/multiple', data: formData);
      return List<Map<String, dynamic>>.from(response.data['files']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Project REST endpoints (for file operations and admin tasks)
  static Future<Map<String, dynamic>> exportProject(String projectId) async {
    await init();
    try {
      final response = await _dio.get('/api/projects/$projectId/export');
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> importProject(File file) async {
    await init();
    try {
      String fileName = file.path.split('/').last;
      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _dio.post('/api/projects/import', data: formData);
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Report endpoints
  static Future<Map<String, dynamic>> generateReport(String type, {
    String? projectId,
    String? userId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    await init();
    try {
      final response = await _dio.post('/api/reports/generate', data: {
        'type': type,
        'projectId': projectId,
        'userId': userId,
        'startDate': startDate?.toIso8601String(),
        'endDate': endDate?.toIso8601String(),
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<List<Map<String, dynamic>>> getReports() async {
    await init();
    try {
      final response = await _dio.get('/api/reports');
      return List<Map<String, dynamic>>.from(response.data['reports']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Admin endpoints
  static Future<Map<String, dynamic>> getSystemStats() async {
    await init();
    try {
      final response = await _dio.get('/api/admin/stats');
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<List<Map<String, dynamic>>> getAllUsers() async {
    await init();
    try {
      final response = await _dio.get('/api/admin/users');
      return List<Map<String, dynamic>>.from(response.data['users']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> updateUserRole(String userId, String role) async {
    await init();
    try {
      final response = await _dio.put('/api/admin/users/$userId/role', data: {
        'role': role,
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Error handling
  static Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('Connection timeout. Please check your internet connection.');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = error.response?.data?['message'] ?? 'Server error occurred';
          return Exception('Server error ($statusCode): $message');
        case DioExceptionType.cancel:
          return Exception('Request was cancelled');
        case DioExceptionType.unknown:
          return Exception('Network error. Please check your internet connection.');
        default:
          return Exception('An unexpected error occurred');
      }
    }
    return Exception('An unexpected error occurred: $error');
  }
}
