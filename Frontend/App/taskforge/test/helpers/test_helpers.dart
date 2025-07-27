import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:taskforge/services/auth_service.dart';
import 'package:taskforge/services/task_service.dart';
import 'package:taskforge/services/project_service.dart';
import 'package:taskforge/models/user.dart';
import 'package:taskforge/models/task.dart';
import 'package:taskforge/models/project.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

// Mock Services
class MockAuthService extends Mock implements AuthService {}
class MockTaskService extends Mock implements TaskService {}
class MockProjectService extends Mock implements ProjectService {}
class MockGraphQLClient extends Mock implements GraphQLClient {}

// Test Data
final mockUser = User(
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  role: 'user',
  fullName: 'Test User',
  profilePicture: null,
  bio: null,
  isActive: true,
  isOnline: false,
  createdAt: DateTime.now(),
  updatedAt: DateTime.now(),
);

final mockTask = Task(
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.todo,
  priority: TaskPriority.medium,
  projectId: '1',
  assignedTo: mockUser,
  createdAt: DateTime.now(),
  updatedAt: DateTime.now(),
  dueDate: null,
  attachments: [],
  comments: [],
);

final mockProject = Project(
  id: '1',
  name: 'Test Project',
  description: 'Test Description',
  status: ProjectStatus.active,
  owner: mockUser,
  members: [mockUser],
  createdAt: DateTime.now(),
  updatedAt: DateTime.now(),
  attachments: [],
);

// Helper to setup test bindings
void setupTestBindings() {
  TestWidgetsFlutterBinding.ensureInitialized();
}

// Helper to register fallback values for mocktail
void registerFallbackValues() {
  registerFallbackValue(TaskStatus.todo);
  registerFallbackValue(TaskPriority.medium);
  registerFallbackValue(ProjectStatus.active);
}

// Helper to mock GraphQL client initialization
void setupMockGraphQLClient() {
  // Initialize a mock GraphQL client for testing
  final mockClient = MockGraphQLClient();
  
  // Mock successful responses
  when(() => mockClient.query(any())).thenAnswer(
    (_) async => QueryResult(
      source: QueryResultSource.network,
      data: {'mockData': 'test'},
      options: QueryOptions(document: gql('query { mockData }')),
    ),
  );
  
  when(() => mockClient.mutate(any())).thenAnswer(
    (_) async => QueryResult(
      source: QueryResultSource.network,
      data: {'mockMutation': 'success'},
      options: MutationOptions(document: gql('mutation { mockMutation }')),
    ),
  );
}
