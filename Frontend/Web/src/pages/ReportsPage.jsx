import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  CheckSquare,
  Clock,
  Target
} from 'lucide-react'

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const metrics = [
    {
      title: 'Total Tasks Completed',
      value: '142',
      change: '+12%',
      changeType: 'positive',
      icon: CheckSquare,
      description: 'Tasks completed this month'
    },
    {
      title: 'Average Completion Time',
      value: '3.2 days',
      change: '-8%',
      changeType: 'positive',
      icon: Clock,
      description: 'Average time to complete tasks'
    },
    {
      title: 'Team Productivity',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Overall team efficiency score'
    },
    {
      title: 'Project Success Rate',
      value: '94%',
      change: '+2%',
      changeType: 'positive',
      icon: Target,
      description: 'Projects completed on time'
    }
  ]

  const teamPerformance = [
    { name: 'John Doe', tasksCompleted: 28, efficiency: 92 },
    { name: 'Jane Smith', tasksCompleted: 24, efficiency: 89 },
    { name: 'Mike Johnson', tasksCompleted: 22, efficiency: 85 },
    { name: 'Sarah Wilson', tasksCompleted: 20, efficiency: 91 },
    { name: 'Alex Brown', tasksCompleted: 18, efficiency: 87 }
  ]

  const projectStatus = [
    { name: 'TaskForge Web', progress: 75, status: 'On Track' },
    { name: 'Mobile App', progress: 60, status: 'On Track' },
    { name: 'API Documentation', progress: 90, status: 'Ahead' },
    { name: 'Performance Optimization', progress: 25, status: 'Behind' }
  ]

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                    )}
                    {metric.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Performance</span>
            </CardTitle>
            <CardDescription>
              Individual team member productivity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member, index) => (
                <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.tasksCompleted} tasks completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{member.efficiency}%</p>
                    <p className="text-sm text-gray-500">efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Project Status</span>
            </CardTitle>
            <CardDescription>
              Current progress and status of active projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectStatus.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{project.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{project.progress}%</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'On Track' ? 'text-green-600 bg-green-100' :
                        project.status === 'Ahead' ? 'text-blue-600 bg-blue-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        project.status === 'On Track' ? 'bg-green-600' :
                        project.status === 'Ahead' ? 'bg-blue-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
            <CardDescription>
              Daily task completion over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Chart component would go here</p>
                <p className="text-sm">Integration with recharts or similar library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>
              Tasks by priority and status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Pie chart component would go here</p>
                <p className="text-sm">Integration with recharts or similar library</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Download detailed reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>PDF Report</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>CSV Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Excel Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsPage
