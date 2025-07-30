import { useEffect, useCallback } from 'react'

export const useKeyboardShortcut = (keys, callback, node = null) => {
  // Implement the callback ref pattern
  const callbackRef = useCallback(callback, [callback])

  // Handle what happens on key press
  const handleKeyPress = useCallback(
    (event) => {
      // Check if pressed key is our target key
      if (keys.some((key) => event.key === key)) {
        // Check for modifier keys
        const modifierPressed = event.ctrlKey || event.metaKey || event.altKey
        
        // Only trigger if no modifiers are pressed (unless specified)
        if (!modifierPressed || keys.includes('ctrl') && event.ctrlKey || keys.includes('alt') && event.altKey) {
          event.preventDefault()
          callbackRef(event)
        }
      }
    },
    [keys, callbackRef]
  )

  useEffect(() => {
    // Target is either the provided node or the document
    const targetNode = node ?? document
    // Attach the event listener
    if (targetNode) {
      targetNode.addEventListener('keydown', handleKeyPress)

      // Remove event listener on cleanup
      return () => {
        targetNode.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [handleKeyPress, node])
}

export default useKeyboardShortcut
