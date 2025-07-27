// lib/blocs/notification/notification_bloc.dart
import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'notification_event.dart';
import 'notification_state.dart';
import '../../services/notification_service.dart';
import '../../models/notification.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationService _notificationService = NotificationService();
  StreamSubscription<NotificationModel>? _notificationSubscription;

  NotificationBloc() : super(NotificationInitial()) {
    on<LoadNotifications>(_onLoadNotifications);
    on<MarkNotificationAsRead>(_onMarkNotificationAsRead);
    on<MarkAllNotificationsAsRead>(_onMarkAllNotificationsAsRead);
    on<DeleteNotification>(_onDeleteNotification);
    on<SubscribeToNotifications>(_onSubscribeToNotifications);
    on<UnsubscribeFromNotifications>(_onUnsubscribeFromNotifications);
    on<NotificationReceived>(_onNotificationReceived);
  }

  Future<void> _onLoadNotifications(
    LoadNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    emit(NotificationLoading());
    
    try {
      final notifications = await _notificationService.getNotifications();
      final unreadCount = notifications.where((n) => !n.isRead).length;
      
      emit(NotificationLoaded(
        notifications: notifications,
        unreadCount: unreadCount,
      ));
    } catch (e) {
      emit(NotificationError(message: e.toString()));
    }
  }

  Future<void> _onMarkNotificationAsRead(
    MarkNotificationAsRead event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.markAsRead(event.notificationId);
      
      // Reload notifications to update the state
      add(LoadNotifications());
    } catch (e) {
      emit(NotificationError(message: e.toString()));
    }
  }

  Future<void> _onMarkAllNotificationsAsRead(
    MarkAllNotificationsAsRead event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.markAllAsRead();
      
      // Reload notifications to update the state
      add(LoadNotifications());
    } catch (e) {
      emit(NotificationError(message: e.toString()));
    }
  }

  Future<void> _onDeleteNotification(
    DeleteNotification event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _notificationService.deleteNotification(event.notificationId);
      
      // Reload notifications to update the state
      add(LoadNotifications());
    } catch (e) {
      emit(NotificationError(message: e.toString()));
    }
  }

  Future<void> _onSubscribeToNotifications(
    SubscribeToNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      _notificationSubscription = _notificationService.subscribeToNotifications().listen(
        (notification) {
          add(NotificationReceived(notification: notification.toJson()));
        },
        onError: (error) {
          emit(NotificationError(message: error.toString()));
        },
      );
      
      emit(NotificationSubscribed());
    } catch (e) {
      emit(NotificationError(message: e.toString()));
    }
  }

  Future<void> _onUnsubscribeFromNotifications(
    UnsubscribeFromNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    await _notificationSubscription?.cancel();
    _notificationSubscription = null;
    emit(NotificationUnsubscribed());
  }

  Future<void> _onNotificationReceived(
    NotificationReceived event,
    Emitter<NotificationState> emit,
  ) async {
    // Add the new notification to the current state
    if (state is NotificationLoaded) {
      final currentState = state as NotificationLoaded;
      final newNotification = NotificationModel.fromJson(event.notification);
      final updatedNotifications = [newNotification, ...currentState.notifications];
      final unreadCount = updatedNotifications.where((n) => !n.isRead).length;
      
      emit(NotificationLoaded(
        notifications: updatedNotifications,
        unreadCount: unreadCount,
      ));
    } else {
      // If no current state, load all notifications
      add(LoadNotifications());
    }
  }

  @override
  Future<void> close() {
    _notificationSubscription?.cancel();
    return super.close();
  }
}
