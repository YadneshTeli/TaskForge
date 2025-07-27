// lib/blocs/task/task_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/task_service.dart';
import 'task_event.dart';
import 'task_state.dart';

class TaskBloc extends Bloc<TaskEvent, TaskState> {
  TaskBloc() : super(TaskInitial()) {
    on<LoadTasks>(_onLoadTasks);
    on<CreateTask>(_onCreateTask);
    on<UpdateTask>(_onUpdateTask);
    on<DeleteTask>(_onDeleteTask);
  }

  Future<void> _onLoadTasks(
    LoadTasks event,
    Emitter<TaskState> emit,
  ) async {
    emit(TaskLoading());
    try {
      final tasks = await TaskService.getTasks(projectId: event.projectId);
      emit(TaskLoaded(tasks: tasks));
    } catch (e) {
      emit(TaskError(message: e.toString()));
    }
  }

  Future<void> _onCreateTask(
    CreateTask event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await TaskService.createTask(event.input);
      emit(const TaskOperationSuccess(message: 'Task created successfully'));
      // Reload tasks
      add(LoadTasks(projectId: event.input.projectId));
    } catch (e) {
      emit(TaskError(message: e.toString()));
    }
  }

  Future<void> _onUpdateTask(
    UpdateTask event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await TaskService.updateTask(event.taskId, event.updates);
      emit(const TaskOperationSuccess(message: 'Task updated successfully'));
      // Reload tasks
      add(const LoadTasks());
    } catch (e) {
      emit(TaskError(message: e.toString()));
    }
  }

  Future<void> _onDeleteTask(
    DeleteTask event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await TaskService.deleteTask(event.taskId);
      emit(const TaskOperationSuccess(message: 'Task deleted successfully'));
      // Reload tasks
      add(const LoadTasks());
    } catch (e) {
      emit(TaskError(message: e.toString()));
    }
  }
}
