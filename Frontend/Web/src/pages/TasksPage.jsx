import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  User,
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const tasks = [
    {
      id: 1,
      title: 'Design new dashboard layout',
      description: 'Create wireframes and mockups for the new dashboard',
      project: 'TaskForge Web',
      assignee: 'John Doe',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2025-07-30',
      createdAt: '2025-07-25'
    },
    {
      id: 2,
      title: 'Implement user authentication',
      description: 'Set up JWT authentication for the web application',
      project: 'TaskForge Web',
      assignee: 'Jane Smith',
      priority: 'High',
      status: 'Completed',
      dueDate: '2025-07-29',
      createdAt: '2025-07-20'
    },
    {
      id: 3,
      title: 'Create project management API',
      description: 'Build REST API endpoints for project management',
      project: 'TaskForge Backend',
      assignee: 'Mike Johnson',
      priority: 'Medium',
      status: 'Todo',
      dueDate: '2025-08-02',
      createdAt: '2025-07-26'
    },
    {
      id: 4,
      title: 'Write unit tests',
      description: 'Add comprehensive unit tests for core functionality',
      project: 'TaskForge Backend',
      assignee: 'Sarah Wilson',
      priority: 'Medium',
      status: 'Todo',
      dueDate: '2025-08-05',
      createdAt: '2025-07-27'
    },
    {
      id: 5,
      title: 'Fix mobile responsiveness',
      description: 'Improve mobile layout and touch interactions',
      project: 'TaskForge Web',
      assignee: 'John Doe',
      priority: 'Low',
      status: 'In Progress',
      dueDate: '2025-08-10',
      createdAt: '2025-07-28'
    }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100'
      case 'In Progress': return 'text-blue-600 bg-blue-100'
      case 'Todo': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle2
      case 'In Progress': return Clock
      case 'Todo': return AlertCircle
      default: return Clock
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || task.status.toLowerCase() === selectedFilter
    return matchesSearch && matchesFilter
  })

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'todo', label: 'Todo' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const StatusIcon = getStatusIcon(task.status)
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">
                      <StatusIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Flag className="h-4 w-4" />
                          <span>{task.project}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckCircle2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by creating your first task'
            }
          </p>
          {!searchTerm && selectedFilter === 'all' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default TasksPage
