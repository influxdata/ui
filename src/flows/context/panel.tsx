import React, {FC, useMemo, useState} from 'react'

export interface CopyToClipboardContextType {
  setVisibility: (_: boolean) => void
  visible: boolean
}

export const DEFAULT_CONTEXT: CopyToClipboardContextType = {
  setVisibility: (_: boolean) => {},
  visible: false,
}

export const CopyToClipboardContext = React.createContext<
  CopyToClipboardContextType
>(DEFAULT_CONTEXT)

export const CopyToClipboardProvider: FC = ({children}) => {
  const [visible, setVisibility] = useState(false)

  return useMemo(() => {
    return (
      <CopyToClipboardContext.Provider
        value={{
          visible,
          setVisibility,
        }}
      >
        {children}
      </CopyToClipboardContext.Provider>
    )
  }, [visible, setVisibility, children])
}
