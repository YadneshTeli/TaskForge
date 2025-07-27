// test/blocs/task/task_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/blocs/task/task_bloc.dart';
import 'package:taskforge/blocs/task/task_event.dart';
import 'package:taskforge/blocs/task/task_state.dart';
import 'package:taskforge/models/task.dart';

import '../../helpers/test_helpers.dart';

void main() {
  group('TaskBloc', () {
    late TaskBloc taskBloc;

    setUp(() {
      setupTestBindings();  
      registerFallbackValues();
      taskBloc = TaskBloc();
    });

    tearDown(() {
      taskBloc.close();
    });

    test('initial state is TaskInitial', () {
      expect(taskBloc.state, equals(TaskInitial()));
    });

    group('LoadTasks', () {
      blocTest<TaskBloc, TaskState>(
        'emits [TaskLoading, TaskError] when GraphQL client not initialized',
        build: () => taskBloc,
        act: (bloc) => bloc.add(LoadTasks()),
        expect: () => [
          TaskLoading(),
          isA<TaskError>(),
        ],
        wait: const Duration(seconds: 2),
      );
    });

    group('CreateTask', () {
      blocTest<TaskBloc, TaskState>(
        'emits [TaskError] when GraphQL client not initialized',
        build: () => taskBloc,
        act: (bloc) => bloc.add(CreateTask(
          input: CreateTaskInput(
            title: 'New Task',
            description: 'Task description',
            status: TaskStatus.todo,
            priority: TaskPriority.medium,
            projectId: '1',
          ),
        )),
        expect: () => [
          isA<TaskError>(),
        ],
        wait: const Duration(seconds: 2),
      );
    });

    group('UpdateTask', () {
      blocTest<TaskBloc, TaskState>(
        'emits [TaskError] when GraphQL client not initialized',
        build: () => taskBloc,
        act: (bloc) => bloc.add(UpdateTask(
          taskId: '1',
          updates: {
            'title': 'Updated Task',
            'description': 'Updated description',
            'status': 'in_progress',
          },
        )),
        expect: () => [
          isA<TaskError>(),
        ],
        wait: const Duration(seconds: 2),
      );
    });

    group('DeleteTask', () {
      blocTest<TaskBloc, TaskState>(
        'emits [TaskError] when GraphQL client not initialized',
        build: () => taskBloc,
        act: (bloc) => bloc.add(DeleteTask(taskId: '1')),
        expect: () => [
          isA<TaskError>(),
        ],
        wait: const Duration(seconds: 2),
      );
    });
  });
}
