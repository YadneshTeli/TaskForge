// lib/services/project_service.dart
import 'dart:io';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../api/graphql_client.dart';
import '../api/rest_client.dart';
import '../models/project.dart';

class ProjectService {
  static final GraphQLClient _graphQLClient = GQL.client.value;

  // GraphQL operations for main CRUD
  static Future<List<Project>> getProjects() async {
    final QueryOptions options = QueryOptions(
      document: gql(GraphQLQueries.getProjects),
      fetchPolicy: FetchPolicy.cacheAndNetwork,
    );

    final QueryResult result = await _graphQLClient.query(options);

    if (result.hasException) {
      throw Exception('Failed to fetch projects: ${result.exception.toString()}');
    }

    final List<dynamic> projectsData = result.data?['projects'] ?? [];
    return projectsData.map((projectJson) => Project.fromJson(projectJson)).toList();
  }

  static Future<Project> createProject(CreateProjectInput input) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.createProject),
      variables: {'input': input.toJson()},
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to create project: ${result.exception.toString()}');
    }

    return Project.fromJson(result.data?['createProject']);
  }

  static Future<Project> updateProject(String id, Map<String, dynamic> updates) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.updateProject),
      variables: {
        'id': id,
        'input': updates,
      },
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to update project: ${result.exception.toString()}');
    }

    return Project.fromJson(result.data?['updateProject']);
  }

  static Future<bool> deleteProject(String id) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.deleteProject),
      variables: {'id': id},
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to delete project: ${result.exception.toString()}');
    }

    return result.data?['deleteProject'] == true;
  }

  // Analytics operations using GraphQL (Prisma data)
  static Future<ProjectAnalytics?> getProjectAnalytics(String projectId) async {
    final QueryOptions options = QueryOptions(
      document: gql(GraphQLQueries.getProjectAnalytics),
      variables: {'projectId': projectId},
      fetchPolicy: FetchPolicy.cacheAndNetwork,
    );

    final QueryResult result = await _graphQLClient.query(options);

    if (result.hasException) {
      throw Exception('Failed to fetch project analytics: ${result.exception.toString()}');
    }

    final analyticsData = result.data?['projectAnalytics'];
    return analyticsData != null ? ProjectAnalytics.fromJson(analyticsData) : null;
  }

  // File operations using REST API
  static Future<Map<String, dynamic>> exportProject(String projectId) async {
    try {
      return await RestClient.exportProject(projectId);
    } catch (e) {
      throw Exception('Failed to export project: $e');
    }
  }

  static Future<Map<String, dynamic>> importProject(File file) async {
    try {
      return await RestClient.importProject(file);
    } catch (e) {
      throw Exception('Failed to import project: $e');
    }
  }

  // Real-time updates using Stream
  static Stream<List<Project>> watchProjects() {
    final WatchQueryOptions options = WatchQueryOptions(
      document: gql(GraphQLQueries.getProjects),
      fetchPolicy: FetchPolicy.cacheAndNetwork,
      pollInterval: const Duration(seconds: 60), // Poll every minute
    );

    final ObservableQuery observableQuery = _graphQLClient.watchQuery(options);
    
    return observableQuery.stream.map((result) {
      if (result.hasException) {
        throw Exception('Failed to watch projects: ${result.exception.toString()}');
      }

      final List<dynamic> projectsData = result.data?['projects'] ?? [];
      return projectsData.map((projectJson) => Project.fromJson(projectJson)).toList();
    });
  }

  // Offline support
  static Future<List<Project>> getCachedProjects() async {
    final QueryOptions options = QueryOptions(
      document: gql(GraphQLQueries.getProjects),
      fetchPolicy: FetchPolicy.cacheOnly,
    );

    final QueryResult result = await _graphQLClient.query(options);

    if (result.hasException || result.data == null) {
      return [];
    }

    final List<dynamic> projectsData = result.data?['projects'] ?? [];
    return projectsData.map((projectJson) => Project.fromJson(projectJson)).toList();
  }

  // Project member management
  static Future<Project> addMember(String projectId, String userId) async {
    return await updateProject(projectId, {
      'addMemberIds': [userId],
    });
  }

  static Future<Project> removeMember(String projectId, String userId) async {
    return await updateProject(projectId, {
      'removeMemberIds': [userId],
    });
  }

  static Future<Project> updateProjectRole(String projectId, String userId, String role) async {
    return await updateProject(projectId, {
      'memberRoles': {userId: role},
    });
  }
}
