// lib/blocs/project/project_event.dart
import 'package:equatable/equatable.dart';

abstract class ProjectEvent extends Equatable {
  const ProjectEvent();

  @override
  List<Object?> get props => [];
}

class LoadProjects extends ProjectEvent {}

class CreateProject extends ProjectEvent {
  final String name;
  final String? description;

  const CreateProject({required this.name, this.description});

  @override
  List<Object?> get props => [name, description];
}

class UpdateProject extends ProjectEvent {
  final String projectId;
  final Map<String, dynamic> updates;

  const UpdateProject({required this.projectId, required this.updates});

  @override
  List<Object?> get props => [projectId, updates];
}

class DeleteProject extends ProjectEvent {
  final String projectId;

  const DeleteProject({required this.projectId});

  @override
  List<Object?> get props => [projectId];
}
