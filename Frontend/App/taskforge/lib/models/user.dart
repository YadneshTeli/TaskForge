// lib/models/user.dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String email;
  final String username;
  final String role;
  final String? fullName;
  final String? profilePicture;
  final String? bio;
  final bool isActive;
  final bool isOnline;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.email,
    required this.username,
    required this.role,
    this.fullName,
    this.profilePicture,
    this.bio,
    required this.isActive,
    required this.isOnline,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class UserStats {
  final int id;
  final int userId;
  final int totalTasksCreated;
  final int totalTasksCompleted;
  final int totalTasksPending;
  final int totalTasksOverdue;
  final int totalTasksInProgress;
  final int totalProjectsOwned;
  final int totalProjectsJoined;
  final int totalCommentsPosted;
  final int totalTimeSpent;
  final double? avgTaskCompletionTime;
  final DateTime lastActivityAt;

  const UserStats({
    required this.id,
    required this.userId,
    required this.totalTasksCreated,
    required this.totalTasksCompleted,
    required this.totalTasksPending,
    required this.totalTasksOverdue,
    required this.totalTasksInProgress,
    required this.totalProjectsOwned,
    required this.totalProjectsJoined,
    required this.totalCommentsPosted,
    required this.totalTimeSpent,
    this.avgTaskCompletionTime,
    required this.lastActivityAt,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) => _$UserStatsFromJson(json);
  Map<String, dynamic> toJson() => _$UserStatsToJson(this);
}
