import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, X, Mail } from 'lucide-react'

export default function InviteTeamStep({ data, onDataChange }) {
  const [invites, setInvites] = useState(data.invites || [])
  const [currentEmail, setCurrentEmail] = useState('')
  const [currentRole, setCurrentRole] = useState('member')

  const handleAddInvite = () => {
    if (!currentEmail.trim()) return

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(currentEmail)) {
      alert('Please enter a valid email address')
      return
    }

    const newInvite = {
      email: currentEmail,
      role: currentRole
    }

    const updatedInvites = [...invites, newInvite]
    setInvites(updatedInvites)
    onDataChange({ invites: updatedInvites })
    
    setCurrentEmail('')
    setCurrentRole('member')
  }

  const handleRemoveInvite = (index) => {
    const updatedInvites = invites.filter((_, i) => i !== index)
    setInvites(updatedInvites)
    onDataChange({ invites: updatedInvites })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddInvite()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Invite Your Team
        </h2>
        <p className="text-gray-600">
          Collaborate better by inviting your team members now or skip to do it later
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="email" className="sr-only">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="w-32">
            <Select value={currentRole} onValueChange={setCurrentRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddInvite} type="button">
            <Mail className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {invites.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Team Invitations ({invites.length})
            </Label>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {invites.map((invite, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">
                        {invite.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invite.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {invite.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInvite(index)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {invites.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No invitations yet. Add team members above.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Invited members will
            receive an email with instructions to join your workspace
          </p>
        </div>
      </div>
    </div>
  )
}
