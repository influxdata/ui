// Libraries
import {push, goBack, RouterAction} from 'connected-react-router'
import {Dispatch} from 'react'
import {normalize} from 'normalizr'

// APIs
import * as api from 'src/client'
import {createResourceFromPkgerTemplate} from 'src/templates/api'

// Schemas
import {taskSchema, arrayOfTasks} from 'src/schemas/tasks'

// Actions
import {notify, Action as NotifyAction} from 'src/shared/actions/notifications'
import {
  addTask,
  setTasks,
  editTask,
  setCurrentTask,
  setAllTaskOptions,
  setRuns,
  setLogs,
  clearTask,
  removeTask,
  setNewScript,
  clearCurrentTask,
  TaskPage,
  Action as TaskAction,
} from 'src/tasks/actions/creators'

// Constants
import * as copy from 'src/shared/copy/notifications'
import {
  parse,
  format_from_js_file,
} from 'src/languageSupport/languages/flux/parser'

// Types
import {
  Label,
  Task,
  GetState,
  TaskSchedule,
  RemoteDataState,
  TaskEntities,
  ResourceType,
} from 'src/types'

import {GetTasksParams} from 'src/client'

// Utils
import {getErrorMessage} from 'src/utils/api'
import {insertPreambleInScript} from 'src/shared/utils/insertPreambleInScript'
import {isLimitError} from 'src/cloud/utils/limits'
import {checkTaskLimits} from 'src/cloud/actions/limits'
import {getOrg} from 'src/organizations/selectors'
import {getStatus} from 'src/resources/selectors'
import {setCloneName} from 'src/utils/naming'
import {event} from 'src/cloud/utils/reporting'

// Types
import {TASK_LIMIT} from 'src/resources/constants'

type Action = TaskAction | ExternalActions | ReturnType<typeof getTasks>
type ExternalActions = NotifyAction | ReturnType<typeof checkTaskLimits>

const fetchTasks = async (query: GetTasksParams['query']) => {
  const resp = await api.getTasks({query})

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  return resp
}

// Thunks
export const getTasks = (limit: number = TASK_LIMIT) => async (
  dispatch: Dispatch<TaskAction | NotifyAction>,
  getState: GetState
): Promise<void> => {
  try {
    const state = getState()
    if (getStatus(state, ResourceType.Tasks) === RemoteDataState.NotStarted) {
      dispatch(setTasks(RemoteDataState.Loading))
    }

    const org = getOrg(state)

    const query: GetTasksParams['query'] = {orgID: org.id, limit}
    const resp = await fetchTasks(query)

    const tasks = normalize<Task, TaskEntities, string[]>(
      resp.data.tasks,
      arrayOfTasks
    )

    dispatch(setTasks(RemoteDataState.Done, tasks))
  } catch (error) {
    dispatch(setTasks(RemoteDataState.Error))
    const message = getErrorMessage(error)
    console.error(error)
    dispatch(notify(copy.tasksFetchFailed(message)))
  }
}

export const getAllTasks = (name?: string) => async (
  dispatch: Dispatch<TaskAction | NotifyAction>,
  getState: GetState
): Promise<void> => {
  try {
    const state = getState()
    if (getStatus(state, ResourceType.Tasks) === RemoteDataState.NotStarted) {
      dispatch(setTasks(RemoteDataState.Loading))
    }
    const org = getOrg(state)

    // fetching 500 tasks at once strikes a balance between large requests and many requests
    const limit = 500
    const query: GetTasksParams['query'] = {orgID: org.id, limit}
    // filter by tasks with a particular name, if provided
    if (name) {
      query.name = name
    }
    const resp = await fetchTasks(query)

    let nonNormalizedTasks = resp.data.tasks
    let next = resp.data?.links?.next
    while (next && next.includes('after=')) {
      const afterAndExtras = next.split('after=')
      if (afterAndExtras.length < 2) {
        break
      }

      const after = afterAndExtras[1].split('&')[0]
      if (!after) {
        break
      }

      query.after = after
      const resp = await api.getTasks({query})
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      nonNormalizedTasks = [...nonNormalizedTasks, ...resp.data.tasks]
      next = resp.data.links.next
    }

    const tasks = normalize<Task, TaskEntities, string[]>(
      nonNormalizedTasks,
      arrayOfTasks
    )

    dispatch(setTasks(RemoteDataState.Done, tasks))
  } catch (error) {
    dispatch(setTasks(RemoteDataState.Error))
    const message = getErrorMessage(error)
    console.error(error)
    dispatch(notify(copy.tasksFetchFailed(message)))
  }
}

