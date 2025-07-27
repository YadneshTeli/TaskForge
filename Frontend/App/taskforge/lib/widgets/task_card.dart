// lib/widgets/task_card.dart
import 'package:flutter/material.dart';
import '../models/task.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback onTap;
  final Function(TaskStatus) onStatusChanged;

  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
    required this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(task.title),
        subtitle: Text(task.description ?? 'No description'),
        trailing: PopupMenuButton<TaskStatus>(
          onSelected: onStatusChanged,
          itemBuilder: (context) => TaskStatus.values.map((status) {
            return PopupMenuItem(
              value: status,
              child: Text(status.name),
            );
          }).toList(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _getStatusColor(task.status),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              task.status.name,
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ),
        onTap: onTap,
      ),
    );
  }

  Color _getStatusColor(TaskStatus status) {
    switch (status) {
      case TaskStatus.todo:
        return Colors.grey;
      case TaskStatus.in_progress:
        return Colors.blue;
      case TaskStatus.done:
        return Colors.green;
    }
  }
}
