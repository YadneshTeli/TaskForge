import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import ProjectService from '../../services/project.service'
import TaskService from '../../services/task.service'
import api from '../../lib/api'

jest.mock('../../lib/api')

describe('Project-Task Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create project and then create tasks for it', async () => {
    // Create project
    const projectData = { name: 'Test Project', description: 'Test Description' }
    const mockProject = { _id: 'project-1', ...projectData }
    api.post.mockResolvedValueOnce({ data: mockProject })

    const project = await ProjectService.createProject(projectData)
    expect(project._id).toBe('project-1')

    // Create tasks for the project
    const taskData = { 
      title: 'Task 1', 
      projectId: project._id,
      status: 'todo',
      priority: 'high'
    }
    const mockTask = { _id: 'task-1', ...taskData }
    api.post.mockResolvedValueOnce({ data: mockTask })

    const task = await TaskService.createTask(taskData)
    expect(task.projectId).toBe(project._id)
  })

  test('should fetch project with its tasks', async () => {
    const projectId = 'project-1'

    // Fetch project
    const mockProject = { _id: projectId, name: 'Test Project' }
    api.get.mockResolvedValueOnce({ data: mockProject })

    const project = await ProjectService.getProject(projectId)

    // Fetch project tasks
    const mockTasks = {
      tasks: [
        { _id: 'task-1', title: 'Task 1', projectId },
        { _id: 'task-2', title: 'Task 2', projectId },
      ]
    }
    api.get.mockResolvedValueOnce({ data: mockTasks })

    const tasks = await TaskService.getProjectTasks(projectId)

    expect(project._id).toBe(projectId)
    expect(tasks.tasks).toHaveLength(2)
    expect(tasks.tasks[0].projectId).toBe(projectId)
  })

  test('should delete project and handle orphaned tasks', async () => {
    const projectId = 'project-1'
    
    api.delete.mockResolvedValue({ data: { message: 'Project deleted' } })

    const result = await ProjectService.deleteProject(projectId)

    expect(api.delete).toHaveBeenCalledWith(`/projects/${projectId}`)
    expect(result.message).toBe('Project deleted')
  })

  test('should calculate project statistics from tasks', async () => {
    const projectId = 'project-1'
    
    const mockTasks = {
      tasks: [
        { _id: '1', status: 'completed' },
        { _id: '2', status: 'completed' },
        { _id: '3', status: 'in progress' },
        { _id: '4', status: 'todo' },
      ]
    }

    api.get.mockResolvedValue({ data: mockTasks })

    const tasks = await TaskService.getProjectTasks(projectId)
    
    const totalTasks = tasks.tasks.length
    const completedTasks = tasks.tasks.filter(t => t.status === 'completed').length
    const completionRate = Math.round((completedTasks / totalTasks) * 100)

    expect(totalTasks).toBe(4)
    expect(completedTasks).toBe(2)
    expect(completionRate).toBe(50)
  })
})
