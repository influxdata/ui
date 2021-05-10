import React, {FC, createContext, useContext, useState} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {ControlSection} from 'src/types/flows'

interface ContextType {
  id: string
  menu: ControlSection[]
  show: (id: string) => void
  hide: () => void
  register: (id: string, menu: ControlSection[]) => void
  deregister: (id: string) => void
}

const DEFAULT_CONTEXT: ContextType = {
  id: '',
  menu: [],
  show: _ => {},
  hide: () => {},
  register: (_, __) => {},
  deregister: (_) => {}
}

export const Context = createContext<ContextType>(DEFAULT_CONTEXT)

export const Provider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const [focused, setFocused] = useState('')
  const [menu, setMenu] = useState([])
  const [pipes, setPipes] = useState({})

  const show = (id: string) => {
    if (flow.data.indexOf(id) === -1) {
      return
    }

    setFocused(id)
    setMenu(pipes[id] || [])
  }

  const hide = () => {
    setFocused('')
    setMenu([])
  }

  const register = (id: string, menu: ControlSection[]) => {
    pipes[id] = menu || []
    setPipes({
      ...pipes
    })
  }

  const deregister = (id: string) => {
    if (!pipes[id]) {
      return
    }

    delete pipes[id]
    setPipes({
      ...pipes
    })
  }

  return (
    <Context.Provider
      value={{
        id: focused,
        menu,
        show,
        hide,
        register,
        deregister
      }}
    >
      {children}
    </Context.Provider>
  )
}
