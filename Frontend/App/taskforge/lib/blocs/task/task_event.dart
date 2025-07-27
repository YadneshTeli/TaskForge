// lib/blocs/task/task_event.dart
import 'package:equatable/equatable.dart';
import '../../models/task.dart';

abstract class TaskEvent extends Equatable {
  const TaskEvent();

  @override
  List<Object?> get props => [];
}

class LoadTasks extends TaskEvent {
  final String? projectId;

  const LoadTasks({this.projectId});

  @override
  List<Object?> get props => [projectId];
}

class CreateTask extends TaskEvent {
  final CreateTaskInput input;

  const CreateTask({required this.input});

  @override
  List<Object?> get props => [input];
}

class UpdateTask extends TaskEvent {
  final String taskId;
  final Map<String, dynamic> updates;

  const UpdateTask({required this.taskId, required this.updates});

  @override
  List<Object?> get props => [taskId, updates];
}

class DeleteTask extends TaskEvent {
  final String taskId;

  const DeleteTask({required this.taskId});

  @override
  List<Object?> get props => [taskId];
}
