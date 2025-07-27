// lib/widgets/task_analytics_widget.dart
import 'package:flutter/material.dart';

// Simple TaskMetrics class for analytics example
class TaskMetrics {
  final int timeSpent;
  final String? priority;
  final DateTime? completedAt;
  
  const TaskMetrics({
    required this.timeSpent,
    this.priority,
    this.completedAt,
  });
}

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
        _metrics = const TaskMetrics(
          timeSpent: 120,
          priority: 'high',
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
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Task Analytics', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_metrics == null)
              const Text('No analytics data available')
            else ...[
              Text('Time Spent: ${_metrics!.timeSpent} minutes'),
              const SizedBox(height: 4),
              Text('Priority: ${_metrics!.priority ?? 'Not set'}'),
              const SizedBox(height: 4),
              if (_metrics!.completedAt != null)
                Text('Completed: ${_metrics!.completedAt!.toString()}')
              else
                const Text('Status: In Progress'),
            ],
          ],
        ),
      ),
    );
  }
}
