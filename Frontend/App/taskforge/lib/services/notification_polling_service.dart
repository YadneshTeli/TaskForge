// lib/services/notification_polling_service.dart
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'notification_service.dart';
import '../models/notification.dart';

class NotificationPollingService {
  static final NotificationPollingService _instance = NotificationPollingService._internal();
  factory NotificationPollingService() => _instance;
  NotificationPollingService._internal();

  Timer? _pollingTimer;
  final NotificationService _notificationService = NotificationService();
  
  // Polling interval (30 seconds)
  static const Duration _pollingInterval = Duration(seconds: 30);
  
  // Observable notification count
  final ValueNotifier<int> unreadCount = ValueNotifier<int>(0);
  final ValueNotifier<List<NotificationModel>> notifications = ValueNotifier<List<NotificationModel>>([]);
  final ValueNotifier<bool> isPolling = ValueNotifier<bool>(false);

  /// Start polling for notifications
  void startPolling() {
    if (_pollingTimer != null && _pollingTimer!.isActive) {
      if (kDebugMode) {
        debugPrint('Notification polling already active');
      }
      return;
    }

    isPolling.value = true;
    
    // Fetch immediately
    _fetchNotifications();
    
    // Then poll every interval
    _pollingTimer = Timer.periodic(_pollingInterval, (_) {
      _fetchNotifications();
    });

    if (kDebugMode) {
      debugPrint('Started notification polling (every ${_pollingInterval.inSeconds}s)');
    }
  }

  /// Stop polling for notifications
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    isPolling.value = false;

    if (kDebugMode) {
      debugPrint('Stopped notification polling');
    }
  }

  /// Fetch notifications and update count
  Future<void> _fetchNotifications() async {
    try {
      final fetchedNotifications = await _notificationService.getNotifications();
      notifications.value = fetchedNotifications;
      
      // Count unread notifications
      final unread = fetchedNotifications.where((n) => !n.isRead).length;
      unreadCount.value = unread;

      if (kDebugMode) {
        debugPrint('Fetched ${fetchedNotifications.length} notifications, $unread unread');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error fetching notifications: $e');
      }
    }
  }

  /// Manually refresh notifications
  Future<void> refresh() async {
    await _fetchNotifications();
  }

  /// Mark notification as read and update count
  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);
      
      // Update local state using copyWith
      final updatedNotifications = notifications.value.map((n) {
        if (n.id == notificationId) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
      
      notifications.value = updatedNotifications;
      unreadCount.value = updatedNotifications.where((n) => !n.isRead).length;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error marking notification as read: $e');
      }
      rethrow;
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();
      
      // Update local state using copyWith
      final updatedNotifications = notifications.value.map((n) {
        return n.copyWith(isRead: true);
      }).toList();
      
      notifications.value = updatedNotifications;
      unreadCount.value = 0;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error marking all notifications as read: $e');
      }
      rethrow;
    }
  }

  /// Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _notificationService.deleteNotification(notificationId);
      
      // Update local state
      final updatedNotifications = notifications.value
          .where((n) => n.id != notificationId)
          .toList();
      
      notifications.value = updatedNotifications;
      unreadCount.value = updatedNotifications.where((n) => !n.isRead).length;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error deleting notification: $e');
      }
      rethrow;
    }
  }

  /// Dispose resources
  void dispose() {
    stopPolling();
    unreadCount.dispose();
    notifications.dispose();
    isPolling.dispose();
  }
}