export const addTaskLabel = (taskID: string, label: Label) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const postResp = await api.postTasksLabel({
      taskID,
      data: {labelID: label.id},
    })

    if (postResp.status !== 201) {
      throw new Error(postResp.data.message)
    }

    const resp = await api.getTask({taskID})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const task = normalize<Task, TaskEntities, string>(resp.data, taskSchema)

    dispatch(editTask(task))
  } catch (error) {
    console.error(error)
    dispatch(notify(copy.addTaskLabelFailed()))
  }
}

export const deleteTaskLabel = (taskID: string, label: Label) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const deleteResp = await api.deleteTasksLabel({taskID, labelID: label.id})
    if (deleteResp.status !== 204) {
      throw new Error(deleteResp.data.message)
    }

    const resp = await api.getTask({taskID})
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const task = normalize<Task, TaskEntities, string>(resp.data, taskSchema)

    dispatch(editTask(task))
  } catch (error) {
    console.error(error)
    dispatch(notify(copy.removeTaskLabelFailed()))
  }
}

export const updateTaskStatus = (task: Task) => async (
  dispatch: Dispatch<Action>
) => {
  try {
    const resp = await api.patchTask({
      taskID: task.id,
      data: {status: task.status},
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const normTask = normalize<Task, TaskEntities, string>(
      resp.data,
      taskSchema
    )

    dispatch(editTask(normTask))
    dispatch(setCurrentTask(normTask))
    dispatch(notify(copy.taskUpdateSuccess(task.name)))
  } catch (e) {
    console.error(e)
    const message = getErrorMessage(e)
    dispatch(notify(copy.taskUpdateFailed(message, task.name)))
  }
}

export const updateTaskName = (name: string, taskID: string) => async (
  dispatch: Dispatch<Action>
) => {
  try {
    const resp = await api.patchTask({taskID, data: {name}})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const normTask = normalize<Task, TaskEntities, string>(
      resp.data,
      taskSchema
    )

    dispatch(editTask(normTask))
    dispatch(notify(copy.taskUpdateSuccess(name)))
  } catch (e) {
    console.error(e)
    const message = getErrorMessage(e)
    dispatch(notify(copy.taskUpdateFailed(message, name)))
  }
}

type UpdateTaskParams = {
  script: string
  preamble: string
  task: Task
  interval: string
}

export const updateTask = ({
  script,
  interval,
  preamble,
  task,
}: UpdateTaskParams) => async (dispatch: Dispatch<Action>) => {
  try {
    const fluxScript = await insertPreambleInScript(script, preamble)
    const resp = await api.patchTask({
      taskID: task.id,
      data: {...task, offset: '0s', every: interval, flux: fluxScript},
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(notify(copy.taskUpdateSuccess()))
  } catch (e) {
    console.error(e)
    const message = getErrorMessage(e)
    dispatch(notify(copy.taskUpdateFailed(message)))
  }
}

export const deleteTask = (taskID: string) => async (
  dispatch: Dispatch<Action>
) => {
  try {
    const resp = await api.deleteTask({taskID})

    if (resp.status !== 204) {
      throw new Error(resp.data.message)
    }

    dispatch(removeTask(taskID))
    dispatch(notify(copy.taskDeleteSuccess()))
  } catch (e) {
    console.error(e)
    const message = getErrorMessage(e)
    dispatch(notify(copy.taskDeleteFailed(message)))
  }
}

const cloneTaskLabels = (sourceTask: Task, destinationTask: Task) => async (
  dispatch: Dispatch<Action>
) => {
  try {
    const pendingLabels = sourceTask.labels.map(labelID =>
      api.postTasksLabel({
        taskID: destinationTask.id,
        data: {labelID},
      })
    )

    const mappedLabels = await Promise.all(pendingLabels)

    if (
      mappedLabels.length &&
      mappedLabels.some(label => label.status !== 201)
    ) {
      throw new Error('An error occurred cloning the labels for this task')
    }

    dispatch(notify(copy.taskCloneSuccess(sourceTask.name)))
  } catch {
    dispatch(notify(copy.addTaskLabelFailed()))
  }
}

const refreshTask = (task: Task) => async (dispatch: Dispatch<Action>) => {
  try {
    const response = await api.getTask({
      taskID: task.id,
    })

    if (response.status !== 200) {
      throw new Error(response.data.message)
    }

    const refreshedTask = response.data

    const normTask = normalize<Task, TaskEntities, string>(
      refreshedTask,
      taskSchema
    )
    dispatch(addTask(normTask))
  } catch {
    dispatch(notify(copy.taskNotFound(task.name)))
  }
}

export const cloneTask = (task: Task) => async (dispatch: Dispatch<Action>) => {
  let newTask: Task

  try {
    const resp = await api.getTask({taskID: task.id})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const taskName = resp.data.name
    const clonedName = setCloneName(taskName)
    const {flux} = resp.data

    const ast = parse(flux)

    ast.body = ast.body.map(statement => {
      if (
        statement.type === 'OptionStatement' &&
        statement.assignment.type === 'VariableAssignment' &&
        statement.assignment.id.name === 'task' &&
        statement.assignment.init.type === 'ObjectExpression'
      ) {
        statement.assignment.init.properties = statement.assignment.init?.properties.map(
          property => {
            if (
              property.key.type === 'Identifier' &&
              property.key.name === 'name' &&
              property?.value?.location?.source
            ) {
              property.value.location.source = `"${clonedName}"`
            }
            return property
          }
        )
      }
      return statement
    })

    const fluxWithNewName = format_from_js_file(ast)

    const newTaskResponse = await api.postTask({
      data: {
        ...resp.data,
        flux: fluxWithNewName,
      },
    })

    if (newTaskResponse.status !== 201) {
      throw new Error(newTaskResponse.data.message)
    }

    newTask = newTaskResponse.data as Task

    dispatch(checkTaskLimits())
  } catch (error) {
    console.error(error)
    if (isLimitError(error)) {
      dispatch(notify(copy.resourceLimitReached('tasks')))
    } else {
      const message = getErrorMessage(error)
      dispatch(notify(copy.taskCloneFailed(task.name, message)))
    }
  }

  // clone the labels
  cloneTaskLabels(task, newTask)(dispatch)

  // get the updated task
  refreshTask(newTask)(dispatch)
}

export const selectTaskByID = (id: string) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const resp = await api.getTask({taskID: id})
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const task = normalize<Task, TaskEntities, string>(resp.data, taskSchema)

    dispatch(setCurrentTask(task))
  } catch (error) {
    console.error(error)
    dispatch(goToTasks())
    const message = getErrorMessage(error)
    dispatch(notify(copy.taskNotFound(message)))
  }
}

export const setAllTaskOptionsByID = (taskID: string) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const resp = await api.getTask({taskID})
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const task = normalize<Task, TaskEntities, string>(resp.data, taskSchema)

    dispatch(setAllTaskOptions(task))
  } catch (error) {
    console.error(error)
    dispatch(goToTasks())
    const message = getErrorMessage(error)
    dispatch(notify(copy.taskNotFound(message)))
  }
}

