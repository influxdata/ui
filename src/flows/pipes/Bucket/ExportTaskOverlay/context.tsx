import React, {FC, useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Task} from 'src/types'
import {getTasks} from 'src/tasks/actions/thunks'

export enum ExportAsTask {
  Create = 'create',
  Update = 'update',
}

interface ContextType {
  activeTab: ExportAsTask
  canSubmit: () => boolean
  handleSetActiveTab: (tab: ExportAsTask) => void
  handleSetError: (value: boolean) => void
  handleSetEveryInterval: (value: string) => void
  handleSetTask: (task: Task) => void
  handleSetTaskName: (value: string) => void
  hasError: boolean
  interval: string
  selectedTask: Task | undefined
  taskName: string
}

const DEFAULT_CONTEXT: ContextType = {
  activeTab: ExportAsTask.Create,
  canSubmit: () => false,
  handleSetActiveTab: () => {},
  handleSetError: () => {},
  handleSetEveryInterval: () => {},
  handleSetTask: () => {},
  handleSetTaskName: () => {},
  hasError: false,
  interval: '',
  selectedTask: undefined,
  taskName: '',
}

export const Context = React.createContext<ContextType>(DEFAULT_CONTEXT)

export const Provider: FC = ({children}) => {
  const [activeTab, setActiveTab] = useState(ExportAsTask.Create)
  const [selectedTask, setTask] = useState<Task>(undefined)
  const [hasError, setHasError] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [interval, setEveryInterval] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  const handleSetActiveTab = useCallback((tab: ExportAsTask): void => {
    setActiveTab(tab)
  }, [])

  const handleSetError = useCallback((value: boolean): void => {
    setHasError(value)
  }, [])

  const handleSetEveryInterval = useCallback(
    (value: string): void => {
      if (hasError) {
        setHasError(false)
      }
      setEveryInterval(value)
    },
    [hasError]
  )

  const handleSetTaskName = useCallback(
    (value: string): void => {
      if (hasError) {
        setHasError(false)
      }
      setTaskName(value)
    },
    [hasError]
  )

  const handleSetTask = useCallback(
    (task: Task): void => {
      if (hasError) {
        setHasError(false)
      }
      setTask(task)
    },
    [hasError]
  )

  const canSubmit = useCallback(() => {
    if (activeTab === ExportAsTask.Create) {
      return !!taskName && interval !== ''
    }
    return interval !== '' && !!selectedTask?.name
  }, [activeTab, taskName, interval, selectedTask])

  return (
    <Context.Provider
      value={{
        activeTab,
        canSubmit,
        handleSetActiveTab,
        handleSetError,
        handleSetEveryInterval,
        handleSetTask,
        handleSetTaskName,
        hasError,
        interval,
        selectedTask,
        taskName,
      }}
    >
      {children}
    </Context.Provider>
  )
}
