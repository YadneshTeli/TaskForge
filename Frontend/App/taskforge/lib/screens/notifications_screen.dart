// lib/screens/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/notification/notification_bloc.dart';
import '../blocs/notification/notification_event.dart';
import '../blocs/notification/notification_state.dart';
import '../models/notification.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<NotificationBloc>().add(LoadNotifications());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationLoaded && state.unreadCount > 0) {
                return TextButton(
                  onPressed: () {
                    context.read<NotificationBloc>().add(MarkAllNotificationsAsRead());
                  },
                  child: const Text('Mark All Read'),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<NotificationBloc>().add(LoadNotifications()),
          ),
        ],
      ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          if (state is NotificationLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          
          if (state is NotificationError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text('Error: ${state.message}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<NotificationBloc>().add(LoadNotifications()),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          if (state is NotificationLoaded) {
            final notifications = state.notifications;
            
            if (notifications.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_none, size: 64, color: Colors.grey),
                    SizedBox(height: 16),
                    Text('No notifications'),
                    SizedBox(height: 8),
                    Text('You\'re all caught up!'),
                  ],
                ),
              );
            }
            
            return RefreshIndicator(
              onRefresh: () async {
                context.read<NotificationBloc>().add(LoadNotifications());
              },
              child: ListView.builder(
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final notification = notifications[index];
                  return _buildNotificationTile(notification);
                },
              ),
            );
          }
          
          return const Center(child: Text('Unknown state'));
        },
      ),
    );
  }

  Widget _buildNotificationTile(NotificationModel notification) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: Colors.red,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) {
        context.read<NotificationBloc>().add(DeleteNotification(notificationId: notification.id));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${notification.title} deleted')),
        );
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: notification.isRead ? Colors.grey : _getTypeColor(notification.type),
            child: Icon(
              _getTypeIcon(notification.type),
              color: Colors.white,
              size: 20,
            ),
          ),
          title: Text(
            notification.title,
            style: TextStyle(
              fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(notification.message),
              const SizedBox(height: 4),
              Text(
                _formatTime(notification.createdAt),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          trailing: PopupMenuButton<String>(
            onSelected: (value) => _handleNotificationAction(notification, value),
            itemBuilder: (context) => [
              if (!notification.isRead)
                const PopupMenuItem(
                  value: 'mark_read',
                  child: ListTile(
                    leading: Icon(Icons.mark_email_read),
                    title: Text('Mark as Read'),
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              const PopupMenuItem(
                value: 'delete',
                child: ListTile(
                  leading: Icon(Icons.delete, color: Colors.red),
                  title: Text('Delete', style: TextStyle(color: Colors.red)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          onTap: () {
            if (!notification.isRead) {
              context.read<NotificationBloc>().add(
                MarkNotificationAsRead(notificationId: notification.id),
              );
            }
            _handleNotificationTap(notification);
          },
        ),
      ),
    );
  }

  Color _getTypeColor(NotificationType type) {
    switch (type) {
      case NotificationType.task_assigned:
        return Colors.blue;
      case NotificationType.task_completed:
        return Colors.green;
      case NotificationType.task_due_soon:
        return Colors.orange;
      case NotificationType.task_overdue:
        return Colors.red;
      case NotificationType.project_invitation:
        return Colors.purple;
      case NotificationType.project_update:
        return Colors.indigo;
      case NotificationType.comment_mention:
        return Colors.teal;
      case NotificationType.system_update:
        return Colors.grey;
    }
  }

  IconData _getTypeIcon(NotificationType type) {
    switch (type) {
      case NotificationType.task_assigned:
        return Icons.assignment;
      case NotificationType.task_completed:
        return Icons.check_circle;
      case NotificationType.task_due_soon:
        return Icons.schedule;
      case NotificationType.task_overdue:
        return Icons.warning;
      case NotificationType.project_invitation:
        return Icons.group_add;
      case NotificationType.project_update:
        return Icons.update;
      case NotificationType.comment_mention:
        return Icons.chat;
      case NotificationType.system_update:
        return Icons.info;
    }
  }

  void _handleNotificationAction(NotificationModel notification, String action) {
    switch (action) {
      case 'mark_read':
        context.read<NotificationBloc>().add(
          MarkNotificationAsRead(notificationId: notification.id),
        );
        break;
      case 'delete':
        context.read<NotificationBloc>().add(
          DeleteNotification(notificationId: notification.id),
        );
        break;
    }
  }

  void _handleNotificationTap(NotificationModel notification) {
    // Handle navigation based on notification type
    if (notification.taskId != null) {
      // Navigate to task details
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Task navigation coming soon!')),
      );
    } else if (notification.projectId != null) {
      // Navigate to project details
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Project navigation coming soon!')),
      );
    }
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }
}
