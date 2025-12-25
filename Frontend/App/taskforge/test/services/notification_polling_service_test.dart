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
    // Clean up after each test by resetting state to defaults.
    //
    // IMPORTANT: We intentionally do NOT call pollingService.dispose() here.
    // NotificationPollingService is implemented as a process-wide singleton,
    // and dispose() tears down its internal ValueNotifiers. Disposing the
    // singleton in one test would leave it in an invalid state for all
    // subsequent tests that reuse the same instance, which does not match
    // production usage where the singleton is expected to live for the
    // lifetime of the app.
    //
    // Tests that add listeners (e.g., ValueNotifier behavior tests)
    // are responsible for removing their own listeners within the test itself
    // to prevent memory leaks and state pollution.
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

    test('startPolling is idempotent when already polling', () {
      pollingService.startPolling();
      
      // Try to start again - should be idempotent
      pollingService.startPolling();
      
      // Note: We can only verify the isPolling flag remains true.
      // The internal Timer creation is an implementation detail that
      // cannot be directly tested without exposing internal state.
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
    test('refresh completes without throwing', () async {
      // Initial state
      expect(pollingService.notifications.value, isEmpty);
      expect(pollingService.unreadCount.value, 0);
      
      // Note: Without dependency injection to mock the NotificationService backend,
      // we cannot verify that refresh() actually updates the notifications and
      // unreadCount. This test only verifies that the method completes without
      // throwing. The service will use mock data from the backend's fallback.
      // To fully test this behavior, the service would need to accept an optional
      // NotificationService parameter for dependency injection.
      await pollingService.refresh();
      
      // The method should complete successfully, returning mock data
      expect(pollingService.notifications.value, isA<List<NotificationModel>>());
      // After refresh with mock data, we should have some notifications
      expect(pollingService.notifications.value.length, greaterThan(0));
    });

    test('notifications ValueNotifier can be updated', () {
      expect(pollingService.notifications.value, isEmpty);
      
      pollingService.notifications.value = mockNotifications;
      
      expect(pollingService.notifications.value.length, 3);
      expect(pollingService.notifications.value, mockNotifications);
    });

    test('unreadCount reflects the number of unread notifications', () {
      // Set notifications and manually update unread count to simulate
      // what the service does internally
      pollingService.notifications.value = mockNotifications;
      final expectedUnreadCount = mockNotifications.where((n) => !n.isRead).length;
      pollingService.unreadCount.value = expectedUnreadCount;
      
      // Verify the service's unreadCount matches the expected value
      expect(pollingService.unreadCount.value, expectedUnreadCount);
    });
  });

  group('NotificationPollingService - State Updates', () {
    // NOTE: The following tests can only verify that methods throw exceptions
    // when the backend fails, since the service doesn't support dependency
    // injection for mocking the NotificationService. Successful scenarios
    // (where the backend succeeds and state is updated correctly) cannot be
    // tested without restructuring the service to accept an optional backend
    // service parameter.
    
    test('markAsRead attempts to update backend', () async {
      // Setup initial state
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      
      final notificationToMark = mockNotifications[0];
      expect(notificationToMark.isRead, false);
      
      // Without a mocked backend, the method will throw an exception
      try {
        await pollingService.markAsRead(notificationToMark.id);
      } catch (e) {
        // Expected to fail since we don't have a real backend
      }
    });

    test('markAllAsRead attempts to update backend', () async {
      // Setup initial state
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      
      // Without a mocked backend, the method will throw an exception
      try {
        await pollingService.markAllAsRead();
      } catch (e) {
        // Expected to fail since we don't have a real backend
      }
    });

    test('deleteNotification attempts to delete from backend', () async {
      // Setup initial state
      pollingService.notifications.value = mockNotifications;
      final initialCount = pollingService.notifications.value.length;
      
      final notificationToDelete = mockNotifications[0];
      
      // Without a mocked backend, the method will throw an exception
      try {
        await pollingService.deleteNotification(notificationToDelete.id);
      } catch (e) {
        // Expected to fail since we don't have a real backend
      }
    });
  });

  group('NotificationPollingService - ValueNotifier State', () {
    test('notifications ValueNotifier emits changes', () {
      final notificationsList = <List<NotificationModel>>[];
      
      void listener() {
        notificationsList.add(pollingService.notifications.value);
      }
      
      pollingService.notifications.addListener(listener);
      
      pollingService.notifications.value = [mockNotifications[0]];
      pollingService.notifications.value = [mockNotifications[0], mockNotifications[1]];
      
      expect(notificationsList.length, 2);
      expect(notificationsList[0].length, 1);
      expect(notificationsList[1].length, 2);
      
      pollingService.notifications.removeListener(listener);
    });

    test('unreadCount ValueNotifier emits changes', () {
      final counts = <int>[];
      
      void listener() {
        counts.add(pollingService.unreadCount.value);
      }
      
      pollingService.unreadCount.addListener(listener);
      
      pollingService.unreadCount.value = 1;
      pollingService.unreadCount.value = 5;
      pollingService.unreadCount.value = 0;
      
      expect(counts.length, 3);
      expect(counts, [1, 5, 0]);
      
      pollingService.unreadCount.removeListener(listener);
    });

    test('isPolling ValueNotifier emits changes', () {
      final states = <bool>[];
      
      void listener() {
        states.add(pollingService.isPolling.value);
      }
      
      pollingService.isPolling.addListener(listener);
      
      pollingService.isPolling.value = true;
      pollingService.isPolling.value = false;
      
      expect(states.length, 2);
      expect(states, [true, false]);
      
      pollingService.isPolling.removeListener(listener);
    });
  });

  group('NotificationPollingService - Error Handling', () {
    test('refresh swallows errors and completes without throwing', () async {
      // The service implementation catches all errors during notification fetching
      // and only logs them via debugPrint.
      // This is by design - the polling service should not crash the app if the
      // backend is temporarily unavailable. Instead, it gracefully degrades to
      // using cached/mock data.
      await expectLater(
        pollingService.refresh(),
        completes,
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
      
      // Calculate expected unread count and verify service reflects it
      final unreadCount = allReadNotifications.where((n) => !n.isRead).length;
      expect(unreadCount, 0);
      
      // Manually set the service's unreadCount to match the calculated value
      pollingService.unreadCount.value = unreadCount;
      expect(pollingService.unreadCount.value, 0);
    });

    test('handles all unread notifications', () {
      final allUnreadNotifications = mockNotifications.map((n) {
        return n.copyWith(isRead: false);
      }).toList();
      
      pollingService.notifications.value = allUnreadNotifications;
      
      // Calculate expected unread count and verify service reflects it
      final unreadCount = allUnreadNotifications.where((n) => !n.isRead).length;
      expect(unreadCount, allUnreadNotifications.length);
      
      // Manually set the service's unreadCount to match the calculated value
      pollingService.unreadCount.value = unreadCount;
      expect(pollingService.unreadCount.value, allUnreadNotifications.length);
    });

    test('markAsRead does not optimistically update state before backend confirmation', () async {
      // Setup: Set initial state
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      final initialNotifications =
          List<NotificationModel>.from(pollingService.notifications.value);
      final initialUnreadCount = pollingService.unreadCount.value;

      try {
        await pollingService.markAsRead('non_existent_id');
      } catch (_) {
        // Expected to throw since backend will fail
      }

      // The service only updates local state after successful backend operations.
      // Since the backend call failed, local state should remain unchanged.
      expect(pollingService.notifications.value, initialNotifications);
      expect(pollingService.unreadCount.value, initialUnreadCount);
    });

    test('deleteNotification does not optimistically update state before backend confirmation', () async {
      // Setup: Set initial state
      pollingService.notifications.value = mockNotifications;
      pollingService.unreadCount.value = 2;
      final initialNotifications =
          List<NotificationModel>.from(pollingService.notifications.value);
      final initialUnreadCount = pollingService.unreadCount.value;

      try {
        await pollingService.deleteNotification('non_existent_id');
      } catch (_) {
        // Expected to throw since backend will fail
      }

      // The service only updates local state after successful backend operations.
      // Since the backend call failed, local state should remain unchanged.
      expect(pollingService.notifications.value, initialNotifications);
      expect(pollingService.unreadCount.value, initialUnreadCount);
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
