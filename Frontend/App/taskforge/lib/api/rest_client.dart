import 'package:dio/dio.dart';
import '../utils/constants.dart';

class RestClient {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
      headers: {"Content-Type": "application/json"},
    ),
  );

  static Dio get dio => _dio;
}
