import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WelcomeStep from './WelcomeStep'
import TeamSetupStep from './TeamSetupStep'
import TemplateSelectionStep from './TemplateSelectionStep'
import InviteTeamStep from './InviteTeamStep'
import TutorialIntroStep from './TutorialIntroStep'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'

/* global process */
const API_BASE_URL = process.env.VITE_API_URL || 'http://10.72.125.97:4000/api'

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    teamName: '',
    projectTemplate: '',
    preferences: {
      notifications: true,
      emailNotifications: true,
      theme: 'light'
    },
    invites: []
  })

  const steps = [
    { component: WelcomeStep, title: 'Welcome', canSkip: false },
    { component: TeamSetupStep, title: 'Team Setup', canSkip: true },
    { component: TemplateSelectionStep, title: 'Choose Template', canSkip: true },
    { component: InviteTeamStep, title: 'Invite Team', canSkip: true },
    { component: TutorialIntroStep, title: 'Get Started', canSkip: false }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (steps[currentStep].canSkip) {
      handleNext()
    }
  }

  const handleDataChange = (data) => {
    setOnboardingData((prev) => ({ ...prev, ...data }))
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Complete onboarding on backend
      await axios.post(
        `${API_BASE_URL}/users/complete-onboarding`,
        {
          role: onboardingData.role,
          teamName: onboardingData.teamName,
          preferences: onboardingData.preferences
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Send invites if any
      if (onboardingData.invites.length > 0) {
        await Promise.all(
          onboardingData.invites.map((invite) =>
            axios.post(
              `${API_BASE_URL}/users/invite`,
              invite,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            )
          )
        )
      }

      // Redirect to dashboard
      navigate('/dashboard', { state: { onboardingComplete: true } })
    } catch (error) {
      console.error('Onboarding completion failed:', error)
      // Still redirect to dashboard even if there's an error
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const CurrentStepComponent = steps[currentStep].component
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 ${index !== steps.length - 1 ? 'mr-2' : ''}`}
                >
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      index <= currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep].title}</span>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="min-h-[400px]">
            <CurrentStepComponent
              data={onboardingData}
              onDataChange={handleDataChange}
              onNext={handleNext}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep || loading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {steps[currentStep].canSkip && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? (
                  'Completing...'
                ) : isLastStep ? (
                  'Complete'
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
