// lib/examples/hybrid_usage_example.dart
import 'package:flutter/material.dart';
import 'package:taskforge/config/app_config.dart';
import 'package:taskforge/screens/home_screen.dart';
import 'package:taskforge/screens/login_screen.dart';
import 'package:taskforge/screens/splash_screen.dart';
import '../services/auth_service.dart';
import '../services/task_service.dart';
import '../models/task.dart';
import '../widgets/task_card.dart';
import '../widgets/create_task_dialog.dart';
import '../widgets/task_details_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize app configuration
  AppConfig.init();
  
  runApp(const TaskForgeApp());
}

class TaskForgeApp extends StatelessWidget {
  const TaskForgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaskForge',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isLoading = true;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      final isAuthenticated = await AuthService.checkAuthStatus();
      setState(() {
        _isAuthenticated = isAuthenticated;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isAuthenticated = false;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SplashScreen();
    }
    
    if (_isAuthenticated) {
      return const HomeScreen();
    } else {
      return const LoginScreen();
    }
  }
}

// Example usage of hybrid architecture in a stateful widget
class TasksPage extends StatefulWidget {
  final String? projectId;
  
  const TasksPage({super.key, this.projectId});

  @override
  State<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  late Stream<List<Task>> _tasksStream;
  
  @override
  void initState() {
    super.initState();
    // Use the hybrid service to get real-time task updates
    _tasksStream = TaskService.watchTasks(projectId: widget.projectId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showCreateTaskDialog(),
          ),
        ],
      ),
      body: StreamBuilder<List<Task>>(
        stream: _tasksStream,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${snapshot.error}'),
                  ElevatedButton(
                    onPressed: () => setState(() {
                      _tasksStream = TaskService.watchTasks(projectId: widget.projectId);
                    }),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          final tasks = snapshot.data ?? [];
          
          if (tasks.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.task_alt, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No tasks found'),
                ],
              ),
            );
          }
          
          return ListView.builder(
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final task = tasks[index];
              return TaskCard(
                task: task,
                onTap: () => _showTaskDetails(task),
                onStatusChanged: (newStatus) => _updateTaskStatus(task.id, newStatus),
              );
            },
          );
        },
      ),
    );
  }
  
  void _showCreateTaskDialog() {
    showDialog(
      context: context,
      builder: (context) => CreateTaskDialog(
        projectId: widget.projectId,
        onTaskCreated: (task) {
          // Task will automatically appear in stream
          Navigator.of(context).pop();
        },
      ),
    );
  }
  
  void _showTaskDetails(Task task) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TaskDetailsScreen(taskId: task.id),
      ),
    );
  }
  
  Future<void> _updateTaskStatus(String taskId, TaskStatus newStatus) async {
    try {
      await TaskService.updateTask(taskId, {'status': newStatus.name});
      // Task will automatically update in stream
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update task: $e')),
      );
    }
  }
}

// Example of using analytics data from Prisma
class TaskAnalyticsWidget extends StatefulWidget {
  final String taskId;
  
  const TaskAnalyticsWidget({super.key, required this.taskId});

  @override
  State<TaskAnalyticsWidget> createState() => _TaskAnalyticsWidgetState();
}

class _TaskAnalyticsWidgetState extends State<TaskAnalyticsWidget> {
  TaskMetrics? _metrics;
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadMetrics();
  }
  
  Future<void> _loadMetrics() async {
    try {
      // Simulate loading metrics - in real app, this would call TaskService.getTaskMetrics()
      await Future.delayed(const Duration(seconds: 1));
      setState(() {
        _metrics = TaskMetrics(
          taskId: widget.taskId,
          title: 'Sample Task Analytics',
          status: 'in_progress',
          timeSpent: 120,
          priority: 'high',
          createdAt: DateTime.now().subtract(const Duration(days: 2)),
          updatedAt: DateTime.now(),
          completedAt: null,
        );
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const CircularProgressIndicator();
    }
    
    if (_metrics == null) {
      return const Text('No analytics data available');
    }
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Task Analytics', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text('Time Spent: ${_metrics!.timeSpent} minutes'),
            Text('Priority: ${_metrics!.priority ?? 'Not set'}'),
            if (_metrics!.completedAt != null)
              Text('Completed: ${_metrics!.completedAt!.toString()}'),
          ],
        ),
      ),
    );
  }
}
