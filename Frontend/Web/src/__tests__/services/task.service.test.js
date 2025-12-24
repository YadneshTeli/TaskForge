import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import TaskService from '../../services/task.service'
import api from '../../lib/api'

jest.mock('../../lib/api')

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProjectTasks', () => {
    test('should fetch all tasks for a project', async () => {
      const mockTasks = {
        tasks: [
          { _id: '1', title: 'Task 1', status: 'todo' },
          { _id: '2', title: 'Task 2', status: 'in progress' },
        ]
      }

      api.get.mockResolvedValue({ data: mockTasks })

      const result = await TaskService.getProjectTasks('project-1')

      expect(api.get).toHaveBeenCalledWith('/tasks/project/project-1')
      expect(result).toEqual(mockTasks)
      expect(result.tasks).toHaveLength(2)
    })
  })

  describe('createTask', () => {
    test('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        projectId: 'project-1',
        priority: 'high',
        status: 'todo'
      }
      const mockResponse = { _id: 'task-1', ...taskData }

      api.post.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.createTask(taskData)

      expect(api.post).toHaveBeenCalledWith('/tasks', taskData)
      expect(result.title).toBe('New Task')
      expect(result.priority).toBe('high')
    })

    test('should handle missing required fields', async () => {
      const invalidData = { title: '' }
      const errorResponse = {
        response: { data: { message: 'Title is required' } }
      }

      api.post.mockRejectedValue(errorResponse)

      await expect(TaskService.createTask(invalidData)).rejects.toEqual(errorResponse)
    })
  })

  describe('updateTask', () => {
    test('should update task status', async () => {
      const updates = { status: 'completed' }
      const mockResponse = { _id: 'task-1', status: 'completed' }

      api.put.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.updateTask('task-1', updates)

      expect(api.put).toHaveBeenCalledWith('/tasks/task-1', updates)
      expect(result.status).toBe('completed')
    })

    test('should update task priority', async () => {
      const updates = { priority: 'low' }
      const mockResponse = { _id: 'task-1', priority: 'low' }

      api.put.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.updateTask('task-1', updates)

      expect(result.priority).toBe('low')
    })
  })

  describe('deleteTask', () => {
    test('should delete a task', async () => {
      const mockResponse = { message: 'Task deleted successfully' }
      api.delete.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.deleteTask('task-1')

      expect(api.delete).toHaveBeenCalledWith('/tasks/task-1')
      expect(result.message).toBe('Task deleted successfully')
    })
  })

  describe('updateTaskStatus', () => {
    test('should update task status', async () => {
      const mockResponse = { _id: 'task-1', status: 'in progress' }
      api.patch.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.updateTaskStatus('task-1', 'in progress')

      expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/status', { status: 'in progress' })
      expect(result.status).toBe('in progress')
    })
  })

  describe('assignTask', () => {
    test('should assign task to a user', async () => {
      const mockResponse = { _id: 'task-1', assignedTo: 1 }
      api.patch.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.assignTask('task-1', 1)

      expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/assign', { userId: 1 })
      expect(result.assignedTo).toBe(1)
    })
  })

  describe('getMyTasks', () => {
    test('should fetch tasks assigned to current user', async () => {
      const mockTasks = [
        { _id: '1', title: 'My Task 1' },
        { _id: '2', title: 'My Task 2' },
      ]

      api.get.mockResolvedValue({ data: mockTasks })

      const result = await TaskService.getMyTasks()

      expect(api.get).toHaveBeenCalledWith('/tasks/my-tasks')
      expect(result).toHaveLength(2)
    })
  })
})
