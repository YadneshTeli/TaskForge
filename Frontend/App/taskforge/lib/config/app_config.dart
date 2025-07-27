// lib/config/app_config.dart
class AppConfig {
  static const String appName = 'TaskForge';
  static const String appVersion = '1.0.0';
  
  // Environment configurations
  static const bool isDevelopment = true;
  static const bool isProduction = false;
  
  // API Configuration
  static const String baseUrl = isDevelopment 
      ? 'http://localhost:4000'
      : 'https://api.taskforge.com';
  
  static const String apiUrl = '$baseUrl/api';
  static const String graphqlUrl = '$baseUrl/graphql';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String settingsKey = 'app_settings';
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Initialize app configuration
  static void init() {
    // Perform any initialization logic here
    // This could include setting up logging, analytics, etc.
  }
}
