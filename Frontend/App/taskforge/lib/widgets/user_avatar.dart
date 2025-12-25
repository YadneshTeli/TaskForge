// lib/widgets/user_avatar.dart
import 'package:flutter/material.dart';
import '../models/user.dart';

class UserAvatar extends StatelessWidget {
  final User? user;
  final String? name;
  final String? imageUrl;
  final double radius;
  final Color? backgroundColor;

  const UserAvatar({
    super.key,
    this.user,
    this.name,
    this.imageUrl,
    this.radius = 20,
    this.backgroundColor,
  });

  String _getInitials() {
    if (user != null) {
      final fullName = user!.fullName ?? user!.username;
      final trimmedFullName = fullName.trim();
      if (trimmedFullName.isNotEmpty) {
        final parts = trimmedFullName.split(RegExp(r'\s+'));
        if (parts.length >= 2) {
          return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
        }
        return parts[0][0].toUpperCase();
      }
      // Fallback to original behavior if trimming removed all characters
      return fullName.isNotEmpty ? fullName[0].toUpperCase() : 'U';
    } else if (name != null && name!.isNotEmpty) {
      final originalName = name!;
      final trimmedName = originalName.trim();
      if (trimmedName.isNotEmpty) {
        final parts = trimmedName.split(RegExp(r'\s+'));
        if (parts.length >= 2) {
          return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
        }
        return trimmedName[0].toUpperCase();
      }
      // Fallback to original behavior if trimming removed all characters
      return originalName[0].toUpperCase();
    }
    return '?';
  }

  Color _getBackgroundColor() {
    if (backgroundColor != null) return backgroundColor!;
    
    // Generate color based on initials
    final initials = _getInitials();
    final hash = initials.codeUnitAt(0) + (initials.length > 1 ? initials.codeUnitAt(1) : 0);
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.teal,
      Colors.pink,
      Colors.indigo,
      Colors.cyan,
    ];
    return colors[hash % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final profileImage = imageUrl ?? user?.profilePicture;

    return CircleAvatar(
      radius: radius,
      backgroundColor: _getBackgroundColor(),
      backgroundImage: profileImage != null ? NetworkImage(profileImage) : null,
      child: profileImage == null
          ? Text(
              _getInitials(),
              style: TextStyle(
                color: Colors.white,
                fontSize: radius * 0.8,
                fontWeight: FontWeight.bold,
              ),
            )
          : null,
    );
  }
}

class UserAvatarWithName extends StatelessWidget {
  final User user;
  final double avatarRadius;

  const UserAvatarWithName({
    super.key,
    required this.user,
    this.avatarRadius = 20,
  });

  @override
  Widget build(BuildContext context) {
    final displayName = user.fullName ?? user.username;
    
    return Row(
      children: [
        UserAvatar(user: user, radius: avatarRadius),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                displayName,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              if (user.email.isNotEmpty)
                Text(
                  user.email,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
      ],
    );
  }
}
