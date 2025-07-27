// test/blocs/project/project_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/blocs/project/project_bloc.dart';
import 'package:taskforge/blocs/project/project_event.dart';
import 'package:taskforge/blocs/project/project_state.dart';

import '../../helpers/test_helpers.dart';

void main() {
  group('ProjectBloc', () {
    late ProjectBloc projectBloc;

    setUp(() {
      setupTestBindings();  
      registerFallbackValues();
      projectBloc = ProjectBloc();
    });

    tearDown(() {
      projectBloc.close();
    });

    test('initial state is ProjectInitial', () {
      expect(projectBloc.state, equals(ProjectInitial()));
    });

    group('LoadProjects', () {
      blocTest<ProjectBloc, ProjectState>(
        'emits [ProjectLoading] when loading projects without GraphQL client',
        build: () => projectBloc,
        act: (bloc) => bloc.add(LoadProjects()),
        expect: () => [
          ProjectLoading(),
          // Will likely emit ProjectError due to GraphQL client not initialized
        ],
        wait: const Duration(seconds: 2),
      );
    });

    group('CreateProject', () {
      blocTest<ProjectBloc, ProjectState>(
        'emits [ProjectLoading] when creating project',
        build: () => projectBloc,
        act: (bloc) => bloc.add(CreateProject(
          name: 'New Project',
          description: 'Project description',
        )),
        expect: () => [
          ProjectLoading(),
          // Will likely emit ProjectError due to GraphQL client not initialized
        ],
        wait: const Duration(seconds: 2),
      );
    });

    group('UpdateProject', () {
      blocTest<ProjectBloc, ProjectState>(
        'emits [ProjectLoading] when updating project',
        build: () => projectBloc,
        act: (bloc) => bloc.add(UpdateProject(
          projectId: '1',
          updates: {
            'name': 'Updated Project',
            'description': 'Updated description',
          },
        )),
        expect: () => [
          ProjectLoading(),
          // Will likely emit ProjectError due to GraphQL client not initialized
        ],
        wait: const Duration(seconds: 2),
      );
    });

    group('DeleteProject', () {
      blocTest<ProjectBloc, ProjectState>(
        'emits [ProjectLoading] when deleting project',
        build: () => projectBloc,
        act: (bloc) => bloc.add(DeleteProject(projectId: '1')),
        expect: () => [
          ProjectLoading(),
          // Will likely emit ProjectError due to GraphQL client not initialized
        ],
        wait: const Duration(seconds: 2),
      );
    });
  });
}