export const goToTasks = () => (
  dispatch: Dispatch<Action | RouterAction>,
  getState: GetState
) => {
  const org = getOrg(getState())

  dispatch(push(`/orgs/${org.id}/tasks/`))
}

export const goToTaskRuns = () => (
  dispatch: Dispatch<Action | RouterAction>,
  getState: GetState
) => {
  const state = getState()
  const {
    tasks: {currentTask},
  } = state.resources

  const org = getOrg(getState())

  dispatch(push(`/orgs/${org.id}/tasks/${currentTask.id}/runs`))
}

export const cancel = () => (dispatch: Dispatch<Action | RouterAction>) => {
  dispatch(clearCurrentTask())
  dispatch(goBack())
}

export const createTaskFromTemplate = (template: api.Template) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    const org = getOrg(state)

    const variableName = template[0].spec.name

    await createResourceFromPkgerTemplate(template, org.id)
    await getTasks()(dispatch, getState)

    event('task.create.from_template.success', {
      name: variableName,
    })

    dispatch(notify(copy.taskImportSuccess()))
  } catch (error) {
    event('task.create.from_template.failure', {
      template: template[0].metadata.name
    })
    console.error(error)
    dispatch(notify(copy.taskImportFailed(error.message)))
  }
}

export const updateScript = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    const {
      tasks: {
        currentScript: script,
        currentTask: task,
        taskOptions,
        currentPage,
      },
    } = state.resources

    const updatedTask: Partial<Task> & {
      name: string
      flux: string
      token: string
    } = {
      flux: script,
      name: taskOptions.name,
      offset: taskOptions.offset,
      token: null,
    }

    if (taskOptions.taskScheduleType === TaskSchedule.interval) {
      updatedTask.every = taskOptions.interval
      updatedTask.cron = null
    } else {
      updatedTask.cron = taskOptions.cron
      updatedTask.every = null
    }

    const resp = await api.patchTask({taskID: task.id, data: updatedTask})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    if (currentPage === TaskPage.TasksPage) {
      dispatch(goToTasks())
    } else if (currentPage === TaskPage.TaskRunsPage) {
      dispatch(goToTaskRuns())
    }

    dispatch(clearCurrentTask())
    dispatch(notify(copy.taskUpdateSuccess()))
  } catch (error) {
    console.error(error)
    const message = getErrorMessage(error)
    dispatch(notify(copy.taskUpdateFailed(message)))
  }
}

