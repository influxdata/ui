import {useEffect} from 'react'

export const useEvent = (
  event: string,
  handler: EventListener,
  passive: boolean = false
) => {
  useEffect(() => {
    window.addEventListener(event, handler, passive)
    return () => window.removeEventListener(event, handler)
  })
}

export const sendEvent = (
  eventStorageKey: string,
  eventStorageValue?: string
) => {
  localStorage.setItem(eventStorageKey, eventStorageValue ?? eventStorageKey)
  localStorage.removeItem(eventStorageKey)
}
