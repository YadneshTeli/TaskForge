import 'package:dio/dio.dart';
import '../api/rest_client.dart';

class AuthService {
  static Future<Response> login(String email, String password) async {
    return await RestClient.dio.post(
      '/auth/login',
      data: {"email": email, "password": password},
    );
  }

  static Future<Response> register(
    String email,
    String password,
    String username,
  ) async {
    return await RestClient.dio.post(
      '/auth/register',
      data: {"email": email, "password": password, "username": username},
    );
  }
}
