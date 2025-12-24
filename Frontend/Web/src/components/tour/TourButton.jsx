import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export default function TourButton({ onStartTour }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onStartTour}
      className="gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Take a Tour
    </Button>
  )
}
