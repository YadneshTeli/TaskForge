// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'project.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Project _$ProjectFromJson(Map<String, dynamic> json) => Project(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      status: $enumDecode(_$ProjectStatusEnumMap, json['status']),
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      owner: User.fromJson(json['owner'] as Map<String, dynamic>),
      members: (json['members'] as List<dynamic>)
          .map((e) => User.fromJson(e as Map<String, dynamic>))
          .toList(),
      attachments: (json['attachments'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$ProjectToJson(Project instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'status': _$ProjectStatusEnumMap[instance.status]!,
      'dueDate': instance.dueDate?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'owner': instance.owner,
      'members': instance.members,
      'attachments': instance.attachments,
    };

const _$ProjectStatusEnumMap = {
  ProjectStatus.active: 'active',
  ProjectStatus.completed: 'completed',
  ProjectStatus.archived: 'archived',
};

ProjectAnalytics _$ProjectAnalyticsFromJson(Map<String, dynamic> json) =>
    ProjectAnalytics(
      totalTasks: (json['totalTasks'] as num).toInt(),
      completedTasks: (json['completedTasks'] as num).toInt(),
      pendingTasks: (json['pendingTasks'] as num).toInt(),
      inProgressTasks: (json['inProgressTasks'] as num).toInt(),
      overdueTasks: (json['overdueTasks'] as num).toInt(),
      totalMembers: (json['totalMembers'] as num).toInt(),
      totalComments: (json['totalComments'] as num).toInt(),
      totalTimeSpent: (json['totalTimeSpent'] as num).toInt(),
      avgTaskCompletionTime:
          (json['avgTaskCompletionTime'] as num?)?.toDouble(),
      productivityScore: (json['productivityScore'] as num?)?.toDouble(),
      completionRate: (json['completionRate'] as num).toDouble(),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );

Map<String, dynamic> _$ProjectAnalyticsToJson(ProjectAnalytics instance) =>
    <String, dynamic>{
      'totalTasks': instance.totalTasks,
      'completedTasks': instance.completedTasks,
      'pendingTasks': instance.pendingTasks,
      'inProgressTasks': instance.inProgressTasks,
      'overdueTasks': instance.overdueTasks,
      'totalMembers': instance.totalMembers,
      'totalComments': instance.totalComments,
      'totalTimeSpent': instance.totalTimeSpent,
      'avgTaskCompletionTime': instance.avgTaskCompletionTime,
      'productivityScore': instance.productivityScore,
      'completionRate': instance.completionRate,
      'lastUpdated': instance.lastUpdated.toIso8601String(),
    };

CreateProjectInput _$CreateProjectInputFromJson(Map<String, dynamic> json) =>
    CreateProjectInput(
      name: json['name'] as String,
      description: json['description'] as String?,
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
    );

Map<String, dynamic> _$CreateProjectInputToJson(CreateProjectInput instance) =>
    <String, dynamic>{
      'name': instance.name,
      'description': instance.description,
      'dueDate': instance.dueDate?.toIso8601String(),
    };
