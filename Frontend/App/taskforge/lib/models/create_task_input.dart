// lib/models/create_task_input.dart
import 'task.dart';

class CreateTaskInput {
  final String title;
  final String? description;
  final TaskStatus status;
  final TaskPriority priority;
  final String projectId;  // Made required
  final String? assignedToId;
  final DateTime? dueDate;

  const CreateTaskInput({
    required this.title,
    this.description,
    this.status = TaskStatus.todo,
    this.priority = TaskPriority.medium,
    required this.projectId,  // Made required
    this.assignedToId,
    this.dueDate,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (description != null) 'description': description,
      'status': status.name,
      'priority': priority.name,
      'projectId': projectId,  // Always include now
      if (assignedToId != null) 'assignedToId': assignedToId,
      if (dueDate != null) 'dueDate': dueDate!.toIso8601String(),
    };
  }
}
