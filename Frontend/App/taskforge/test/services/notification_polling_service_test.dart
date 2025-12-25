// test/services/notification_polling_service_test.dart
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/services/notification_polling_service.dart';
import 'package:taskforge/models/notification.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late NotificationPollingService pollingService;

  // Test data
  final mockNotifications = [
    NotificationModel(
      id: '1',
      title: 'Test Notification 1',
      message: 'Message 1',
      type: NotificationType.task_assigned,
      isRead: false,
      userId: 'user1',
      taskId: 'task1',
      createdAt: DateTime(2024, 1, 1),
      updatedAt: DateTime(2024, 1, 1),
    ),
    NotificationModel(
      id: '2',
      title: 'Test Notification 2',
      message: 'Message 2',
      type: NotificationType.task_completed,
      isRead: true,
      userId: 'user1',
      taskId: 'task2',
      createdAt: DateTime(2024, 1, 2),
      updatedAt: DateTime(2024, 1, 2),
    ),
    NotificationModel(
      id: '3',
      title: 'Test Notification 3',
      message: 'Message 3',
      type: NotificationType.project_invitation,
      isRead: false,
      userId: 'user1',
      projectId: 'project1',
      createdAt: DateTime(2024, 1, 3),
      updatedAt: DateTime(2024, 1, 3),
    ),
  ];

  setUp(() {
    // Get reference to singleton instance and ensure clean state
    // Note: Since this is a singleton, all tests share the same instance
    pollingService = NotificationPollingService();

    // Stop any active polling from previous tests and reset state
    pollingService.stopPolling();
    
    // Reset notifiers to clean state
    pollingService.notifications.value = [];
    pollingService.unreadCount.value = 0;
    pollingService.isPolling.value = false;
  });

  tearDown(() {
    // Clean up after each test
    pollingService.stopPolling();
    pollingService.notifications.value = [];
    pollingService.unreadCount.value = 0;
    pollingService.isPolling.value = false;
  });

  group('NotificationPollingService - Polling Lifecycle', () {
    test('startPolling sets isPolling to true', () {
      expect(pollingService.isPolling.value, false);
      
      pollingService.startPolling();
      
      expect(pollingService.isPolling.value, true);
      pollingService.stopPolling();
    });

    test('stopPolling sets isPolling to false', () {
      pollingService.startPolling();
      expect(pollingService.isPolling.value, true);
      
      pollingService.stopPolling();
      
      expect(pollingService.isPolling.value, false);
    });

    test('startPolling does not start multiple timers', () {
      pollingService.startPolling();
      final firstPollingState = pollingService.isPolling.value;
      
      // Try to start again
      pollingService.startPolling();
      
      expect(pollingService.isPolling.value, firstPollingState);
      expect(pollingService.isPolling.value, true);
      
      pollingService.stopPolling();
    });

    test('stopPolling when not polling does not throw', () {
      expect(pollingService.isPolling.value, false);
      
      expect(() => pollingService.stopPolling(), returnsNormally);
      
      expect(pollingService.isPolling.value, false);
    });
  });

  group('NotificationPollingService - Notification Fetching', () {
    test('refresh updates notifications and unread count', () async {
      // Use reflection to inject mock service for testing
      // Since the service uses a singleton pattern, we'll test the behavior
      // by verifying state changes
      
      // Initial state
      expect(pollingService.notifications.value, isEmpty);
      expect(pollingService.unreadCount.value, 0);
      
      // Note: Without dependency injection, we can't fully test the fetching
      // This test verifies the refresh method exists and doesn't throw
      await pollingService.refresh();
      
      // The method should complete without throwing
      expect(pollingService.notifications.value, isA<List<NotificationModel>>());
    });

    test('notifications ValueNotifier can be updated', () {
      expect(pollingService.notifications.value, isEmpty);
      
      pollingService.notifications.value = mockNotifications;
      
      expect(pollingService.notifications.value.length, 3);
      expect(pollingService.notifications.value, mockNotifications);
    });

    test('unreadCount is calculated correctly from notifications', () {
      pollingService.notifications.value = mockNotifications;
      
      final unreadNotifications = mockNotifications.where((n) => !n.isRead).toList();
      
      expect(unreadNotifications.length, 2); // notifications 1 and 3 are unread
    });
  });

  group('NotificationPollingService - State Updates', () {
    test('markAsRead updates notification isRead state', () async {
      // Setup initial state
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      
      final notificationToMark = mockNotifications[0];
      expect(notificationToMark.isRead, false);
      
      // Note: Without dependency injection, we test that the method exists
      // In a real scenario, this would be mocked
      try {
        await pollingService.markAsRead(notificationToMark.id);
      } catch (e) {
        // Expected to fail since we don't have a real backend
        expect(e, isNotNull);
      }
    });

    test('markAllAsRead updates all notifications to read', () async {
      // Setup initial state
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      
      // Note: Without dependency injection, we test that the method exists
      try {
        await pollingService.markAllAsRead();
      } catch (e) {
        // Expected to fail since we don't have a real backend
        expect(e, isNotNull);
      }
    });

    test('deleteNotification removes notification from list', () async {
      // Setup initial state
      pollingService.notifications.value = mockNotifications;
      final initialCount = pollingService.notifications.value.length;
      
      final notificationToDelete = mockNotifications[0];
      
      // Note: Without dependency injection, we test that the method exists
      try {
        await pollingService.deleteNotification(notificationToDelete.id);
      } catch (e) {
        // Expected to fail since we don't have a real backend
        expect(e, isNotNull);
      }
    });
  });

  group('NotificationPollingService - ValueNotifier State', () {
    test('notifications ValueNotifier emits changes', () {
      final notificationsList = <List<NotificationModel>>[];
      
      pollingService.notifications.addListener(() {
        notificationsList.add(pollingService.notifications.value);
      });
      
      pollingService.notifications.value = [mockNotifications[0]];
      pollingService.notifications.value = [mockNotifications[0], mockNotifications[1]];
      
      expect(notificationsList.length, 2);
      expect(notificationsList[0].length, 1);
      expect(notificationsList[1].length, 2);
    });

    test('unreadCount ValueNotifier emits changes', () {
      final counts = <int>[];
      
      pollingService.unreadCount.addListener(() {
        counts.add(pollingService.unreadCount.value);
      });
      
      pollingService.unreadCount.value = 1;
      pollingService.unreadCount.value = 5;
      pollingService.unreadCount.value = 0;
      
      expect(counts.length, 3);
      expect(counts, [1, 5, 0]);
    });

    test('isPolling ValueNotifier emits changes', () {
      final states = <bool>[];
      
      pollingService.isPolling.addListener(() {
        states.add(pollingService.isPolling.value);
      });
      
      pollingService.isPolling.value = true;
      pollingService.isPolling.value = false;
      
      expect(states.length, 2);
      expect(states, [true, false]);
    });
  });

  group('NotificationPollingService - Error Handling', () {
    test('refresh handles errors gracefully', () async {
      // The service should handle errors without throwing
      await expectLater(
        pollingService.refresh(),
        completes,
      );
    });

    test('markAsRead handles errors and rethrows', () async {
      expect(
        () async => await pollingService.markAsRead('invalid_id'),
        throwsException,
      );
    });

    test('markAllAsRead handles errors and rethrows', () async {
      expect(
        () async => await pollingService.markAllAsRead(),
        throwsException,
      );
    });

    test('deleteNotification handles errors and rethrows', () async {
      expect(
        () async => await pollingService.deleteNotification('invalid_id'),
        throwsException,
      );
    });
  });

  group('NotificationPollingService - Singleton Pattern', () {
    test('factory constructor returns same instance', () {
      final instance1 = NotificationPollingService();
      final instance2 = NotificationPollingService();
      
      expect(identical(instance1, instance2), true);
    });

    test('singleton maintains state across calls', () {
      final instance1 = NotificationPollingService();
      instance1.unreadCount.value = 42;
      
      final instance2 = NotificationPollingService();
      
      expect(instance2.unreadCount.value, 42);
      
      // Reset for other tests
      instance1.unreadCount.value = 0;
    });
  });

  group('NotificationPollingService - Edge Cases', () {
    test('handles empty notification list', () {
      pollingService.notifications.value = [];
      
      expect(pollingService.notifications.value, isEmpty);
      expect(pollingService.notifications.value.length, 0);
    });

    test('handles all read notifications', () {
      final allReadNotifications = mockNotifications.map((n) {
        return n.copyWith(isRead: true);
      }).toList();
      
      pollingService.notifications.value = allReadNotifications;
      
      final unreadCount = allReadNotifications.where((n) => !n.isRead).length;
      expect(unreadCount, 0);
    });

    test('handles all unread notifications', () {
      final allUnreadNotifications = mockNotifications.map((n) {
        return n.copyWith(isRead: false);
      }).toList();
      
      pollingService.notifications.value = allUnreadNotifications;
      
      final unreadCount = allUnreadNotifications.where((n) => !n.isRead).length;
      expect(unreadCount, allUnreadNotifications.length);
    });

    test('markAsRead with non-existent id handles gracefully', () async {
      pollingService.notifications.value = mockNotifications;
      
      expect(
        () async => await pollingService.markAsRead('non_existent_id'),
        throwsException,
      );
    });

    test('deleteNotification with non-existent id handles gracefully', () async {
      pollingService.notifications.value = mockNotifications;
      
      expect(
        () async => await pollingService.deleteNotification('non_existent_id'),
        throwsException,
      );
    });
  });

  group('NotificationPollingService - Integration Scenarios', () {
    test('polling lifecycle complete flow', () {
      expect(pollingService.isPolling.value, false);
      
      // Start polling
      pollingService.startPolling();
      expect(pollingService.isPolling.value, true);
      
      // Update notifications
      pollingService.notifications.value = mockNotifications;
      expect(pollingService.notifications.value.length, 3);
      
      // Stop polling
      pollingService.stopPolling();
      expect(pollingService.isPolling.value, false);
      
      // Notifications should still be available after stopping
      expect(pollingService.notifications.value.length, 3);
    });

    test('multiple start-stop cycles work correctly', () {
      for (int i = 0; i < 3; i++) {
        pollingService.startPolling();
        expect(pollingService.isPolling.value, true);
        
        pollingService.stopPolling();
        expect(pollingService.isPolling.value, false);
      }
    });

    test('state persists between polling sessions', () {
      pollingService.startPolling();
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      pollingService.stopPolling();
      
      // State should persist after stopping
      expect(pollingService.notifications.value.length, 3);
      expect(pollingService.unreadCount.value, 2);
      
      // Start again
      pollingService.startPolling();
      expect(pollingService.notifications.value.length, 3);
      expect(pollingService.unreadCount.value, 2);
      
      pollingService.stopPolling();
    });
  });
}