export const saveNewScript = (script: string, preamble: string) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
): Promise<void> => {
  try {
    const fluxScript = await insertPreambleInScript(script, preamble)
    const org = getOrg(getState())
    const resp = await api.postTask({data: {orgID: org.id, flux: fluxScript}})
    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }

    dispatch(setNewScript(''))
    dispatch(clearTask())
    dispatch(notify(copy.taskCreatedSuccess()))
    dispatch(checkTaskLimits())
  } catch (error) {
    if (isLimitError(error)) {
      dispatch(notify(copy.resourceLimitReached('tasks')))
    } else {
      const message = getErrorMessage(error)
      dispatch(notify(copy.taskNotCreated(message)))
    }
  }
}

export const getRuns = (taskID: string) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    dispatch(setRuns([], RemoteDataState.Loading))
    dispatch(selectTaskByID(taskID))
    const resp = await api.getTasksRuns({taskID})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const runsWithDuration = resp.data.runs.map(run => {
      const finished = new Date(run.finishedAt)
      const started = new Date(run.startedAt)

      return {
        ...run,
        duration: `${runDuration(finished, started)}`,
      }
    })

    dispatch(setRuns(runsWithDuration, RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    const message = getErrorMessage(error)
    dispatch(notify(copy.taskGetFailed(message)))
    dispatch(setRuns([], RemoteDataState.Error))
  }
}

export const runTask = (taskID: string) => async (
  dispatch: Dispatch<Action>
) => {
  try {
    const resp = await api.postTasksRun({taskID})
    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }

    dispatch(notify(copy.taskRunSuccess()))
  } catch (error) {
    const message = getErrorMessage(error)
    dispatch(notify(copy.taskRunFailed(message)))
    console.error(error)
    throw message
  }
}

export const getLogs = (taskID: string, runID: string) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const resp = await api.getTasksRunsLogs({taskID, runID})
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }
    dispatch(setLogs(resp.data.events))
  } catch (error) {
    console.error(error)
    dispatch(setLogs([]))
  }
}

export const retryTask = (taskID: string, runID: string) => async (
  dispatch: Dispatch<Action | NotificationAction>
) => {
  try {
    const resp = await api.postTasksRunsRetry({
      taskID,
      runID,
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(notify(copy.taskRetrySuccess(runID)))
  } catch (error) {
    dispatch(notify(copy.taskRetryFailed(error)))
  }
}

export const runDuration = (finishedAt: Date, startedAt: Date): string => {
  let timeTag = 'seconds'

  if (isNaN(finishedAt.getTime()) || isNaN(startedAt.getTime())) {
    return ''
  }
  let diff = (finishedAt.getTime() - startedAt.getTime()) / 1000

  if (diff > 60) {
    diff = Math.round(diff / 60)
    timeTag = 'minutes'
  }

  return diff + ' ' + timeTag
}
