// lib/blocs/auth/auth_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final isAuthenticated = await AuthService.checkAuthStatus();
      if (isAuthenticated) {
        // Get current user from AuthService if available
        final currentUser = AuthService.currentUser;
        if (currentUser != null) {
          emit(AuthAuthenticated(user: currentUser));
        } else {
          // Create a mock user for now if no current user
          final user = User(
            id: 'user-1',
            email: 'user@example.com',
            username: 'testuser',
            fullName: 'Current User',
            role: 'user',
            isActive: true,
            isOnline: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
          emit(AuthAuthenticated(user: user));
        }
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await AuthService.login(event.email, event.password);
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await AuthService.register(
        email: event.email,
        password: event.password,
        firstName: event.firstName,
        lastName: event.lastName,
        username: event.username,
      );
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await AuthService.logout();
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }
}
