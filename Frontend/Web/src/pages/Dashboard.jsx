import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toaster'
import ProjectService from '@/services/project.service'
import TaskService from '@/services/task.service'
import { 
  CheckSquare, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeProjects: 0,
    pendingTasks: 0,
    completionRate: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load projects
      const projectsData = await ProjectService.getAllProjects()
      const projectsList = projectsData.projects || projectsData || []
      setProjects(projectsList)

      // Load tasks from all projects
      let allTasks = []
      for (const project of projectsList) {
        try {
          const projectTasks = await TaskService.getProjectTasks(project._id)
          const tasksArray = projectTasks.tasks || projectTasks || []
          allTasks.push(...tasksArray.map(task => ({
            ...task,
            projectName: project.name
          })))
        } catch (err) {
          console.error(`Failed to load tasks for project ${project._id}:`, err)
        }
      }

      // Calculate stats
      const totalTasks = allTasks.length
      const activeProjects = projectsList.filter(p => p.status?.toLowerCase() === 'active').length
      const pendingTasks = allTasks.filter(t => t.status?.toLowerCase() === 'todo' || t.status?.toLowerCase() === 'in progress').length
      const completedTasks = allTasks.filter(t => t.status?.toLowerCase() === 'completed').length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      setStats({
        totalTasks,
        activeProjects,
        pendingTasks,
        completionRate
      })

      // Get recent tasks (sort by creation date)
      const sortedTasks = allTasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
      setRecentTasks(sortedTasks)

    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase() || ''
    switch (priorityLower) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || ''
    switch (statusLower) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in progress': return 'text-blue-600 bg-blue-100'
      case 'todo': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const statsCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks.toString(),
      icon: CheckSquare,
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      icon: Users,
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks.toString(),
      icon: Clock,
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Your latest task activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-500">{task.project}</p>
                      <p className="text-xs text-gray-400">Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <CheckSquare className="h-4 w-4" />
                <span>Create Task</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Users className="h-4 w-4" />
                <span>New Project</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span>View Reports</span>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">{task.projectName}</p>
                        <p className="text-xs text-gray-400">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No recent tasks found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button 
                onClick={() => window.location.href = '/tasks'}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Create Task</span>
              </button>
              <button 
                onClick={() => window.location.href = '/projects'}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>New Project</span>
              </button>
              <button 
                onClick={() => window.location.href = '/reports'}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Reports</span>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.slice(0, 3).map(project => (
                  <div key={project._id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600">
                        {project.members?.length || 0} members • {project.stats?.totalTasks || 0} tasks
                      </p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No projects yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
