// lib/blocs/project/project_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/project_service.dart';
import '../../models/project.dart';
import 'project_event.dart';
import 'project_state.dart';

class ProjectBloc extends Bloc<ProjectEvent, ProjectState> {
  ProjectBloc() : super(ProjectInitial()) {
    on<LoadProjects>(_onLoadProjects);
    on<CreateProject>(_onCreateProject);
    on<UpdateProject>(_onUpdateProject);
    on<DeleteProject>(_onDeleteProject);
  }

  Future<void> _onLoadProjects(
    LoadProjects event,
    Emitter<ProjectState> emit,
  ) async {
    emit(ProjectLoading());
    try {
      final projects = await ProjectService.getProjects();
      emit(ProjectLoaded(projects: projects));
    } catch (e) {
      emit(ProjectError(message: e.toString()));
    }
  }

  Future<void> _onCreateProject(
    CreateProject event,
    Emitter<ProjectState> emit,
  ) async {
    try {
      final input = CreateProjectInput(
        name: event.name,
        description: event.description,
      );
      await ProjectService.createProject(input);
      emit(const ProjectOperationSuccess(message: 'Project created successfully'));
      // Reload projects
      add(LoadProjects());
    } catch (e) {
      emit(ProjectError(message: e.toString()));
    }
  }

  Future<void> _onUpdateProject(
    UpdateProject event,
    Emitter<ProjectState> emit,
  ) async {
    try {
      await ProjectService.updateProject(event.projectId, event.updates);
      emit(const ProjectOperationSuccess(message: 'Project updated successfully'));
      // Reload projects
      add(LoadProjects());
    } catch (e) {
      emit(ProjectError(message: e.toString()));
    }
  }

  Future<void> _onDeleteProject(
    DeleteProject event,
    Emitter<ProjectState> emit,
  ) async {
    try {
      await ProjectService.deleteProject(event.projectId);
      emit(const ProjectOperationSuccess(message: 'Project deleted successfully'));
      // Reload projects
      add(LoadProjects());
    } catch (e) {
      emit(ProjectError(message: e.toString()));
    }
  }
}
