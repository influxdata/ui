import React, {FC, createContext, useState} from 'react'
import {ControlSection} from 'src/types/flows'

interface ContextType {
  id: string
  controls: ControlSection[]
  show: (id: string, controls?: ControlSection[]) => void
  hide: () => void
}

const DEFAULT_CONTEXT: ContextType = {
  id: '',
  controls: [],
  show: (_) => {},
  hide: () => {}
}

export const Context = createContext<ContextType>(DEFAULT_CONTEXT)

export const Provider: FC = ({ children }) => {
  const [focused, setFocused] = useState('')
  const [controls, setControls] = useState([])

  const show = (id: string, controls = []) => {
    setFocused(id)
    setControls(controls)
  }

  const hide = () => {
    setFocused('')
    setControls([])
  }

  return (
    <Context.Provider value={{
      id: focused,
      controls,
      show,
      hide
      }}>
      {children}
    </Context.Provider>
  )
}
