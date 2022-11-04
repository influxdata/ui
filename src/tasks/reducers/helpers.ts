import {
  RemoteDataState,
  ResourceState,
  TaskOptions,
  TaskSchedule,
  Scripts,
} from 'src/types'

export const initialState = (): ResourceState['tasks'] => ({
  allIDs: [],
  byID: {},
  status: RemoteDataState.NotStarted,
  newScript: '',
  currentTask: null,
  currentScript: '',
  searchTerm: '',
  showInactive: true,
  taskOptions: defaultOptions,
  runStatus: RemoteDataState.NotStarted,
  runs: [],
  logs: [],
  currentPage: 'TasksPage',
  scripts: Script,
})

export const defaultOptions: TaskOptions = {
  name: '',
  interval: '',
  offset: '',
  cron: '',
  taskScheduleType: TaskSchedule.unselected,
  orgID: '',
  toBucketName: '',
  toOrgName: '',
}

export const Script: Scripts = {
  status: RemoteDataState.NotStarted,
  scripts: [],
}
