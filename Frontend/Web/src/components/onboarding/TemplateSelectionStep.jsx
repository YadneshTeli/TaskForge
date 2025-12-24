import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Zap, Kanban, Bug, Rocket, LayoutGrid } from 'lucide-react'

const templates = [
  {
    id: 'blank',
    label: 'Blank Project',
    description: 'Start from scratch with an empty project',
    icon: LayoutGrid
  },
  {
    id: 'kanban',
    label: 'Kanban Board',
    description: 'Visual workflow with To Do, In Progress, Done',
    icon: Kanban
  },
  {
    id: 'scrum',
    label: 'Scrum Sprint',
    description: 'Agile project with sprints and backlogs',
    icon: Zap
  },
  {
    id: 'bug-tracking',
    label: 'Bug Tracking',
    description: 'Track and resolve bugs efficiently',
    icon: Bug
  },
  {
    id: 'product-launch',
    label: 'Product Launch',
    description: 'Plan and execute product launches',
    icon: Rocket
  }
]

export default function TemplateSelectionStep({ data, onDataChange }) {
  const handleTemplateChange = (template) => {
    onDataChange({ projectTemplate: template })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your First Project Template
        </h2>
        <p className="text-gray-600">
          Select a template to get started quickly, or start from scratch
        </p>
      </div>

      <div className="space-y-4">
        <RadioGroup
          value={data.projectTemplate}
          onValueChange={handleTemplateChange}
          className="space-y-3"
        >
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <div key={template.id} className="relative">
                <RadioGroupItem
                  value={template.id}
                  id={template.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={template.id}
                  className="flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {template.label}
                    </div>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  </div>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      <div className="text-center text-sm text-gray-500">
        Don't worry, you can create more projects later
      </div>
    </div>
  )
}
