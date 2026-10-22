// test/blocs/auth/auth_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/blocs/auth/auth_bloc.dart';
import 'package:taskforge/blocs/auth/auth_event.dart';
import 'package:taskforge/blocs/auth/auth_state.dart';

import '../../helpers/test_helpers.dart';

void main() {
  group('AuthBloc', () {
    late AuthBloc authBloc;

    setUp(() {
      setupTestBindings();
      registerFallbackValues();
      authBloc = AuthBloc();
    });

    tearDown(() {
      authBloc.close();
    });

    test('initial state is AuthInitial', () {
      expect(authBloc.state, equals(AuthInitial()));
    });

    group('CheckAuthStatus', () {
      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthUnauthenticated] when no auth token exists',
        build: () => authBloc,
        act: (bloc) => bloc.add(CheckAuthStatus()),
        expect: () => [
          AuthLoading(),
          AuthUnauthenticated(),
        ],
        wait: const Duration(seconds: 1),
      );
    });

    group('LoginRequested', () {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthError] when login fails in test environment',
        build: () => authBloc,
        act: (bloc) => bloc.add(const LoginRequested(
          email: testEmail,
          password: testPassword,
        )),
        expect: () => [
          AuthLoading(),
          isA<AuthError>(),
        ],
        wait: const Duration(seconds: 1),
      );
    });

    group('RegisterRequested', () {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const testUsername = 'johndoe';

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthError] when registration fails in test environment',
        build: () => authBloc,
        act: (bloc) => bloc.add(const RegisterRequested(
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Doe',
          username: testUsername,
        )),
        expect: () => [
          AuthLoading(),
          isA<AuthError>(),
        ],
        wait: const Duration(seconds: 1),
      );
    });

    group('LogoutRequested', () {
      blocTest<AuthBloc, AuthState>(
        'emits states when logout is requested',
        build: () => authBloc,
        act: (bloc) => bloc.add(LogoutRequested()),
        expect: () => [
          isA<AuthState>(),
        ],
        wait: const Duration(seconds: 1),
      );
    });
  });
}
