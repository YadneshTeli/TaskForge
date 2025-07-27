// lib/models/task.dart
import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'task.g.dart';

enum TaskStatus { todo, in_progress, done }
enum TaskPriority { low, medium, high }

@JsonSerializable()
class Task {
  final String id;
  final String title;
  final String? description;
  final TaskStatus status;
  final TaskPriority priority;
  final String projectId;
  final User? assignedTo;
  final DateTime? dueDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> attachments;
  final List<TaskComment> comments;

  const Task({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    required this.projectId,
    this.assignedTo,
    this.dueDate,
    required this.createdAt,
    required this.updatedAt,
    required this.attachments,
    required this.comments,
  });

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
  Map<String, dynamic> toJson() => _$TaskToJson(this);
}

@JsonSerializable()
class TaskComment {
  final User user;
  final String text;
  final DateTime createdAt;

  const TaskComment({
    required this.user,
    required this.text,
    required this.createdAt,
  });

  factory TaskComment.fromJson(Map<String, dynamic> json) => _$TaskCommentFromJson(json);
  Map<String, dynamic> toJson() => _$TaskCommentToJson(this);
}

@JsonSerializable()
class TaskMetrics {
  final String taskId;
  final String title;
  final String status;
  final int timeSpent;
  final String? priority;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;
  final DateTime? dueDate;
  final User? assignee;

  const TaskMetrics({
    required this.taskId,
    required this.title,
    required this.status,
    required this.timeSpent,
    this.priority,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
    this.dueDate,
    this.assignee,
  });

  factory TaskMetrics.fromJson(Map<String, dynamic> json) => _$TaskMetricsFromJson(json);
  Map<String, dynamic> toJson() => _$TaskMetricsToJson(this);
}

@JsonSerializable()
class CreateTaskInput {
  final String title;
  final String? description;
  final TaskStatus status;
  final TaskPriority priority;
  final String projectId;
  final String? assignedTo;
  final DateTime? dueDate;

  const CreateTaskInput({
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    required this.projectId,
    this.assignedTo,
    this.dueDate,
  });

  factory CreateTaskInput.fromJson(Map<String, dynamic> json) => _$CreateTaskInputFromJson(json);
  Map<String, dynamic> toJson() => _$CreateTaskInputToJson(this);
}
