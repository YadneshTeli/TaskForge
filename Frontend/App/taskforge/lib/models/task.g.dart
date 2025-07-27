// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Task _$TaskFromJson(Map<String, dynamic> json) => Task(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      status: $enumDecode(_$TaskStatusEnumMap, json['status']),
      priority: $enumDecode(_$TaskPriorityEnumMap, json['priority']),
      projectId: json['projectId'] as String,
      assignedTo: json['assignedTo'] == null
          ? null
          : User.fromJson(json['assignedTo'] as Map<String, dynamic>),
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      attachments: (json['attachments'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      comments: (json['comments'] as List<dynamic>)
          .map((e) => TaskComment.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$TaskToJson(Task instance) => <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'status': _$TaskStatusEnumMap[instance.status]!,
      'priority': _$TaskPriorityEnumMap[instance.priority]!,
      'projectId': instance.projectId,
      'assignedTo': instance.assignedTo,
      'dueDate': instance.dueDate?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'attachments': instance.attachments,
      'comments': instance.comments,
    };

const _$TaskStatusEnumMap = {
  TaskStatus.todo: 'todo',
  TaskStatus.in_progress: 'in_progress',
  TaskStatus.done: 'done',
};

const _$TaskPriorityEnumMap = {
  TaskPriority.low: 'low',
  TaskPriority.medium: 'medium',
  TaskPriority.high: 'high',
};

TaskComment _$TaskCommentFromJson(Map<String, dynamic> json) => TaskComment(
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      text: json['text'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$TaskCommentToJson(TaskComment instance) =>
    <String, dynamic>{
      'user': instance.user,
      'text': instance.text,
      'createdAt': instance.createdAt.toIso8601String(),
    };

TaskMetrics _$TaskMetricsFromJson(Map<String, dynamic> json) => TaskMetrics(
      taskId: json['taskId'] as String,
      title: json['title'] as String,
      status: json['status'] as String,
      timeSpent: (json['timeSpent'] as num).toInt(),
      priority: json['priority'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
      assignee: json['assignee'] == null
          ? null
          : User.fromJson(json['assignee'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TaskMetricsToJson(TaskMetrics instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'title': instance.title,
      'status': instance.status,
      'timeSpent': instance.timeSpent,
      'priority': instance.priority,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'dueDate': instance.dueDate?.toIso8601String(),
      'assignee': instance.assignee,
    };

CreateTaskInput _$CreateTaskInputFromJson(Map<String, dynamic> json) =>
    CreateTaskInput(
      title: json['title'] as String,
      description: json['description'] as String?,
      status: $enumDecode(_$TaskStatusEnumMap, json['status']),
      priority: $enumDecode(_$TaskPriorityEnumMap, json['priority']),
      projectId: json['projectId'] as String,
      assignedTo: json['assignedTo'] as String?,
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
    );

Map<String, dynamic> _$CreateTaskInputToJson(CreateTaskInput instance) =>
    <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'status': _$TaskStatusEnumMap[instance.status]!,
      'priority': _$TaskPriorityEnumMap[instance.priority]!,
      'projectId': instance.projectId,
      'assignedTo': instance.assignedTo,
      'dueDate': instance.dueDate?.toIso8601String(),
    };
