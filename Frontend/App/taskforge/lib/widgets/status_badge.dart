// lib/widgets/status_badge.dart
import 'package:flutter/material.dart';
import '../models/task.dart';

class StatusBadge extends StatelessWidget {
  final TaskStatus status;
  final bool showLabel;

  const StatusBadge({
    super.key,
    required this.status,
    this.showLabel = true,
  });

  Color _getColor() {
    switch (status) {
      case TaskStatus.todo:
        return Colors.grey;
      case TaskStatus.in_progress:
        return Colors.blue;
      case TaskStatus.done:
        return Colors.green;
    }
  }

  IconData _getIcon() {
    switch (status) {
      case TaskStatus.todo:
        return Icons.circle_outlined;
      case TaskStatus.in_progress:
        return Icons.refresh;
      case TaskStatus.done:
        return Icons.check_circle;
    }
  }

  String _getLabel() {
    switch (status) {
      case TaskStatus.todo:
        return 'To Do';
      case TaskStatus.in_progress:
        return 'In Progress';
      case TaskStatus.done:
        return 'Done';
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_getIcon(), size: 16, color: color),
          if (showLabel) ...[
            const SizedBox(width: 6),
            Text(
              _getLabel(),
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class PriorityBadge extends StatelessWidget {
  final TaskPriority priority;
  final bool showLabel;

  const PriorityBadge({
    super.key,
    required this.priority,
    this.showLabel = true,
  });

  Color _getColor() {
    switch (priority) {
      case TaskPriority.low:
        return Colors.green;
      case TaskPriority.medium:
        return Colors.orange;
      case TaskPriority.high:
        return Colors.red;
    }
  }

  IconData _getIcon() {
    switch (priority) {
      case TaskPriority.low:
        return Icons.arrow_downward;
      case TaskPriority.medium:
        return Icons.drag_handle;
      case TaskPriority.high:
        return Icons.priority_high;
    }
  }

  String _getLabel() {
    switch (priority) {
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.high:
        return 'High';
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_getIcon(), size: 16, color: color),
          if (showLabel) ...[
            const SizedBox(width: 6),
            Text(
              _getLabel(),
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
