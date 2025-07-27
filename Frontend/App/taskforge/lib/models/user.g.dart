// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String,
      role: json['role'] as String,
      fullName: json['fullName'] as String?,
      profilePicture: json['profilePicture'] as String?,
      bio: json['bio'] as String?,
      isActive: json['isActive'] as bool,
      isOnline: json['isOnline'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
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
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      totalTasksCreated: (json['totalTasksCreated'] as num).toInt(),
      totalTasksCompleted: (json['totalTasksCompleted'] as num).toInt(),
      totalTasksPending: (json['totalTasksPending'] as num).toInt(),
      totalTasksOverdue: (json['totalTasksOverdue'] as num).toInt(),
      totalTasksInProgress: (json['totalTasksInProgress'] as num).toInt(),
      totalProjectsOwned: (json['totalProjectsOwned'] as num).toInt(),
      totalProjectsJoined: (json['totalProjectsJoined'] as num).toInt(),
      totalCommentsPosted: (json['totalCommentsPosted'] as num).toInt(),
      totalTimeSpent: (json['totalTimeSpent'] as num).toInt(),
      avgTaskCompletionTime:
          (json['avgTaskCompletionTime'] as num?)?.toDouble(),
      lastActivityAt: DateTime.parse(json['lastActivityAt'] as String),
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
