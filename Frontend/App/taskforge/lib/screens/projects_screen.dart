// lib/screens/projects_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';
import '../models/project.dart';
import 'tasks_screen.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  @override
  void initState() {
    super.initState();
    // Load projects using BLoC
    context.read<ProjectBloc>().add(LoadProjects());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<ProjectBloc, ProjectState>(
      listener: (context, state) {
        if (state is ProjectError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${state.message}')),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Projects'),
          actions: [
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => _showCreateProjectDialog(),
            ),
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () => context.read<ProjectBloc>().add(LoadProjects()),
            ),
          ],
        ),
        body: BlocBuilder<ProjectBloc, ProjectState>(
          builder: (context, state) {
            if (state is ProjectLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            
            if (state is ProjectError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text('Error: ${state.message}'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context.read<ProjectBloc>().add(LoadProjects()),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              );
            }
            
            if (state is ProjectLoaded) {
              final projects = state.projects;
              
              if (projects.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.folder_outlined, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No projects found'),
                      SizedBox(height: 8),
                      Text('Tap + to create your first project'),
                    ],
                  ),
                );
              }
              
              return RefreshIndicator(
                onRefresh: () async {
                  context.read<ProjectBloc>().add(LoadProjects());
                },
                child: ListView.builder(
                  itemCount: projects.length,
                  itemBuilder: (context, index) {
                    final project = projects[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.primaries[project.id.hashCode % Colors.primaries.length],
                          child: const Icon(Icons.folder, color: Colors.white),
                        ),
                        title: Text(project.name),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (project.description != null)
                              Text(
                                project.description!,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            const SizedBox(height: 4),
                            Text(
                              'Created: ${_formatDate(project.createdAt)}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) => _handleProjectAction(project, value),
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'view_tasks',
                              child: ListTile(
                                leading: Icon(Icons.task_alt),
                                title: Text('View Tasks'),
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
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
                        onTap: () => _showProjectDetails(project),
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

  void _showCreateProjectDialog() {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Project'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Project Name',
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
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.trim().isNotEmpty) {
                context.read<ProjectBloc>().add(CreateProject(
                  name: nameController.text.trim(),
                  description: descriptionController.text.trim().isEmpty 
                      ? null 
                      : descriptionController.text.trim(),
                ));
                Navigator.of(context).pop();
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _showEditProjectDialog(Project project) {
    final nameController = TextEditingController(text: project.name);
    final descriptionController = TextEditingController(text: project.description ?? '');
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Project'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Project Name',
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
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.trim().isNotEmpty) {
                final updates = <String, dynamic>{
                  'name': nameController.text.trim(),
                  'description': descriptionController.text.trim().isEmpty 
                      ? null 
                      : descriptionController.text.trim(),
                };
                context.read<ProjectBloc>().add(UpdateProject(
                  projectId: project.id,
                  updates: updates,
                ));
                Navigator.of(context).pop();
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _showProjectDetails(Project project) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(project.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (project.description != null) ...[
              Text('Description: ${project.description}'),
              const SizedBox(height: 8),
            ],
            Text('Created: ${_formatDate(project.createdAt)}'),
            Text('Updated: ${_formatDate(project.updatedAt)}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => TasksScreen(projectId: project.id),
                ),
              );
            },
            child: const Text('View Tasks'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleProjectAction(Project project, String action) async {
    switch (action) {
      case 'view_tasks':
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => TasksScreen(projectId: project.id),
          ),
        );
        break;
      case 'edit':
        _showEditProjectDialog(project);
        break;
      case 'delete':
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Delete Project'),
            content: Text('Are you sure you want to delete "${project.name}"?'),
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
          context.read<ProjectBloc>().add(DeleteProject(projectId: project.id));
        }
        break;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
