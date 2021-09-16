// Libraries
import React, {FC, useState, useCallback, useEffect, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {parse, format_from_js_file} from '@influxdata/flux-lsp-browser'

// Components
import {
  resourceLimitReached,
  taskCreatedSuccess,
  taskNotCreated,
  taskUpdateSuccess,
  taskUpdateFailed,
} from 'src/shared/copy/notifications'
import {ASSET_LIMIT_ERROR_STATUS} from 'src/cloud/constants/index'
import {postTask, patchTask} from 'src/client'

// Types
import {Task} from 'src/types'

// Actions
import {getTasks} from 'src/tasks/actions/thunks'
import {notify} from 'src/shared/actions/notifications'
import {checkTaskLimits} from 'src/cloud/actions/limits'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getErrorMessage} from 'src/utils/api'
import {getOrg} from 'src/organizations/selectors'
import {remove} from 'src/shared/contexts/query'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

export enum ExportAsTask {
  Create = 'create',
  Update = 'update',
}

interface ContextType {
  script: string
  submit: () => void
  activeTab: ExportAsTask
  handleSetActiveTab: (tab: ExportAsTask) => void
  selectedTask: Task | undefined
  handleSetTask: (task: Task) => void
  taskName: string
  handleSetTaskName: (name: string) => void
}

const DEFAULT_CONTEXT: ContextType = {
  script: '',
  submit: () => {},
  activeTab: ExportAsTask.Create,
  handleSetActiveTab: _ => {},
  selectedTask: undefined,
  handleSetTask: _ => {},
  taskName: '',
  handleSetTaskName: _ => {},
}

export const Context = React.createContext<ContextType>(DEFAULT_CONTEXT)

interface Props {
  type: string
}
export const Provider: FC<Props> = ({type, children}) => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const [activeTab, setActiveTab] = useState(ExportAsTask.Create)
  const [selectedTask, setSelectedTask] = useState<Task>(undefined)
  const [query, setQuery] = useState<string>('')
  const [taskName, setTaskName] = useState<string>('')
  const {data, closeFn} = useContext(PopupContext)

  const _taskName =
    activeTab === ExportAsTask.Create ? taskName : selectedTask?.name
  const script = query

  useEffect(() => {
    const ast = parse(data?.query ?? '')
    const params = remove(
      ast,
      node =>
        node.type === 'OptionStatement' && node.assignment.id.name === 'task'
    ).reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        _acc[_curr.key.name] = _curr.value.location.source
        return _acc
      }, acc)

      return acc
    }, {})

    if (!_taskName) {
      if (activeTab === ExportAsTask.Create) {
        setTaskName(
          (params.name || '').replace(/^"(.*)"$/, '$1') || 'Name this Task'
        )
      }
    } else {
      params.name = `"${_taskName || 'Name this task'}"`
    }

    const paramString = Object.entries(params)
      .map(([key, val]) => `${key}: ${val}`)
      .join(',\n')
    const header = parse(`option task = {${paramString}}\n`)
    ast.body.unshift(header.body[0])

    setQuery(format_from_js_file(ast))
  }, [_taskName, data.query])

  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  const handleSetActiveTab = useCallback((tab: ExportAsTask): void => {
    setActiveTab(tab)
  }, [])

  const handleSetTask = useCallback((task: Task): void => {
    setSelectedTask(task)
  }, [])

  const handleSetTaskName = useCallback((name: string): void => {
    setTaskName(name)
  }, [])

  const validateForm = (): boolean => {
    if (activeTab === ExportAsTask.Create) {
      if (taskName === '') {
        return false
      }

      return true
    }

    if (!selectedTask?.name) {
      return false
    }

    return true
  }

  const submit = async () => {
    if (!validateForm()) {
      return
    }

    if (activeTab === ExportAsTask.Create) {
      event('Export Task Completed', {exportType: 'create', from: type})

      try {
        const resp = await postTask({data: {orgID: org.id, flux: script}})
        if (resp.status !== 201) {
          throw new Error(resp.data.message)
        }

        dispatch(notify(taskCreatedSuccess()))
        dispatch(checkTaskLimits())
      } catch (error) {
        if (error?.response?.status === ASSET_LIMIT_ERROR_STATUS) {
          dispatch(notify(resourceLimitReached('tasks')))
        } else {
          const message = getErrorMessage(error)
          dispatch(notify(taskNotCreated(message)))
        }
      }
    } else {
      event('Export Task Completed', {exportType: 'update', from: type})

      // TODO: get these values from the query and not the data store
      try {
        const resp = await patchTask({
          taskID: selectedTask.id,
          data: {
            ...selectedTask,
            every: data.interval,
            offset: data.offset || '0s',
            flux: script,
          },
        })

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        dispatch(notify(taskUpdateSuccess()))
      } catch (e) {
        const message = getErrorMessage(e)
        dispatch(notify(taskUpdateFailed(message)))
      }
    }

    closeFn()
  }

  return (
    <Context.Provider
      value={{
        script,
        submit,
        activeTab,
        handleSetActiveTab,
        selectedTask,
        handleSetTask,
        taskName,
        handleSetTaskName,
      }}
    >
      {children}
    </Context.Provider>
  )
}
