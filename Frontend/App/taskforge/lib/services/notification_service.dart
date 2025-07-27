// lib/services/notification_service.dart
import 'dart:convert';
import 'dart:async';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import '../models/notification.dart';
import '../utils/constants.dart';
import 'graphql_service.dart';

class NotificationService {
  static const String _getNotificationsQuery = '''
    query GetNotifications {
      notifications {
        id
        title
        message
        type
        isRead
        userId
        taskId
        projectId
        metadata
        createdAt
        updatedAt
      }
    }
  ''';

  static const String _markAsReadMutation = '''
    mutation MarkNotificationAsRead(\$id: ID!) {
      markNotificationAsRead(id: \$id) {
        id
        isRead
      }
    }
  ''';

  static const String _markAllAsReadMutation = '''
    mutation MarkAllNotificationsAsRead {
      markAllNotificationsAsRead {
        success
        count
      }
    }
  ''';

  static const String _deleteNotificationMutation = '''
    mutation DeleteNotification(\$id: ID!) {
      deleteNotification(id: \$id) {
        success
      }
    }
  ''';

  WebSocketChannel? _channel;
  StreamController<NotificationModel>? _streamController;

  Future<List<NotificationModel>> getNotifications() async {
    try {
      final result = await GraphQLService.query(_getNotificationsQuery);
      
      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      final List<dynamic> notificationsJson = result.data?['notifications'] ?? [];
      return notificationsJson
          .map((json) => NotificationModel.fromJson(json))
          .toList();
    } catch (e) {
      // Fallback to mock data for now
      return _getMockNotifications();
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      final result = await GraphQLService.mutation(
        _markAsReadMutation,
        variables: {'id': notificationId},
      );
      
      if (result.hasException) {
        throw Exception(result.exception.toString());
      }
    } catch (e) {
      // For now, just ignore the error in development
      print('Failed to mark notification as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      final result = await GraphQLService.mutation(_markAllAsReadMutation);
      
      if (result.hasException) {
        throw Exception(result.exception.toString());
      }
    } catch (e) {
      // For now, just ignore the error in development
      print('Failed to mark all notifications as read: $e');
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      final result = await GraphQLService.mutation(
        _deleteNotificationMutation,
        variables: {'id': notificationId},
      );
      
      if (result.hasException) {
        throw Exception(result.exception.toString());
      }
    } catch (e) {
      // For now, just ignore the error in development
      print('Failed to delete notification: $e');
    }
  }

  Stream<NotificationModel> subscribeToNotifications() {
    _streamController = StreamController<NotificationModel>();
    
    try {
      // WebSocket URL - adjust based on your backend setup
      final wsUrl = ApiConstants.baseUrl.replaceFirst('http', 'ws').replaceFirst('/api', '/ws');
      _channel = IOWebSocketChannel.connect(wsUrl);
      
      _channel!.stream.listen(
        (data) {
          try {
            final json = jsonDecode(data);
            if (json['type'] == 'notification') {
              final notification = NotificationModel.fromJson(json['data']);
              _streamController!.add(notification);
            }
          } catch (e) {
            _streamController!.addError('Failed to parse notification: $e');
          }
        },
        onError: (error) {
          _streamController!.addError('WebSocket error: $error');
        },
        onDone: () {
          _streamController!.close();
        },
      );
    } catch (e) {
      // Fallback to periodic mock notifications for development
      _simulateMockNotifications();
    }
    
    return _streamController!.stream;
  }

  void _simulateMockNotifications() {
    Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_streamController?.isClosed == true) {
        timer.cancel();
        return;
      }
      
      final mockNotification = NotificationModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: 'New Task Assigned',
        message: 'You have been assigned a new task',
        type: NotificationType.task_assigned,
        isRead: false,
        userId: 'current_user_id',
        taskId: 'mock_task_id',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      _streamController?.add(mockNotification);
    });
  }

  List<NotificationModel> _getMockNotifications() {
    final now = DateTime.now();
    return [
      NotificationModel(
        id: '1',
        title: 'Task Due Soon',
        message: 'Your task "Complete project proposal" is due in 2 hours',
        type: NotificationType.task_due_soon,
        isRead: false,
        userId: 'current_user_id',
        taskId: 'task_1',
        createdAt: now.subtract(const Duration(hours: 2)),
        updatedAt: now.subtract(const Duration(hours: 2)),
      ),
      NotificationModel(
        id: '2',
        title: 'Project Invitation',
        message: 'You have been invited to join "Mobile App Development" project',
        type: NotificationType.project_invitation,
        isRead: false,
        userId: 'current_user_id',
        projectId: 'project_1',
        createdAt: now.subtract(const Duration(hours: 4)),
        updatedAt: now.subtract(const Duration(hours: 4)),
      ),
      NotificationModel(
        id: '3',
        title: 'Task Completed',
        message: 'John completed the task "Design wireframes"',
        type: NotificationType.task_completed,
        isRead: true,
        userId: 'current_user_id',
        taskId: 'task_2',
        createdAt: now.subtract(const Duration(days: 1)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
    ];
  }

  void dispose() {
    _channel?.sink.close();
    _streamController?.close();
  }
}
