// Libraries
import React, {FC, useState, createContext} from 'react'

export enum RunMode {
  Run = 'Run',
  Preview = 'Preview',
}

interface RunModeContextType {
  runMode: RunMode
  setRunMode: (runMode: RunMode) => void
}

const DEFAULT_RUN_MODE_CONTEXT = {
  runMode: RunMode.Preview,
  setRunMode: () => {},
}

export const RunModeContext = createContext<RunModeContextType>(
  DEFAULT_RUN_MODE_CONTEXT
)

export const RunModeProvider: FC = ({children}) => {
  const [runMode, setRunMode] = useState<RunMode>(RunMode.Preview)

  return (
    <RunModeContext.Provider value={{runMode, setRunMode}}>
      {children}
    </RunModeContext.Provider>
  )
}

export default RunModeProvider
