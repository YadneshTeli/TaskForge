import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Building2 } from 'lucide-react'

export default function TeamSetupStep({ data, onDataChange }) {
  const [teamName, setTeamName] = useState(data.teamName || '')
  const [teamDescription, setTeamDescription] = useState('')

  const handleTeamNameChange = (e) => {
    const value = e.target.value
    setTeamName(value)
    onDataChange({ teamName: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Create Your Workspace
        </h2>
        <p className="text-gray-600">
          Set up your team workspace or skip to join an existing one later
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teamName">
            Workspace Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="teamName"
            placeholder="e.g., Acme Corp, Marketing Team"
            value={teamName}
            onChange={handleTeamNameChange}
            className="text-lg"
          />
          <p className="text-xs text-gray-500">
            This will be the name of your main workspace
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamDescription">
            Description (Optional)
          </Label>
          <Textarea
            id="teamDescription"
            placeholder="What does your team do?"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> You can always change
            this later or join an existing workspace
          </p>
        </div>
      </div>
    </div>
  )
}
