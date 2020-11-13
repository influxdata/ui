import React, {FC, ReactElement, useState, useContext} from 'react'

interface PopupContextType {
  launch: (element: React.ReactNode, data: any) => void
  data: any
  element: ReactElement<any, any> | null
  closeFn: () => void
}

const DEFAULT_CONTEXT: PopupContextType = {
  launch: () => {},
  data: null,
  element: null,
  closeFn: () => {},
}

export const PopupContext = React.createContext<PopupContextType>(
  DEFAULT_CONTEXT
)

export const PopupDrawer: FC = () => {
  const {element} = useContext(PopupContext)

  if (!element) {
    return null
  }

  return element
}

export const PopupProvider: FC = ({children}) => {
  const [element, setElement] = useState(null)
  const [data, setData] = useState(null)

  const launch = (_element, _data) => {
    setElement(_element)
    setData(_data)
  }
  const closeFn = () => {
    setElement(null)
    setData(null)
  }

  return (
    <PopupContext.Provider
      value={{
        launch,
        data,
        element,
        closeFn,
      }}
    >
      {children}
    </PopupContext.Provider>
  )
}
