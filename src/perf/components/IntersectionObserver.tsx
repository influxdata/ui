import {useEffect} from 'react'

const listenerCallbacks = new WeakMap()

let observer

function handleIntersections(entries) {
  entries.forEach(entry => {
    if (listenerCallbacks.has(entry.target)) {
      const cb = listenerCallbacks.get(entry.target)

      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        observer.unobserve(entry.target)
        listenerCallbacks.delete(entry.target)
        cb()
      }
    }
  })
}

function getIntersectionObserver() {
  if (observer === undefined) {
    observer = new IntersectionObserver(handleIntersections, {
      rootMargin: '100px',
      threshold: 0.15,
    })
  }
  return observer
}

export function useIntersection(elem, callback) {
  useEffect(() => {
    const target = elem.current
    const observer = getIntersectionObserver()
    listenerCallbacks.set(target, callback)
    observer.observe(target)

    return () => {
      listenerCallbacks.delete(target)
      observer.unobserve(target)
    }
  }, [])
}
