import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'config/app_config.dart';  
import 'services/graphql_service.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'blocs/auth/auth_bloc.dart';
import 'blocs/auth/auth_event.dart';
import 'blocs/auth/auth_state.dart';
import 'blocs/task/task_bloc.dart';
import 'blocs/project/project_bloc.dart';
import 'blocs/notification/notification_bloc.dart';
import 'utils/constants.dart';
import 'services/notification_polling_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize app configuration
  AppConfig.init();
  
  // Enable detailed logging in debug mode
  if (kDebugMode) {
    print('🚀 TaskForge starting...');
    print('📡 API Base URL: ${ApiConstants.baseUrl}');
    print('🔗 GraphQL URL: ${ApiConstants.graphqlUrl}');
  }
  
  // Initialize GraphQL service
  try {
    await GraphQLService.init();
    print('✅ GraphQL service initialized successfully');
  } catch (e) {
    print('❌ Failed to initialize GraphQL service: $e');
  }
  
  runApp(const TaskForgeApp());
}

class TaskForgeApp extends StatelessWidget {
  const TaskForgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc(),
        ),
        BlocProvider<TaskBloc>(
          create: (context) => TaskBloc(),
        ),
        BlocProvider<ProjectBloc>(
          create: (context) => ProjectBloc(),
        ),
        BlocProvider<NotificationBloc>(
          create: (context) => NotificationBloc(),
        ),
      ],
      child: MaterialApp(
        title: 'TaskForge',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final NotificationPollingService _pollingService = NotificationPollingService();

  @override
  void dispose() {
    _pollingService.stopPolling();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        // Handle side effects like navigation, snackbars, etc.
        if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
          // Stop polling on auth error
          _pollingService.stopPolling();
        }
        
        // Start polling when authenticated
        if (state is AuthAuthenticated) {
          _pollingService.startPolling();
        }
        
        // Stop polling when logged out
        if (state is! AuthAuthenticated && state is! AuthLoading) {
          _pollingService.stopPolling();
        }
      },
      builder: (context, state) {
        if (state is AuthInitial || state is AuthLoading) {
          // Check auth status when the app starts
          if (state is AuthInitial) {
            context.read<AuthBloc>().add(CheckAuthStatus());
          }
          return const SplashScreen();
        }
        
        if (state is AuthAuthenticated) {
          return const HomeScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
