import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Users, Briefcase, Code, Eye } from 'lucide-react'

const roles = [
  {
    id: 'admin',
    label: 'Administrator',
    description: 'Full access to all features and settings',
    icon: Briefcase
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Manage projects and team members',
    icon: Users
  },
  {
    id: 'developer',
    label: 'Developer',
    description: 'Work on tasks and projects',
    icon: Code
  },
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'View projects and tasks',
    icon: Eye
  }
]

export default function WelcomeStep({ data, onDataChange }) {
  const handleRoleChange = (role) => {
    onDataChange({ role })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to TaskForge! 🎉
        </h2>
        <p className="text-gray-600">
          Let's get you set up in just a few steps
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">
          What's your role in the team?
        </Label>
        
        <RadioGroup
          value={data.role}
          onValueChange={handleRoleChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div key={role.id} className="relative">
                <RadioGroupItem
                  value={role.id}
                  id={role.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={role.id}
                  className="flex flex-col items-start space-y-2 rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {role.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {role.description}
                  </p>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {!data.role && (
        <p className="text-sm text-amber-600 text-center">
          Please select your role to continue
        </p>
      )}
    </div>
  )
}
