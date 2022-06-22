import React, {FC, createContext, ReactNode, useState} from 'react'

interface ContextType {
  visible: boolean
  menu: ReactNode

  setVisible: (visibility: boolean) => void
  launch: (menu: ReactNode) => void
  clear: () => void
}

const DEFAULT_CONTEXT = {
  visible: true,
  menu: null,

  setVisible: _ => {},
  launch: _ => {},
  clear: () => {},
}

export const SidebarContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const SidebarProvider: FC = ({children}) => {
  const [visible, setVisible] = useState<boolean>(DEFAULT_CONTEXT.visible)
  const [menu, setMenu] = useState<ReactNode>(DEFAULT_CONTEXT.menu)

  return (
    <SidebarContext.Provider
      value={{
        visible,
        menu,
        setVisible: (visible: boolean) => {
          setMenu(null)
          setVisible(visible)
        },
        launch: (menu: ReactNode) => {
          setMenu(menu)
        },
        clear: () => {
          setMenu(null)
        },
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
