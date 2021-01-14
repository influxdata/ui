// Libraries
import React, {FC, useState, createContext} from 'react'

// Utils
import {event} from 'src/cloud/utils/reporting'

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

  const handleSetRunMode = (mode: RunMode): void => {
    event('change_notebook_run_mode', {runMode: mode})
    setRunMode(mode)
  }

  return (
    <RunModeContext.Provider value={{runMode, setRunMode: handleSetRunMode}}>
      {children}
    </RunModeContext.Provider>
  )
}

export default RunModeProvider
