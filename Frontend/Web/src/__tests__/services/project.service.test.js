import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import ProjectService from '../../services/project.service'
import api from '../../lib/api'

jest.mock('../../lib/api')

describe('ProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllProjects', () => {
    test('should fetch all projects successfully', async () => {
      const mockProjects = {
        projects: [
          { _id: '1', name: 'Test Project 1', description: 'Description 1' },
          { _id: '2', name: 'Test Project 2', description: 'Description 2' },
        ]
      }

      api.get.mockResolvedValue({ data: mockProjects })

      const result = await ProjectService.getAllProjects()

      expect(api.get).toHaveBeenCalledWith('/projects/all')
      expect(result).toEqual(mockProjects)
      expect(result.projects).toHaveLength(2)
    })

    test('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch projects'
      api.get.mockRejectedValue(new Error(errorMessage))

      await expect(ProjectService.getAllProjects()).rejects.toThrow(errorMessage)
    })
  })

  describe('getProject', () => {
    test('should fetch a single project by ID', async () => {
      const mockProject = { _id: '1', name: 'Test Project', description: 'Test Description' }
      api.get.mockResolvedValue({ data: mockProject })

      const result = await ProjectService.getProject('1')

      expect(api.get).toHaveBeenCalledWith('/projects/1')
      expect(result).toEqual(mockProject)
    })
  })

  describe('createProject', () => {
    test('should create a new project', async () => {
      const projectData = { name: 'New Project', description: 'New Description' }
      const mockResponse = { _id: '3', ...projectData }

      api.post.mockResolvedValue({ data: mockResponse })

      const result = await ProjectService.createProject(projectData)

      expect(api.post).toHaveBeenCalledWith('/projects/create', projectData)
      expect(result).toEqual(mockResponse)
      expect(result._id).toBe('3')
    })

    test('should handle validation errors', async () => {
      const invalidData = { name: '' }
      const errorResponse = { response: { data: { message: 'Name is required' } } }

      api.post.mockRejectedValue(errorResponse)

      await expect(ProjectService.createProject(invalidData)).rejects.toEqual(errorResponse)
    })
  })

  describe('updateProject', () => {
    test('should update an existing project', async () => {
      const updates = { name: 'Updated Project' }
      const mockResponse = { _id: '1', ...updates }

      api.put.mockResolvedValue({ data: mockResponse })

      const result = await ProjectService.updateProject('1', updates)

      expect(api.put).toHaveBeenCalledWith('/projects/1', updates)
      expect(result.name).toBe('Updated Project')
    })
  })

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const mockResponse = { message: 'Project deleted successfully' }
      api.delete.mockResolvedValue({ data: mockResponse })

      const result = await ProjectService.deleteProject('1')

      expect(api.delete).toHaveBeenCalledWith('/projects/1')
      expect(result.message).toBe('Project deleted successfully')
    })
  })

  describe('addMember', () => {
    test('should add a member to project', async () => {
      const memberData = { userId: 1, role: 'member' }
      const mockResponse = { message: 'Member added successfully' }

      api.post.mockResolvedValue({ data: mockResponse })

      const result = await ProjectService.addMember('1', memberData)

      expect(api.post).toHaveBeenCalledWith('/projects/1/members', memberData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getProjectAnalytics', () => {
    test('should fetch project analytics', async () => {
      const mockAnalytics = {
        totalTasks: 10,
        completedTasks: 5,
        completionRate: 50
      }

      api.get.mockResolvedValue({ data: mockAnalytics })

      const result = await ProjectService.getProjectAnalytics('1')

      expect(api.get).toHaveBeenCalledWith('/projects/1/analytics')
      expect(result.totalTasks).toBe(10)
      expect(result.completionRate).toBe(50)
    })
  })
})
