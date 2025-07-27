// lib/blocs/notification/notification_event.dart
import 'package:equatable/equatable.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();

  @override
  List<Object?> get props => [];
}

class LoadNotifications extends NotificationEvent {}

class MarkNotificationAsRead extends NotificationEvent {
  final String notificationId;

  const MarkNotificationAsRead({required this.notificationId});

  @override
  List<Object?> get props => [notificationId];
}

class MarkAllNotificationsAsRead extends NotificationEvent {}

class DeleteNotification extends NotificationEvent {
  final String notificationId;

  const DeleteNotification({required this.notificationId});

  @override
  List<Object?> get props => [notificationId];
}

class SubscribeToNotifications extends NotificationEvent {}

class UnsubscribeFromNotifications extends NotificationEvent {}

class NotificationReceived extends NotificationEvent {
  final Map<String, dynamic> notification;

  const NotificationReceived({required this.notification});

  @override
  List<Object?> get props => [notification];
}
