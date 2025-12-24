# TaskForge Flutter Widgets

A comprehensive collection of reusable Flutter widgets for the TaskForge project management app.

## 📦 Available Widgets

### Core Task & Project Widgets

#### `CreateTaskDialog`
A dialog for creating new tasks with validation.
- **Features**: Title, description, priority selection, validation
- **Usage**: 
```dart
showDialog(
  context: context,
  builder: (context) => CreateTaskDialog(
    projectId: projectId,
    onTaskCreated: (task) {
      // Handle task creation
    },
  ),
);
```

#### `ProjectCreateDialog`
A dialog for creating new projects with form validation.
- **Features**: Project name, description, validation, loading states
- **Usage**:
```dart
showDialog(
  context: context,
  builder: (context) => ProjectCreateDialog(
    onProjectCreated: (project) {
      // Handle project creation
    },
  ),
);
```

#### `TaskCard`
Displays task information in a card format.
- **Features**: Task title, description, status, priority
- **Usage**: See `lib/widgets/task_card.dart`

#### `TaskDetailsScreen`
Full screen view for task details with edit/delete capabilities.
- **Features**: Complete task info, comments, attachments, actions

#### `TaskAnalyticsWidget`
Widget for displaying task-related analytics and statistics.

---

### UI State Widgets

#### `EmptyStateWidget`
Display when no data is available with optional action button.
- **Features**: Custom icon, title, message, action button
- **Usage**:
```dart
EmptyStateWidget(
  icon: Icons.folder_outlined,
  title: 'No Projects Yet',
  message: 'Create your first project to get started',
  actionLabel: 'Create Project',
  onActionPressed: () => _showCreateDialog(),
)
```

#### `LoadingWidget`
Consistent loading indicator with optional message.
- **Features**: Circular progress indicator, optional loading message
- **Usage**:
```dart
LoadingWidget(
  message: 'Loading projects...',
  showMessage: true,
)
```

#### `LoadingOverlay`
Overlay that covers content during loading operations.
- **Usage**:
```dart
LoadingOverlay(
  isLoading: _isLoading,
  message: 'Processing...',
  child: YourContent(),
)
```

#### `ErrorDisplayWidget`
Comprehensive error display with retry functionality.
- **Features**: Error icon, message, details, retry button
- **Usage**:
```dart
ErrorDisplayWidget(
  message: 'Failed to load projects',
  details: errorDetails,
  onRetry: () => _loadProjects(),
)
```

#### `ErrorBanner`
Inline error banner for form errors or notifications.
- **Usage**:
```dart
ErrorBanner(
  message: 'Failed to save changes',
  onDismiss: () => _clearError(),
)
```

---

### Form & Input Widgets

#### `CustomTextField`
Enhanced TextField with consistent styling.
- **Features**: Prefix/suffix icons, validation, multiple lines support
- **Usage**:
```dart
CustomTextField(
  controller: _controller,
  label: 'Email',
  hint: 'Enter your email',
  prefixIcon: Icons.email,
  keyboardType: TextInputType.emailAddress,
  validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
)
```

#### `CustomButton`
Consistent button styling with loading states.
- **Features**: Loading indicator, icon support, outlined variant
- **Usage**:
```dart
CustomButton(
  label: 'Save',
  icon: Icons.save,
  isLoading: _isSaving,
  onPressed: () => _save(),
)
```

#### `SearchBarWidget`
Search input with debounce functionality.
- **Features**: Debounced search, clear button, custom hint
- **Usage**:
```dart
SearchBarWidget(
  hintText: 'Search tasks...',
  onSearch: (query) => _performSearch(query),
  debounceTime: Duration(milliseconds: 500),
)
```

#### `FileUploadWidget`
File picker with preview and validation.
- **Features**: File selection, preview, size display, clear button
- **Usage**:
```dart
FileUploadWidget(
  onFileSelected: (file) => _handleFile(file),
  allowedExtensions: ['pdf', 'doc', 'docx'],
  buttonLabel: 'Upload Document',
)
```

#### `ImageUploadWidget`
Image picker with preview.
- **Features**: Image selection, thumbnail preview, clear button
- **Usage**:
```dart
ImageUploadWidget(
  onImageSelected: (image) => _handleImage(image),
  buttonLabel: 'Choose Profile Picture',
)
```

---

### Dialog & Modal Widgets

#### `ConfirmationDialog`
Reusable confirmation dialog for actions.
- **Features**: Custom title, message, icon, colors
- **Usage**:
```dart
final confirmed = await ConfirmationDialog.show(
  context: context,
  title: 'Delete Item',
  message: 'Are you sure?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  confirmColor: Colors.red,
  icon: Icons.delete,
);
```

**Static Helper**:
```dart
final confirmed = await ConfirmationDialog.showDeleteConfirmation(
  context: context,
  itemName: 'project',
  additionalMessage: 'This will delete all tasks too.',
);
```

---

### User & Profile Widgets

#### `UserAvatar`
Circular avatar with initials or image.
- **Features**: User initials, profile picture, color generation
- **Usage**:
```dart
UserAvatar(
  user: currentUser,
  radius: 30,
)
```

