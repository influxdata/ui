import React, {FC, createContext, useContext, useState} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {ControlSection, Submenu} from 'src/types/flows'

interface ContextType {
  id: string
  menu: ControlSection[]
  submenu?: Submenu['menu']
  show: (id: string) => void
  hide: () => void
  showSub: (menu: Submenu['menu']) => void
  hideSub: () => void
  register: (id: string, menu: ControlSection[]) => void
}

const DEFAULT_CONTEXT: ContextType = {
  id: '',
  menu: [],
  show: _ => {},
  hide: () => {},
  showSub: _ => {},
  hideSub: () => {},
  register: (_, __) => {},
}

export const SidebarContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const SidebarProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const [focused, setFocused] = useState('')
  const [pipes, setPipes] = useState({})
  const [sub, setSub] = useState(false as Submenu['menu'] | null)

  const show = (id: string) => {
    if (!flow.data.allIDs.includes(id)) {
      return
    }

    if (id === focused) {
      return
    }

    setFocused(id)
    if (sub) {
      setSub(false)
    }
  }

  const hide = () => {
    setFocused('')
  }

  const register = (id: string, menu: ControlSection[]) => {
    if (!pipes[id] || pipes[id] !== menu) {
      pipes[id] = menu || []
      setPipes({
        ...pipes,
      })
    }
  }

  const showSub = (menu: Submenu['menu']) => {
    setSub(menu)
  }

  const hideSub = () => {
    setSub(false)
    setFocused('')
  }

  const menu = pipes[focused] || []

  return (
    <SidebarContext.Provider
      value={{
        id: focused,
        menu,
        submenu: sub,
        show,
        hide,
        showSub,
        hideSub,
        register,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
