// lib/models/project.dart
import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'project.g.dart';

enum ProjectStatus { active, completed, archived }

@JsonSerializable()
class Project {
  final String id;
  final String name;
  final String? description;
  final ProjectStatus status;
  final DateTime? dueDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User owner;
  final List<User> members;
  final List<String> attachments;

  const Project({
    required this.id,
    required this.name,
    this.description,
    required this.status,
    this.dueDate,
    required this.createdAt,
    required this.updatedAt,
    required this.owner,
    required this.members,
    required this.attachments,
  });

  factory Project.fromJson(Map<String, dynamic> json) => _$ProjectFromJson(json);
  Map<String, dynamic> toJson() => _$ProjectToJson(this);
}

@JsonSerializable()
class ProjectAnalytics {
  final int totalTasks;
  final int completedTasks;
  final int pendingTasks;
  final int inProgressTasks;
  final int overdueTasks;
  final int totalMembers;
  final int totalComments;
  final int totalTimeSpent;
  final double? avgTaskCompletionTime;
  final double? productivityScore;
  final double completionRate;
  final DateTime lastUpdated;

  const ProjectAnalytics({
    required this.totalTasks,
    required this.completedTasks,
    required this.pendingTasks,
    required this.inProgressTasks,
    required this.overdueTasks,
    required this.totalMembers,
    required this.totalComments,
    required this.totalTimeSpent,
    this.avgTaskCompletionTime,
    this.productivityScore,
    required this.completionRate,
    required this.lastUpdated,
  });

  factory ProjectAnalytics.fromJson(Map<String, dynamic> json) => _$ProjectAnalyticsFromJson(json);
  Map<String, dynamic> toJson() => _$ProjectAnalyticsToJson(this);
}

@JsonSerializable()
class CreateProjectInput {
  final String name;
  final String? description;
  final DateTime? dueDate;

  const CreateProjectInput({
    required this.name,
    this.description,
    this.dueDate,
  });

  factory CreateProjectInput.fromJson(Map<String, dynamic> json) => _$CreateProjectInputFromJson(json);
  Map<String, dynamic> toJson() => _$CreateProjectInputToJson(this);
}
