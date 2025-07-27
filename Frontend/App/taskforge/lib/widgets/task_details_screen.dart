// lib/widgets/task_details_screen.dart
import 'package:flutter/material.dart';
import '../models/task.dart';
import '../services/task_service.dart';
import 'task_analytics_widget.dart';

class TaskDetailsScreen extends StatefulWidget {
  final String taskId;

  const TaskDetailsScreen({
    super.key,
    required this.taskId,
  });

  @override
  State<TaskDetailsScreen> createState() => _TaskDetailsScreenState();
}

class _TaskDetailsScreenState extends State<TaskDetailsScreen> {
  Task? _task;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTask();
  }

  Future<void> _loadTask() async {
    try {
      // Since getTask doesn't exist, we'll simulate loading a task
      // In a real app, you would use TaskService.getTask(widget.taskId)
      await Future.delayed(const Duration(seconds: 1));
      
      // For demo purposes, create a mock task
      final mockTask = Task(
        id: widget.taskId,
        title: 'Sample Task',
        description: 'This is a sample task for demonstration',
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        projectId: 'project-1',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 1)),
        attachments: const [],
        comments: const [],
      );
      
      setState(() {
        _task = mockTask;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_task?.title ?? 'Task Details'),
        actions: [
          if (_task != null)
            PopupMenuButton<String>(
              onSelected: _handleMenuAction,
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit),
                      SizedBox(width: 8),
                      Text('Edit'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Delete', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text('Error: $_error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _loadTask(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_task == null) {
      return const Center(
        child: Text('Task not found'),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTaskHeader(),
          const SizedBox(height: 24),
          _buildTaskDetails(),
          const SizedBox(height: 24),
          _buildTaskDescription(),
          const SizedBox(height: 24),
          _buildTaskAnalytics(),
          const SizedBox(height: 24),
          _buildTaskComments(),
        ],
      ),
    );
  }

  Widget _buildTaskHeader() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _task!.title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildStatusChip(_task!.status),
                const SizedBox(width: 8),
                _buildPriorityChip(_task!.priority),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(TaskStatus status) {
    Color color;
    switch (status) {
      case TaskStatus.todo:
        color = Colors.grey;
        break;
      case TaskStatus.in_progress:
        color = Colors.blue;
        break;
      case TaskStatus.done:
        color = Colors.green;
        break;
    }

    return Chip(
      label: Text(status.name.toUpperCase()),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildPriorityChip(TaskPriority priority) {
    Color color;
    switch (priority) {
      case TaskPriority.low:
        color = Colors.green;
        break;
      case TaskPriority.medium:
        color = Colors.orange;
        break;
      case TaskPriority.high:
        color = Colors.red;
        break;
    }

    return Chip(
      label: Text(priority.name.toUpperCase()),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildTaskDetails() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Details',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            _buildDetailRow('Created', _task!.createdAt.toString()),
            _buildDetailRow('Updated', _task!.updatedAt.toString()),
            if (_task!.dueDate != null)
              _buildDetailRow('Due Date', _task!.dueDate.toString()),
            if (_task!.assignedTo != null)
              _buildDetailRow('Assigned To', _task!.assignedTo?.fullName ?? 'Unassigned'),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Widget _buildTaskDescription() {
    if (_task!.description == null || _task!.description!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Description',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Text(_task!.description!),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskAnalytics() {
    return TaskAnalyticsWidget(taskId: widget.taskId);
  }

  Widget _buildTaskComments() {
    if (_task!.comments.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Comments',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              const Text('No comments yet.'),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Comments (${_task!.comments.length})',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            for (final comment in _task!.comments) _buildCommentItem(comment),
          ],
        ),
      ),
    );
  }

  Widget _buildCommentItem(TaskComment comment) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                comment.user.fullName ?? 'Unknown User',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const Spacer(),
              Text(
                comment.createdAt.toString(),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(comment.text),
        ],
      ),
    );
  }

  void _handleMenuAction(String action) {
    switch (action) {
      case 'edit':
        _showEditDialog();
        break;
      case 'delete':
        _showDeleteConfirmation();
        break;
    }
  }

  void _showEditDialog() {
    // TODO: Implement edit dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit functionality coming soon!')),
    );
  }

  void _showDeleteConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Task'),
        content: const Text('Are you sure you want to delete this task? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () async {
              Navigator.of(context).pop();
              await _deleteTask();
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteTask() async {
    try {
      await TaskService.deleteTask(widget.taskId);
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Task deleted successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete task: $e')),
        );
      }
    }
  }
}
