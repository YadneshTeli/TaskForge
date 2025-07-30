import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const stats = [
    {
      title: 'Total Tasks',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: CheckSquare,
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+4.3%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Pending Tasks',
      value: '12',
      change: '-2.1%',
      changeType: 'negative',
      icon: Clock,
    },
    {
      title: 'Completion Rate',
      value: '78%',
      change: '+5.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  const recentTasks = [
    {
      id: 1,
      title: 'Design new dashboard layout',
      project: 'TaskForge Web',
      priority: 'High',
      dueDate: '2025-07-30',
      status: 'In Progress'
    },
    {
      id: 2,
      title: 'Implement user authentication',
      project: 'TaskForge Web',
      priority: 'High',
      dueDate: '2025-07-29',
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Create project management API',
      project: 'TaskForge Backend',
      priority: 'Medium',
      dueDate: '2025-08-02',
      status: 'Todo'
    },
    {
      id: 4,
      title: 'Write unit tests',
      project: 'TaskForge Backend',
      priority: 'Medium',
      dueDate: '2025-08-05',
      status: 'Todo'
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
        {stats.map((stat) => {
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
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
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
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      3 tasks overdue
                    </p>
                    <p className="text-xs text-red-600">
                      Review and update deadlines
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      5 tasks due today
                    </p>
                    <p className="text-xs text-yellow-600">
                      Focus on high priority items
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