#### `UserAvatarWithName`
Avatar with user name and email display.
- **Usage**:
```dart
UserAvatarWithName(
  user: currentUser,
  avatarRadius: 20,
)
```

---

### Badge & Status Widgets

#### `StatusBadge`
Badge displaying task status with color coding.
- **Features**: Color-coded status, icon, label
- **Usage**:
```dart
StatusBadge(
  status: TaskStatus.inProgress,
  showLabel: true,
)
```

**Status Colors**:
- `todo` - Grey
- `inProgress` - Blue
- `done` - Green
- `blocked` - Red
- `review` - Orange

#### `PriorityBadge`
Badge displaying task priority with color coding.
- **Features**: Color-coded priority, icon, label
- **Usage**:
```dart
PriorityBadge(
  priority: TaskPriority.high,
  showLabel: true,
)
```

**Priority Colors**:
- `low` - Green
- `medium` - Orange
- `high` - Red
- `critical` - Purple

---

### Information Display Widgets

#### `InfoCard`
Card displaying key information with icon and optional action.
- **Features**: Title, value, icon, custom color, tap action
- **Usage**:
```dart
InfoCard(
  title: 'Total Tasks',
  value: '25',
  icon: Icons.task_alt,
  color: Colors.blue,
  onTap: () => _viewTasks(),
)
```

#### `StatCard`
Statistics card for dashboard displays.
- **Features**: Label, value, icon, color-coded
- **Usage**:
```dart
StatCard(
  label: 'Completed',
  value: '18',
  icon: Icons.check_circle,
  color: Colors.green,
)
```

---

### Utility Widgets

#### `QuickTestButton`
Development/testing utility button.
- **Features**: Quick access to test features (debug mode only)

---

## 🎨 Design Principles

All widgets follow these design principles:

1. **Consistency**: Unified color schemes, spacing, and typography
2. **Accessibility**: Proper contrast ratios and readable fonts
3. **Responsiveness**: Adapt to different screen sizes
4. **Material Design 3**: Follow latest Material Design guidelines
5. **Reusability**: Configurable through parameters
6. **Type Safety**: Strong typing with Dart models

---

## 📁 Widget Organization

```
lib/widgets/
├── index.dart                      # Export all widgets
├── task_card.dart                  # Task display card
├── create_task_dialog.dart         # Task creation dialog
├── task_details_screen.dart        # Task details view
├── task_analytics_widget.dart      # Task analytics
├── project_create_dialog.dart      # Project creation dialog
├── empty_state_widget.dart         # Empty state display
├── loading_widget.dart             # Loading indicators
├── error_display_widget.dart       # Error handling
├── file_upload_widget.dart         # File/image upload
├── confirmation_dialog.dart        # Confirmation dialogs
├── user_avatar.dart                # User avatars
├── search_bar_widget.dart          # Search functionality
├── status_badge.dart               # Status & priority badges
├── custom_text_field.dart          # Custom form fields
├── info_card.dart                  # Information cards
└── quick_test_button.dart          # Testing utilities
```

---

## 🔧 Usage Best Practices

### Importing Widgets

Use the index file for cleaner imports:

```dart
import '../widgets/index.dart';  // Imports all widgets
```

Or import specific widgets:

```dart
import '../widgets/empty_state_widget.dart';
import '../widgets/loading_widget.dart';
```

### Error Handling

Always wrap async operations with proper error handling:

```dart
try {
  final data = await fetchData();
  // Success
} catch (e) {
  if (mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: $e')),
    );
  }
}
```

### Loading States

Show loading indicators during async operations:

```dart
setState(() => _isLoading = true);
try {
  await operation();
} finally {
  if (mounted) {
    setState(() => _isLoading = false);
  }
}
```

### Form Validation

Use validators for all user inputs:

```dart
validator: (value) {
  if (value == null || value.trim().isEmpty) {
    return 'This field is required';
  }
  if (value.length < 3) {
    return 'Must be at least 3 characters';
  }
  return null;
}
```

---

## 🚀 Future Enhancements

Potential widget additions:

- [ ] `DateRangePicker` - Date range selection
- [ ] `ChartWidget` - Data visualization
- [ ] `TimelineWidget` - Activity timeline
- [ ] `FilterChip` - Filtering options
- [ ] `TabsWidget` - Tabbed navigation
- [ ] `BottomSheetWidget` - Modal bottom sheets
- [ ] `TooltipWidget` - Contextual help
- [ ] `ProgressBar` - Linear progress indicators
- [ ] `RatingWidget` - Star ratings
- [ ] `CommentWidget` - Comment display

---

## 📝 Contributing

When adding new widgets:

1. Create the widget file in `lib/widgets/`
2. Add proper documentation with examples
3. Export it in `lib/widgets/index.dart`
4. Follow existing naming conventions
5. Include usage examples in this README
6. Ensure proper error handling
7. Add appropriate comments in code

---

## 📄 License

This widget library is part of the TaskForge project and follows the same license.

---

**Last Updated**: December 24, 2024  
**Total Widgets**: 24
