import React, {FC, useMemo, useState} from 'react'

export interface CopyToClipboardContextType {
  setVisibility: (_: boolean) => void
  visible: boolean
  contentID: string
  setContentID: (_: string) => void
  query: string
  setQuery: (_: string) => void
}

export const DEFAULT_CONTEXT: CopyToClipboardContextType = {
  setVisibility: (_: boolean) => {},
  visible: false,
  contentID: null,
  query: null,
  setQuery: (_: string) => {},
  setContentID: (_: string) => {},
}

export const CopyToClipboardContext = React.createContext<
  CopyToClipboardContextType
>(DEFAULT_CONTEXT)

export const CopyToClipboardProvider: FC = ({children}) => {
  const [visible, setVisibility] = useState(false)
  const [contentID, setContentID] = useState(null)
  const [query, setQuery] = useState(null)

  return useMemo(() => {
    return (
      <CopyToClipboardContext.Provider
        value={{
          visible,
          setVisibility,
          contentID,
          setContentID,
          query,
          setQuery,
        }}
      >
        {children}
      </CopyToClipboardContext.Provider>
    )
  }, [visible, setVisibility, children, contentID, query])
}
