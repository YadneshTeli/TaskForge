import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../utils/constants.dart';

class GQL {
  static final _storage = const FlutterSecureStorage();

  static Future<ValueNotifier<GraphQLClient>> initClient() async {
    final httpLink = HttpLink(ApiConstants.graphqlUrl);

    final authLink = AuthLink(
      getToken: () async {
        final token = await _storage.read(key: 'access_token');
        return token != null ? 'Bearer $token' : null;
      },
    );

    final link = authLink.concat(httpLink);

    return ValueNotifier(
      GraphQLClient(
        cache: GraphQLCache(store: InMemoryStore()),
        link: link,
      ),
    );
  }
}
