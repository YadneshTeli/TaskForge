// lib/blocs/auth/auth_event.dart
import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class CheckAuthStatus extends AuthEvent {}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginRequested({required this.email, required this.password});

  @override
  List<Object> get props => [email, password];
}

class RegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String username;

  const RegisterRequested({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    required this.username,
  });

  @override
  List<Object> get props => [email, password, firstName, lastName, username];
}

class LogoutRequested extends AuthEvent {}
