// lib/services/graphql_service.dart
import 'package:graphql_flutter/graphql_flutter.dart';
import '../api/graphql_client.dart';

class GraphQLService {
  static GraphQLClient get client => GQL.client.value;
  
  static Future<void> init() async {
    await GQL.initClient();
  }
  
  static void dispose() {
    GQL.disposeClient();
  }
  
  // Common query method
  static Future<QueryResult> query(String query, {Map<String, dynamic>? variables}) async {
    final QueryOptions options = QueryOptions(
      document: gql(query),
      variables: variables ?? {},
      fetchPolicy: FetchPolicy.networkOnly,
    );
    
    return await client.query(options);
  }
  
  // Common mutation method
  static Future<QueryResult> mutation(String mutation, {Map<String, dynamic>? variables}) async {
    final MutationOptions options = MutationOptions(
      document: gql(mutation),
      variables: variables ?? {},
    );
    
    return await client.mutate(options);
  }
}
