import 'package:flutter/foundation.dart';

class ApiConstants {
  // Override at build/run time via --dart-define=API_HOST=<ip> or --dart-define=API_BASE_URL=<url>
  static const String _envHost = String.fromEnvironment('API_HOST');
  static const String _envPort = String.fromEnvironment(
    'API_PORT',
    defaultValue: '4000',
  );
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _envGraphqlUrl = String.fromEnvironment('GRAPHQL_URL');

  static String get _resolvedHost {
    if (_envHost.isNotEmpty) {
      return _envHost;
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      // Android emulator maps 10.0.2.2 to the host machine's loopback interface
      return '10.0.2.2';
    }
    return 'localhost';
  }

  static String get baseUrl => _envBaseUrl.isNotEmpty
      ? _envBaseUrl
      : 'http://$_resolvedHost:$_envPort/api';

  static String get graphqlUrl => _envGraphqlUrl.isNotEmpty
      ? _envGraphqlUrl
      : 'http://$_resolvedHost:$_envPort/graphql';
}
