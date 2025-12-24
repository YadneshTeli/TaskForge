import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Rocket, CheckCircle2, Users, BarChart3, Bell } from 'lucide-react'

const features = [
  {
    icon: CheckCircle2,
    title: 'Create & Manage Tasks',
    description: 'Organize your work with powerful task management'
  },
  {
    icon: Users,
    title: 'Collaborate with Team',
    description: 'Invite members and work together seamlessly'
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Monitor project health with real-time analytics'
  },
  {
    icon: Bell,
    title: 'Stay Updated',
    description: 'Get notified about important changes'
  }
]

export default function TutorialIntroStep({ data, onDataChange }) {
  const handlePreferenceChange = (key, value) => {
    const updatedPreferences = {
      ...data.preferences,
      [key]: value
    }
    onDataChange({ preferences: updatedPreferences })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Rocket className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          You're All Set! 🎉
        </h2>
        <p className="text-gray-600">
          Here's what you can do with TaskForge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="p-2 bg-white rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label className="text-base font-semibold">Quick Preferences</Label>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifications"
              checked={data.preferences?.notifications !== false}
              onCheckedChange={(checked) =>
                handlePreferenceChange('notifications', checked)
              }
            />
            <label
              htmlFor="notifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Enable in-app notifications
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailNotifications"
              checked={data.preferences?.emailNotifications !== false}
              onCheckedChange={(checked) =>
                handlePreferenceChange('emailNotifications', checked)
              }
            />
            <label
              htmlFor="emailNotifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Receive email notifications
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">🎓 Want a quick tour?</span>
          <br />
          We'll show you around once you're inside!
        </p>
      </div>
    </div>
  )
}
