// lib/screens/tasks_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/task/task_bloc.dart';
import '../blocs/task/task_event.dart';
import '../blocs/task/task_state.dart';
import '../models/task.dart';
import '../widgets/index.dart';

class TasksScreen extends StatefulWidget {
  final String? projectId;
  
  const TasksScreen({super.key, this.projectId});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  @override
  void initState() {
    super.initState();
    // Load tasks using BLoC
    context.read<TaskBloc>().add(LoadTasks());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<TaskBloc, TaskState>(
      listener: (context, state) {
        if (state is TaskError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${state.message}')),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Tasks'),
          actions: [
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => _showCreateTaskDialog(),
            ),
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () => context.read<TaskBloc>().add(LoadTasks()),
            ),
          ],
        ),
        body: BlocBuilder<TaskBloc, TaskState>(
          builder: (context, state) {
            if (state is TaskLoading) {
              return const LoadingWidget(
                message: 'Loading tasks...',
                showMessage: true,
              );
            }
            
            if (state is TaskError) {
              return ErrorDisplayWidget(
                message: 'Failed to load tasks',
                details: state.message,
                onRetry: () => context.read<TaskBloc>().add(LoadTasks()),
              );
            }
            
            if (state is TaskLoaded) {
              final tasks = widget.projectId != null 
                  ? state.tasks.where((task) => task.projectId == widget.projectId).toList()
                  : state.tasks;
              
              if (tasks.isEmpty) {
                return EmptyStateWidget(
                  icon: Icons.task_alt,
                  title: 'No Tasks Yet',
                  message: widget.projectId != null
                      ? 'Create your first task for this project'
                      : 'Create your first task to get started',
                  actionLabel: 'Create Task',
                  onActionPressed: _showCreateTaskDialog,
                );
              }
              
              return RefreshIndicator(
                onRefresh: () async {
                  context.read<TaskBloc>().add(LoadTasks());
                },
                child: ListView.builder(
                  itemCount: tasks.length,
                  itemBuilder: (context, index) {
                    final task = tasks[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _getStatusColor(task.status),
                          child: Icon(
                            _getStatusIcon(task.status),
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        title: Text(task.title),
                        subtitle: task.description != null 
                            ? Text(
                                task.description!,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              )
                            : null,
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) => _handleTaskAction(task, value),
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'edit',
                              child: ListTile(
                                leading: Icon(Icons.edit),
                                title: Text('Edit'),
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                            const PopupMenuItem(
                              value: 'delete',
                              child: ListTile(
                                leading: Icon(Icons.delete, color: Colors.red),
                                title: Text('Delete', style: TextStyle(color: Colors.red)),
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ],
                        ),
                        onTap: () => _showTaskDetails(task),
                      ),
                    );
                  },
                ),
              );
            }
            
            return const Center(child: Text('Unknown state'));
          },
        ),
      ),
    );
  }
  
  void _showCreateTaskDialog() {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    TaskPriority selectedPriority = TaskPriority.medium;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Create Task'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<TaskPriority>(
                value: selectedPriority,
                decoration: const InputDecoration(
                  labelText: 'Priority',
                  border: OutlineInputBorder(),
                ),
                items: TaskPriority.values.map((priority) {
                  return DropdownMenuItem(
                    value: priority,
                    child: Text(priority.name.toUpperCase()),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => selectedPriority = value);
                  }
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.trim().isNotEmpty) {
                  final input = CreateTaskInput(
                    title: titleController.text.trim(),
                    description: descriptionController.text.trim().isEmpty 
                        ? null 
                        : descriptionController.text.trim(),
                    status: TaskStatus.todo,
                    priority: selectedPriority,
                    projectId: widget.projectId ?? 'default-project',
                  );
                  context.read<TaskBloc>().add(CreateTask(input: input));
                  Navigator.of(context).pop();
                }
              },
              child: const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showEditTaskDialog(Task task) {
    final titleController = TextEditingController(text: task.title);
    final descriptionController = TextEditingController(text: task.description ?? '');
    TaskPriority selectedPriority = task.priority;
    TaskStatus selectedStatus = task.status;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Edit Task'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<TaskStatus>(
                value: selectedStatus,
                decoration: const InputDecoration(
                  labelText: 'Status',
                  border: OutlineInputBorder(),
                ),
                items: TaskStatus.values.map((status) {
                  return DropdownMenuItem(
                    value: status,
                    child: Text(status.name.replaceAll('_', ' ').toUpperCase()),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => selectedStatus = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<TaskPriority>(
                value: selectedPriority,
                decoration: const InputDecoration(
                  labelText: 'Priority',
                  border: OutlineInputBorder(),
                ),
                items: TaskPriority.values.map((priority) {
                  return DropdownMenuItem(
                    value: priority,
                    child: Text(priority.name.toUpperCase()),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => selectedPriority = value);
                  }
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.trim().isNotEmpty) {
                  final updates = <String, dynamic>{
                    'title': titleController.text.trim(),
                    'description': descriptionController.text.trim().isEmpty 
                        ? null 
                        : descriptionController.text.trim(),
                    'status': selectedStatus.name,
                    'priority': selectedPriority.name,
                  };
                  context.read<TaskBloc>().add(UpdateTask(
                    taskId: task.id,
                    updates: updates,
                  ));
                  Navigator.of(context).pop();
                }
              },
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showTaskDetails(Task task) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(task.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (task.description != null) ...[
              Text('Description: ${task.description}'),
              const SizedBox(height: 8),
            ],
            Text('Status: ${task.status.name}'),
            Text('Priority: ${task.priority.name}'),
            Text('Created: ${_formatDate(task.createdAt)}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
  
  Future<void> _handleTaskAction(Task task, String action) async {
    switch (action) {
      case 'edit':
        // TODO: Navigate to edit task screen
        _showEditTaskDialog(task);
        break;
      case 'delete':
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Delete Task'),
            content: Text('Are you sure you want to delete "${task.title}"?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Delete'),
              ),
            ],
          ),
        );
        
        if (confirmed == true) {
          context.read<TaskBloc>().add(DeleteTask(taskId: task.id));
        }
        break;
    }
  }
  
  Color _getStatusColor(TaskStatus status) {
    switch (status) {
      case TaskStatus.todo:
        return Colors.grey;
      case TaskStatus.in_progress:
        return Colors.orange;
      case TaskStatus.done:
        return Colors.green;
    }
  }
  
  IconData _getStatusIcon(TaskStatus status) {
    switch (status) {
      case TaskStatus.todo:
        return Icons.radio_button_unchecked;
      case TaskStatus.in_progress:
        return Icons.hourglass_empty;
      case TaskStatus.done:
        return Icons.check_circle;
    }
  }
  
  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
