import React, {
  FC,
  useContext,
  useMemo,
  useCallback,
  createContext,
  useState,
} from 'react'
import {PipeData, FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {RemoteDataState, TimeRange} from 'src/types'

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
