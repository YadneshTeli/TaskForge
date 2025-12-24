import { useEffect } from 'react'
import { dashboardTour, projectsTour, tasksTour } from './tourSteps'

export function useTour(tourName) {
  const tours = {
    dashboard: dashboardTour,
    projects: projectsTour,
    tasks: tasksTour
  }

  const startTour = () => {
    const tourFunction = tours[tourName]
    if (tourFunction) {
      tourFunction()
    }
  }

  const shouldShowTour = () => {
    const tourCompleted = localStorage.getItem(`${tourName}-tour-completed`)
    return !tourCompleted
  }

  const resetTour = () => {
    localStorage.removeItem(`${tourName}-tour-completed`)
  }

  useEffect(() => {
    // Auto-start tour on first visit
    if (shouldShowTour()) {
      const timeout = setTimeout(() => {
        startTour()
      }, 1000) // Wait 1 second after page load

      return () => clearTimeout(timeout)
    }
  }, [tourName])

  return {
    startTour,
    shouldShowTour,
    resetTour
  }
}
