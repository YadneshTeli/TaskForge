import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../utils/constants.dart';

class GQL {
  static final _storage = const FlutterSecureStorage();
  static ValueNotifier<GraphQLClient>? _client;

  static ValueNotifier<GraphQLClient> get client {
    if (_client == null) {
      throw Exception('GraphQL client not initialized. Call initClient() first.');
    }
    return _client!;
  }

  static Future<ValueNotifier<GraphQLClient>> initClient() async {
    await initHiveForFlutter();

    final httpLink = HttpLink(ApiConstants.graphqlUrl);

    final authLink = AuthLink(
      getToken: () async {
        final token = await _storage.read(key: 'access_token');
        return token != null ? 'Bearer $token' : null;
      },
    );

    final link = authLink.concat(httpLink);

    final GraphQLCache cache = GraphQLCache(
      store: HiveStore(),
    );

    _client = ValueNotifier<GraphQLClient>(
      GraphQLClient(
        cache: cache,
        link: link,
      ),
    );

    return _client!;
  }

  static void disposeClient() {
    _client?.dispose();
    _client = null;
  }
}

// GraphQL Queries
class GraphQLQueries {
  static const String getTasks = '''
    query GetTasks(\$projectId: ID) {
      tasks(projectId: \$projectId) {
        id
        title
        description
        status
        priority
        projectId
        assignedTo {
          id
          username
          email
          firstName
          lastName
        }
        dueDate
        createdAt
        updatedAt
        attachments
        comments {
          user {
            id
            username
            email
            firstName
            lastName
          }
          text
          createdAt
        }
      }
    }
  ''';

  static const String getProjects = '''
    query GetProjects {
      projects {
        id
        name
        description
        owner {
          id
          username
          email
          firstName
          lastName
        }
        members {
          id
          username
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  ''';

  static const String getTaskMetrics = '''
    query GetTaskMetrics(\$taskId: ID!) {
      taskMetrics(taskId: \$taskId) {
        taskId
        title
        status
        timeSpent
        priority
        createdAt
        updatedAt
        completedAt
        dueDate
        assignee {
          id
          username
          email
          firstName
          lastName
        }
      }
    }
  ''';

  static const String getUserStats = '''
    query GetUserStats(\$userId: ID!) {
      userStats(userId: \$userId) {
        userId
        totalTasks
        completedTasks
        pendingTasks
        overdueTasks
        averageCompletionTime
        productivityScore
        lastActiveAt
        createdAt
        updatedAt
      }
    }
  ''';

  static const String getProjectAnalytics = '''
    query GetProjectAnalytics(\$projectId: ID!) {
      projectAnalytics(projectId: \$projectId) {
        projectId
        totalTasks
        completedTasks
        pendingTasks
        overdueTasks
        averageCompletionTime
        teamProductivity
        createdAt
        updatedAt
      }
    }
  ''';
}

// GraphQL Mutations
class GraphQLMutations {
  static const String createTask = '''
    mutation CreateTask(\$input: CreateTaskInput!) {
      createTask(input: \$input) {
        id
        title
        description
        status
        priority
        projectId
        assignedTo {
          id
          username
          email
          firstName
          lastName
        }
        dueDate
        createdAt
        updatedAt
        attachments
        comments {
          user {
            id
            username
            email
            firstName
            lastName
          }
          text
          createdAt
        }
      }
    }
  ''';

  static const String updateTask = '''
    mutation UpdateTask(\$id: ID!, \$input: UpdateTaskInput!) {
      updateTask(id: \$id, input: \$input) {
        id
        title
        description
        status
        priority
        projectId
        assignedTo {
          id
          username
          email
          firstName
          lastName
        }
        dueDate
        createdAt
        updatedAt
        attachments
        comments {
          user {
            id
            username
            email
            firstName
            lastName
          }
          text
          createdAt
        }
      }
    }
  ''';

  static const String deleteTask = '''
    mutation DeleteTask(\$id: ID!) {
      deleteTask(id: \$id)
    }
  ''';

  static const String createProject = '''
    mutation CreateProject(\$input: CreateProjectInput!) {
      createProject(input: \$input) {
        id
        name
        description
        owner {
          id
          username
          email
          firstName
          lastName
        }
        members {
          id
          username
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  ''';

  static const String updateProject = '''
    mutation UpdateProject(\$id: ID!, \$input: UpdateProjectInput!) {
      updateProject(id: \$id, input: \$input) {
        id
        name
        description
        owner {
          id
          username
          email
          firstName
          lastName
        }
        members {
          id
          username
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  ''';

  static const String deleteProject = '''
    mutation DeleteProject(\$id: ID!) {
      deleteProject(id: \$id)
    }
  ''';

  static const String addComment = '''
    mutation AddComment(\$taskId: ID!, \$text: String!) {
      addComment(taskId: \$taskId, text: \$text) {
        id
        title
        description
        status
        priority
        projectId
        assignedTo {
          id
          username
          email
          firstName
          lastName
        }
        dueDate
        createdAt
        updatedAt
        attachments
        comments {
          user {
            id
            username
            email
            firstName
            lastName
          }
          text
          createdAt
        }
      }
    }
  ''';
}
