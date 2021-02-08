// Libraries
import React, {useState, useEffect, useRef, RefObject} from 'react'
import {useDispatch} from 'react-redux'
import 'intersection-observer'

// Actions
import {setScroll, ScrollState, ComponentKey} from 'src/perf/actions'

// TODO: use `onScroll` of clockface scrollable elements once
// https://github.com/influxdata/clockface/issues/523 get merged in
export function useDetectScroll(ref: RefObject<HTMLElement>) {
  const [y, setY] = useState(Infinity)
  const [scroll, setScrollY] = useState<ScrollState>('not scrolled')

  useEffect(() => {
    const current = ref.current
    const observer = new IntersectionObserver(([entry]) => {
      setY(prevY => {
        const newY = entry.boundingClientRect.y
        if (prevY !== newY && prevY !== Infinity) {
          setScrollY('scrolled')
        }

        return newY
      })
    })

    if (current) {
      observer.observe(current)
    }

    return () => {
      observer.unobserve(current)
    }
  }, [ref, y])

  return scroll
}

interface Props {
  component: ComponentKey
}

function ScrollDetector({component}: Props) {
  const ref = useRef(null)
  const dispatch = useDispatch()
  const scroll = useDetectScroll(ref)

  useEffect(() => {
    dispatch(setScroll(component, scroll))
  }, [scroll, component, dispatch])

  return <span ref={ref} />
}

export default ScrollDetector
