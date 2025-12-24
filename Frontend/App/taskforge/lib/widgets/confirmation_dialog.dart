// lib/widgets/confirmation_dialog.dart
import 'package:flutter/material.dart';

class ConfirmationDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final VoidCallback onConfirm;
  final VoidCallback? onCancel;
  final Color? confirmColor;
  final IconData? icon;

  const ConfirmationDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmText = 'Confirm',
    this.cancelText = 'Cancel',
    required this.onConfirm,
    this.onCancel,
    this.confirmColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: confirmColor ?? Colors.blue),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Text(title),
          ),
        ],
      ),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            if (onCancel != null) {
              onCancel!();
            }
          },
          child: Text(cancelText),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.of(context).pop();
            onConfirm();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: confirmColor ?? Colors.blue,
          ),
          child: Text(confirmText),
        ),
      ],
    );
  }

  static Future<bool?> show({
    required BuildContext context,
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    Color? confirmColor,
    IconData? icon,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: confirmColor ?? Colors.blue),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(title),
            ),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: confirmColor ?? Colors.blue,
            ),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }

  static Future<bool> showDeleteConfirmation({
    required BuildContext context,
    required String itemName,
    String? additionalMessage,
  }) async {
    final result = await show(
      context: context,
      title: 'Delete $itemName?',
      message: additionalMessage ?? 
          'Are you sure you want to delete this $itemName? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: Colors.red,
      icon: Icons.delete_outline,
    );
    return result ?? false;
  }
}
