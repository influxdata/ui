import React, {FC, createContext, useContext, useState} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {ControlSection} from 'src/types/flows'
import {PIPE_DEFINITIONS} from 'src/flows'

interface ContextType {
  id: string
  menu: ControlSection[]
  show: (id: string) => void
  hide: () => void
}

const DEFAULT_CONTEXT: ContextType = {
  id: '',
  menu: [],
  show: _ => {},
  hide: () => {},
}

export const Context = createContext<ContextType>(DEFAULT_CONTEXT)

export const Provider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const [focused, setFocused] = useState('')
  const [menu, setMenu] = useState([])

  const show = (id: string) => {
    if (flow.data.indexOf(id) === -1) {
      return
    }

    setFocused(id)
    setMenu(PIPE_DEFINITIONS[flow.data.get(id).type].menu || [])
  }

  const hide = () => {
    setFocused('')
    setMenu([])
  }

  return (
    <Context.Provider
      value={{
        id: focused,
        menu,
        show,
        hide,
      }}
    >
      {children}
    </Context.Provider>
  )
}
