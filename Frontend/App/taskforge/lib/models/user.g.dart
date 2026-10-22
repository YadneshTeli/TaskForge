// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
      id: (json['id'] ?? json['_id'])?.toString() ?? '',
      email: (json['email'] ?? '') as String,
      username: (json['username'] ?? '') as String,
      role: (json['role'] ?? 'USER') as String,
      fullName: json['fullName'] as String?,
      profilePicture: json['profilePicture'] as String?,
      bio: json['bio'] as String?,
      isActive: (json['isActive'] as bool?) ?? true,
      isOnline: (json['isOnline'] as bool?) ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'].toString())
          : DateTime.now(),
    );

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'username': instance.username,
      'role': instance.role,
      'fullName': instance.fullName,
      'profilePicture': instance.profilePicture,
      'bio': instance.bio,
      'isActive': instance.isActive,
      'isOnline': instance.isOnline,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

UserStats _$UserStatsFromJson(Map<String, dynamic> json) => UserStats(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['userId'] as num?)?.toInt() ?? 0,
      totalTasksCreated: (json['totalTasksCreated'] as num?)?.toInt() ?? 0,
      totalTasksCompleted: (json['totalTasksCompleted'] as num?)?.toInt() ?? 0,
      totalTasksPending: (json['totalTasksPending'] as num?)?.toInt() ?? 0,
      totalTasksOverdue: (json['totalTasksOverdue'] as num?)?.toInt() ?? 0,
      totalTasksInProgress: (json['totalTasksInProgress'] as num?)?.toInt() ?? 0,
      totalProjectsOwned: (json['totalProjectsOwned'] as num?)?.toInt() ?? 0,
      totalProjectsJoined: (json['totalProjectsJoined'] as num?)?.toInt() ?? 0,
      totalCommentsPosted: (json['totalCommentsPosted'] as num?)?.toInt() ?? 0,
      totalTimeSpent: (json['totalTimeSpent'] as num?)?.toInt() ?? 0,
      avgTaskCompletionTime:
          (json['avgTaskCompletionTime'] as num?)?.toDouble(),
      lastActivityAt: json['lastActivityAt'] != null
          ? DateTime.parse(json['lastActivityAt'].toString())
          : DateTime.now(),
    );

Map<String, dynamic> _$UserStatsToJson(UserStats instance) => <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'totalTasksCreated': instance.totalTasksCreated,
      'totalTasksCompleted': instance.totalTasksCompleted,
      'totalTasksPending': instance.totalTasksPending,
      'totalTasksOverdue': instance.totalTasksOverdue,
      'totalTasksInProgress': instance.totalTasksInProgress,
      'totalProjectsOwned': instance.totalProjectsOwned,
      'totalProjectsJoined': instance.totalProjectsJoined,
      'totalCommentsPosted': instance.totalCommentsPosted,
      'totalTimeSpent': instance.totalTimeSpent,
      'avgTaskCompletionTime': instance.avgTaskCompletionTime,
      'lastActivityAt': instance.lastActivityAt.toIso8601String(),
    };
