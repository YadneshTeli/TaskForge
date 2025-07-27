// lib/blocs/project/project_state.dart
import 'package:equatable/equatable.dart';
import '../../models/project.dart';

abstract class ProjectState extends Equatable {
  const ProjectState();

  @override
  List<Object?> get props => [];
}

class ProjectInitial extends ProjectState {}

class ProjectLoading extends ProjectState {}

class ProjectLoaded extends ProjectState {
  final List<Project> projects;

  const ProjectLoaded({required this.projects});

  @override
  List<Object?> get props => [projects];
}

class ProjectOperationSuccess extends ProjectState {
  final String message;

  const ProjectOperationSuccess({required this.message});

  @override
  List<Object?> get props => [message];
}

class ProjectError extends ProjectState {
  final String message;

  const ProjectError({required this.message});

  @override
  List<Object?> get props => [message];
}
