// lib/services/task_service.dart
import 'dart:io';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../api/graphql_client.dart';
import '../api/rest_client.dart';
import '../models/task.dart';

class TaskService {
  // Lazy getter to safely access GraphQL client
  static GraphQLClient get _graphQLClient {
    try {
      return GQL.client.value;
    } catch (e) {
      throw Exception('GraphQL client not initialized. Ensure GQL.initClient() is called before using TaskService. Error: $e');
    }
  }

  // GraphQL operations for main CRUD
  static Future<List<Task>> getTasks({String? projectId}) async {
    final QueryOptions options = QueryOptions(
      document: gql(GraphQLQueries.getTasks),
      variables: {'projectId': projectId},
      fetchPolicy: FetchPolicy.cacheAndNetwork,
    );

    final QueryResult result = await _graphQLClient.query(options);

    if (result.hasException) {
      throw Exception('Failed to fetch tasks: ${result.exception.toString()}');
    }

    final List<dynamic> tasksData = result.data?['tasks'] ?? [];
    return tasksData.map((taskJson) => Task.fromJson(taskJson)).toList();
  }

  static Future<Task> createTask(CreateTaskInput input) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.createTask),
      variables: {'input': input.toJson()},
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to create task: ${result.exception.toString()}');
    }

    final taskData = result.data?['createTask'];
    if (taskData == null) {
      throw Exception('Failed to create task: No data returned from server');
    }

    return Task.fromJson(taskData);
  }

  static Future<Task> updateTask(String id, Map<String, dynamic> updates) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.updateTask),
      variables: {
        'id': id,
        'input': updates,
      },
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to update task: ${result.exception.toString()}');
    }

    final taskData = result.data?['updateTask'];
    if (taskData == null) {
      throw Exception('Failed to update task: No data returned from server');
    }

    return Task.fromJson(taskData);
  }

  static Future<bool> deleteTask(String id) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.deleteTask),
      variables: {'id': id},
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to delete task: ${result.exception.toString()}');
    }

    return result.data?['deleteTask'] == true;
  }

  static Future<Task> addComment(String taskId, String text) async {
    final MutationOptions options = MutationOptions(
      document: gql(GraphQLMutations.addComment),
      variables: {
        'taskId': taskId,
        'text': text,
      },
    );

    final QueryResult result = await _graphQLClient.mutate(options);

    if (result.hasException) {
      throw Exception('Failed to add comment: ${result.exception.toString()}');
    }

    final taskData = result.data?['addComment'];
    if (taskData == null) {
      throw Exception('Failed to add comment: No data returned from server');
    }

    return Task.fromJson(taskData);
  }

  // Analytics operations using GraphQL (Prisma data)
  static Future<TaskMetrics?> getTaskMetrics(String taskId) async {
    final QueryOptions options = QueryOptions(
      document: gql(GraphQLQueries.getTaskMetrics),
      variables: {'taskId': taskId},
      fetchPolicy: FetchPolicy.cacheAndNetwork,
    );

    final QueryResult result = await _graphQLClient.query(options);

    if (result.hasException) {
      throw Exception('Failed to fetch task metrics: ${result.exception.toString()}');
    }

    final taskMetricsData = result.data?['taskMetrics'];
    return taskMetricsData != null ? TaskMetrics.fromJson(taskMetricsData) : null;
  }

  // File operations using REST API
  static Future<List<String>> uploadTaskAttachments(String taskId, List<String> filePaths) async {
    try {
      if (filePaths.isEmpty) {
        return [];
      }

      final files = filePaths.map((path) => File(path)).toList();
      final uploadResults = await RestClient.uploadMultipleFiles(files);
      
      final attachmentUrls = uploadResults
          .map((result) => result['url'] as String?)
          .whereType<String>()
          .toList();
      
      if (attachmentUrls.isEmpty) {
        throw Exception('No valid file URLs returned from upload');
      }
      
      // Update task with new attachments via GraphQL
      final task = await updateTask(taskId, {
        'attachments': attachmentUrls,
      });
      
      return task.attachments;
    } catch (e) {
      throw Exception('Failed to upload attachments: $e');
    }
  }

  // Real-time updates using Stream
  static Stream<List<Task>> watchTasks({String? projectId}) {
    final WatchQueryOptions options = WatchQueryOptions(
      document: gql(GraphQLQueries.getTasks),
      variables: {'projectId': projectId},
      fetchPolicy: FetchPolicy.cacheAndNetwork,
      pollInterval: const Duration(seconds: 30), // Poll every 30 seconds
    );

    final ObservableQuery observableQuery = _graphQLClient.watchQuery(options);
    
    return observableQuery.stream.map((result) {
      if (result.hasException) {
        throw Exception('Failed to watch tasks: ${result.exception.toString()}');
      }

      final List<dynamic> tasksData = result.data?['tasks'] ?? [];
      return tasksData.map((taskJson) => Task.fromJson(taskJson)).toList();
    }).handleError((error) {
      // Handle stream errors gracefully
      throw Exception('Task stream error: $error');
    });
  }

  // Offline support with better error handling
  static Future<List<Task>> getCachedTasks({String? projectId}) async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(GraphQLQueries.getTasks),
        variables: {'projectId': projectId},
        fetchPolicy: FetchPolicy.cacheOnly,
      );

      final QueryResult result = await _graphQLClient.query(options);

      if (result.hasException || result.data == null) {
        // Return empty list instead of throwing when cache is empty
        return [];
      }

      final List<dynamic> tasksData = result.data?['tasks'] ?? [];
      return tasksData.map((taskJson) => Task.fromJson(taskJson)).toList();
    } catch (e) {
      // Log error but don't throw for cached data
      print('Warning: Failed to get cached tasks: $e');
      return [];
    }
  }

  // New method: Batch operations for better performance
  static Future<List<Task>> batchUpdateTasks(List<Map<String, dynamic>> updates) async {
    try {
      final List<Task> updatedTasks = [];
      
      for (final update in updates) {
        final taskId = update['id'] as String?;
        if (taskId != null) {
          final updatedTask = await updateTask(taskId, update);
          updatedTasks.add(updatedTask);
        }
      }
      
      return updatedTasks;
    } catch (e) {
      throw Exception('Failed to batch update tasks: $e');
    }
  }

  // New method: Enhanced error recovery
  static Future<List<Task>> getTasksWithRetry({
    String? projectId,
    int maxRetries = 3,
    Duration delay = const Duration(seconds: 1),
  }) async {
    int attempts = 0;
    Exception? lastException;

    while (attempts < maxRetries) {
      try {
        return await getTasks(projectId: projectId);
      } catch (e) {
        lastException = e is Exception ? e : Exception(e.toString());
        attempts++;
        
        if (attempts < maxRetries) {
          await Future.delayed(delay * attempts); // Exponential backoff
        }
      }
    }

    // If all retries failed, try to return cached data
    try {
      final cachedTasks = await getCachedTasks(projectId: projectId);
      if (cachedTasks.isNotEmpty) {
        return cachedTasks;
      }
    } catch (_) {
      // Ignore cache errors
    }

    throw lastException ?? Exception('Failed to fetch tasks after $maxRetries attempts');
  }
}
