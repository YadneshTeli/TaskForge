// lib/models/notification.dart

enum NotificationType {
  task_assigned,
  task_completed,
  task_due_soon,
  task_overdue,
  project_invitation,
  project_update,
  comment_mention,
  system_update,
}

class NotificationModel {
  final String id;
  final String title;
  final String message;
  final NotificationType type;
  final bool isRead;
  final String userId;
  final String? taskId;
  final String? projectId;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.userId,
    this.taskId,
    this.projectId,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: NotificationType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => NotificationType.system_update,
      ),
      isRead: json['isRead'] as bool,
      userId: json['userId'] as String,
      taskId: json['taskId'] as String?,
      projectId: json['projectId'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type.name,
      'isRead': isRead,
      'userId': userId,
      'taskId': taskId,
      'projectId': projectId,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  NotificationModel copyWith({
    String? id,
    String? title,
    String? message,
    NotificationType? type,
    bool? isRead,
    String? userId,
    String? taskId,
    String? projectId,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      isRead: isRead ?? this.isRead,
      userId: userId ?? this.userId,
      taskId: taskId ?? this.taskId,
      projectId: projectId ?? this.projectId,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
