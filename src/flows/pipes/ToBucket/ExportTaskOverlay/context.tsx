// Libraries
import React, {
  FC,
  useState,
  useCallback,
  useEffect,
  useContext,
  ChangeEvent,
} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {InputRef} from '@influxdata/clockface'

// Types
import {Task} from 'src/types'

// Actions
import {getTasks, saveNewScript, updateTask} from 'src/tasks/actions/thunks'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {formatQueryText} from 'src/flows/shared/utils'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

export enum ExportAsTask {
  Create = 'create',
  Update = 'update',
}

interface ContextType {
  submit: () => void
  activeTab: ExportAsTask
  handleSetActiveTab: (tab: ExportAsTask) => void
  handleSetTask: (task: Task) => void
  handleInputChange: (e: ChangeEvent<InputRef>) => void
  interval: string
  intervalError: string
  selectedTask: Task | undefined
  selectedTaskError: string
  taskName: string
  taskNameError: string
}

const DEFAULT_CONTEXT: ContextType = {
  submit: () => {},
  activeTab: ExportAsTask.Create,
  handleSetActiveTab: () => {},
  handleSetTask: () => {},
  handleInputChange: () => {},
  interval: '',
  intervalError: '',
  selectedTask: undefined,
  selectedTaskError: '',
  taskName: '',
  taskNameError: '',
}

export const Context = React.createContext<ContextType>(DEFAULT_CONTEXT)

export const Provider: FC = ({children}) => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState(ExportAsTask.Create)
  const [selectedTask, setSelectedTask] = useState<Task>(undefined)
  const [selectedTaskError, setSelectedTaskError] = useState<string>('')
  const [taskName, setTaskName] = useState<string>('')
  const [taskNameError, setTaskNameError] = useState<string>('')
  const [interval, setInterval] = useState<string>('')
  const [intervalError, setIntervalError] = useState<string>('')
  const {data, closeFn} = useContext(PopupContext)

  const script = formatQueryText(data.query)

  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  const handleCreateTask = () => {
    event('notebook_export_task', {exportType: 'create'})

    const taskOption: string = `option task = { \n  name: "${taskName}",\n  every: ${interval},\n  offset: 0s\n}`
    const variable: string = `option v = {\n  timeRangeStart: -${interval},\n  timeRangeStop: now()\n}`
    const preamble = `${variable}\n\n${taskOption}`

    dispatch(saveNewScript(script, preamble))
  }

  const handleUpdateTask = () => {
    event('notebook_export_task', {exportType: 'update'})

    const taskOption: string = `option task = { \n  name: "${selectedTask.name}",\n  every: ${interval},\n  offset: 0s\n}`
    const variable: string = `option v = {\n  timeRangeStart: -${interval},\n  timeRangeStop: now()\n}`
    const preamble = `${variable}\n\n${taskOption}`

    dispatch(
      updateTask({
        script,
        preamble,
        interval,
        task: selectedTask,
      })
    )
  }

  const handleSetActiveTab = useCallback((tab: ExportAsTask): void => {
    setActiveTab(tab)
    setTaskNameError('')
    setIntervalError('')
  }, [])

  const handleSetTask = useCallback((task: Task): void => {
    setSelectedTask(task)
    setSelectedTaskError('')
  }, [])

  const validateTimeValue = (value: string): boolean => {
    if (value === '') {
      return false
    }

    const cleanValue = value.match(/(?:(\d+(y|mo|s|m|w|h){1}))/g)?.join('')

    return value !== cleanValue
  }

  const handleInputChange = (e: ChangeEvent<InputRef>): void => {
    const {name, value} = e.target

    if (name === 'interval') {
      setInterval(value)
      if (value === '') {
        setIntervalError('Cannot be empty')
      } else if (validateTimeValue(value)) {
        setIntervalError('Invalid time')
      } else {
        setIntervalError('')
      }
    }

    if (name === 'taskName') {
      setTaskName(value)

      if (value === '') {
        setTaskNameError('Cannot be empty')
      } else {
        setTaskNameError('')
      }
    }
  }

  const validateCreateForm = (): boolean => {
    let formIsValid = true
    if (taskName === '') {
      setTaskNameError('Cannot be empty')
      formIsValid = false
    } else {
      setTaskNameError('')
    }

    if (interval === '') {
      setIntervalError('Cannot be empty')
      formIsValid = false
    } else if (validateTimeValue(interval)) {
      setIntervalError('Invalid time')
      formIsValid = false
    } else {
      setIntervalError('')
    }

    return formIsValid
  }

  const validateUpdateForm = (): boolean => {
    let formIsValid = true

    if (interval === '') {
      setIntervalError('Cannot be empty')
      formIsValid = false
    } else if (validateTimeValue(interval)) {
      setIntervalError('Invalid time')
      formIsValid = false
    } else {
      setIntervalError('')
    }

    if (!selectedTask?.name) {
      setSelectedTaskError('Please choose a task')
      formIsValid = false
    } else {
      setSelectedTaskError('')
    }

    return formIsValid
  }

  const validateForm = (): boolean => {
    if (activeTab === ExportAsTask.Create) {
      return validateCreateForm()
    }

    return validateUpdateForm()
  }

  const submit = (): void => {
    const formIsValid = validateForm()

    if (!formIsValid) {
      return
    }

    if (activeTab === ExportAsTask.Create) {
      handleCreateTask()
    } else {
      handleUpdateTask()
    }

    closeFn()
  }

  return (
    <Context.Provider
      value={{
        submit,
        activeTab,
        handleSetActiveTab,
        handleSetTask,
        handleInputChange,
        interval,
        intervalError,
        selectedTask,
        selectedTaskError,
        taskName,
        taskNameError,
      }}
    >
      {children}
    </Context.Provider>
  )
}
