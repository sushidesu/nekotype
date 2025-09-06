import { useState, useCallback } from "react"

export function useFeedback() {
  const [isActive, setIsActive] = useState(false)

  const showFeedback = useCallback(() => {
    setIsActive(true)
    setTimeout(() => {
      setIsActive(false)
    }, 1000)
  }, [])

  return [isActive, showFeedback] as const
}
