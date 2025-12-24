import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export const dashboardTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '[data-tour="stats"]',
        popover: {
          title: 'Dashboard Stats',
          description: 'Get a quick overview of your tasks, projects, and team activity at a glance.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="recent-tasks"]',
        popover: {
          title: 'Recent Tasks',
          description: 'View and manage your most recent tasks here. Click on any task to see details.',
          position: 'top'
        }
      },
      {
        element: '[data-tour="quick-actions"]',
        popover: {
          title: 'Quick Actions',
          description: 'Quickly create new tasks and projects from here.',
          position: 'left'
        }
      },
      {
        element: '[data-tour="nav-projects"]',
        popover: {
          title: 'Projects',
          description: 'Access all your projects and create new ones.',
          position: 'right'
        }
      },
      {
        element: '[data-tour="nav-tasks"]',
        popover: {
          title: 'Tasks',
          description: 'View and manage all your tasks in one place.',
          position: 'right'
        }
      },
      {
        element: '[data-tour="nav-reports"]',
        popover: {
          title: 'Reports & Analytics',
          description: 'Generate insights and track your team\'s productivity.',
          position: 'right'
        }
      },
      {
        element: '[data-tour="user-menu"]',
        popover: {
          title: 'User Menu',
          description: 'Access your profile, settings, and account options.',
          position: 'bottom'
        }
      }
    ],
    onDestroyStarted: () => {
      localStorage.setItem('dashboard-tour-completed', 'true')
      driverObj.destroy()
    }
  })

  driverObj.drive()
}

export const projectsTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '[data-tour="create-project"]',
        popover: {
          title: 'Create Project',
          description: 'Start a new project by clicking here. You can choose from templates or start from scratch.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="project-list"]',
        popover: {
          title: 'Your Projects',
          description: 'All your projects are listed here. Click on any project to view its details.',
          position: 'top'
        }
      },
      {
        element: '[data-tour="project-filters"]',
        popover: {
          title: 'Filter Projects',
          description: 'Use filters to quickly find specific projects by status, priority, or team.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="project-search"]',
        popover: {
          title: 'Search Projects',
          description: 'Search for projects by name or description.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="project-card"]',
        popover: {
          title: 'Project Card',
          description: 'Each card shows project status, progress, and team members. Click for more details.',
          position: 'top'
        }
      },
      {
        element: '[data-tour="project-members"]',
        popover: {
          title: 'Team Members',
          description: 'See who\'s working on each project and invite new members.',
          position: 'left'
        }
      }
    ],
    onDestroyStarted: () => {
      localStorage.setItem('projects-tour-completed', 'true')
      driverObj.destroy()
    }
  })

  driverObj.drive()
}

export const tasksTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '[data-tour="create-task"]',
        popover: {
          title: 'Create Task',
          description: 'Create a new task and assign it to team members.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="task-filters"]',
        popover: {
          title: 'Filter Tasks',
          description: 'Filter tasks by status, priority, assignee, or project.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="task-view"]',
        popover: {
          title: 'Task View',
          description: 'Switch between list and board views to organize your tasks.',
          position: 'bottom'
        }
      },
      {
        element: '[data-tour="task-item"]',
        popover: {
          title: 'Task Details',
          description: 'Click on any task to view full details, add comments, and track progress.',
          position: 'right'
        }
      },
      {
        element: '[data-tour="task-status"]',
        popover: {
          title: 'Change Status',
          description: 'Update task status with a quick click. Options: To Do, In Progress, Done.',
          position: 'left'
        }
      },
      {
        element: '[data-tour="task-priority"]',
        popover: {
          title: 'Set Priority',
          description: 'Mark tasks as Low, Medium, High, or Urgent to organize your work.',
          position: 'left'
        }
      },
      {
        element: '[data-tour="task-assignee"]',
        popover: {
          title: 'Assign Tasks',
          description: 'Assign tasks to team members or take ownership yourself.',
          position: 'left'
        }
      }
    ],
    onDestroyStarted: () => {
      localStorage.setItem('tasks-tour-completed', 'true')
      driverObj.destroy()
    }
  })

  driverObj.drive()
}
