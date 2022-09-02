// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {jest} from '@jest/globals'

// Items under test
import * as api from 'src/client'
import TaskPage from './TaskPage'
import {goToTasks} from '../actions/thunks'
import {notify} from 'src/shared/actions/notifications'
import {clearTask} from '../actions/creators'

// mocks
import {renderWithReduxAndRouter} from '../../mockState'
import {buckets, labels, orgs, tasks, withRouterProps} from 'mocks/dummyData'
import {mockAppState} from 'src/mockAppState'
import {NotificationStyle, RemoteDataState} from '../../types'
import {IconFont} from '@influxdata/clockface'

jest.mock('src/shared/components/FluxMonacoEditor', () => () => (
  <div>Monaco Here</div>
))

jest.mock('src/client', () => ({
  postTask: jest.fn(),
}))

jest.mock('../actions/thunks', () => ({
  ...(jest as any).requireActual('../actions/thunks.ts'),
  goToTasks: jest.fn(),
}))

jest.mock('src/shared/actions/notifications', () => ({
  ...(jest as any).requireActual('src/shared/actions/notifications'),
  notify: jest.fn(),
}))

const mockNotify = () => {
  const mock: typeof notify = () => {
    const res: ReturnType<typeof notify> = {
      type: 'PUBLISH_NOTIFICATION',
      payload: {
        notification: {
          message: 'MOCKED NOTIFICATION',
          style: NotificationStyle.Error,
          icon: IconFont.Trash_New,
        },
      },
    }

    return res
  }

  jest.mocked(notify).mockImplementation(mock)
}

const mockPostTask = (succeed = true) => {
  const headers: any = {}
  const mock: typeof api.postTask = () => {
    const res: ReturnType<typeof api.postTask> = Promise.resolve(
      succeed
        ? {
            data: {
              id: '99999',
              orgID: '88888',
              name: 'TEST',
              flux: 'foobar',
            },
            headers,
            status: 201,
          }
        : {
            data: {message: 'mocked error', code: 'internal error'},
            headers,
            status: 500,
          }
    )
    return res
  }

  jest.mocked(api.postTask).mockImplementation(mock)
}

const sampleChron = '0 */4 * * *'
const sampleOffset = '15m'
const sampleInterval = '2h'
const sampleScript =
  'from(bucket: "qa1A")\n' +
  '  |> range(start: -2h)\n' +
  '  |> filter(fn: (r) => r["_measurement"] == "craps")\n' +
  '  |> filter(fn: (r) => r["shooter"] == "Jean Gabin")\n'

const baseTaskOptions = {
  name: '',
  interval: '',
  offset: '',
  cron: '',
  taskScheduleType: 'interval',
  orgID: '',
  toBucketName: '',
  toOrgName: '',
}

const defaultProps: any = {
  ...withRouterProps,
  org: orgs[0],
}

const testOrgs = {
  byID: {
    [orgs[0].id]: orgs[0],
  },
  allIDs: orgs.map(t => t.id),
  status: RemoteDataState.Done,
  org: orgs[0],
}

const testTasks = {
  byID: {
    [tasks[0].id]: tasks[0],
    [tasks[1].id]: tasks[1],
  },
  allIDs: tasks.map(t => t.id),
  status: RemoteDataState.Done,
  searchTerm: '',
  taskOptions: baseTaskOptions,
  labels: [],
}

const testResources = {
  cloud: {
    limits: {
      tasks: {
        maxAllowed: null,
        limitStatus: 'ok',
      },
    },
  },
  resources: {
    labels: {
      byID: {
        [labels[0].id]: labels[0],
        [labels[1].id]: labels[1],
      },
      allIDs: labels.map(l => l.id),
      status: RemoteDataState.Done,
    },
    tasks: testTasks,
    orgs: testOrgs,
  },
}

const setup = (override = {}) => {
  const props = {
    ...defaultProps,
  }

  const testState = {
    ...mockAppState,
    ...testResources,
    ...override,
  }

  return renderWithReduxAndRouter(<TaskPage {...props} />, () => testState)
}

describe('Tasks.Components.TaskCard', () => {
  const TaskName = 'ESSAI'

  let ui

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('modifies TaskCard options', () => {
    ui = setup()

    // check baseline
    expect(ui.store.getState().resources.tasks.taskOptions).toEqual(
      baseTaskOptions
    )

    fireEvent.click(screen.getByTestId('task-form-name'))

    fireEvent.input(screen.getByTestId('task-form-name'), {
      target: {value: TaskName},
    })

    fireEvent.change(screen.getByTestId('task-form-schedule-input'), {
      target: {value: sampleInterval},
    })

    fireEvent.click(screen.getByTestId('task-card-cron-btn'))

    fireEvent.change(screen.getByTestId('task-form-schedule-input'), {
      target: {value: sampleChron},
    })

    fireEvent.change(screen.getByTestId('task-form-offset-input'), {
      target: {value: sampleOffset},
    })

    expect(ui.store.getState().resources.tasks.taskOptions).toEqual({
      name: TaskName,
      interval: sampleInterval,
      offset: sampleOffset,
      cron: sampleChron,
      taskScheduleType: 'cron',
      orgID: '',
      toBucketName: '',
      toOrgName: '',
    })

    expect(screen.getByTestId('task-save-btn').getAttribute('class')).toContain(
      'button--disabled'
    )
  })

  it('saves a new TaskCard', async () => {
    const localTasks = {...testTasks}

    localTasks['taskOptions'] = {
      name: 'FOOBAR',
      cron: '',
      interval: '2h',
      offset: '15m',
      taskScheduleType: 'interval',
      orgID: orgs[0].id,
      toBucketName: buckets[1].name,
      toOrgName: orgs[0].name,
    }

    localTasks['newScript'] = sampleScript

    ui = setup({
      resources: {
        tasks: localTasks,
        orgs: testOrgs,
      },
    })

    jest.mocked(goToTasks).mockImplementation(() => {
      return () => {
        return {type: 'MOCKED'}
      }
    })

    await mockNotify()
    expect(
      screen.getByTestId('task-save-btn').getAttribute('class')
    ).not.toContain('button--disabled')

    await mockPostTask()

    await fireEvent.click(screen.getByTestId('task-save-btn'))

    // assert postTask called
    await expect(jest.mocked(api.postTask).mock.calls[0][0].data.flux).toEqual(
      'option task = { \n' +
        '  name: "FOOBAR",\n' +
        '  every: 2h,\n' +
        '  offset: 15m\n' +
        '}\n' +
        '\n' +
        'from(bucket: "qa1A")\n' +
        '  |> range(start: -2h)\n' +
        '  |> filter(fn: (r) => r["_measurement"] == "craps")\n' +
        '  |> filter(fn: (r) => r["shooter"] == "Jean Gabin")\n' +
        '  |> to(bucket: "newbuck1", org: "RadicalOrganization")'
    )

    // assert goToTasks called on success
    await waitFor(() => expect(goToTasks).toHaveBeenCalled())
  })

  it('handles error on save', async () => {
    const localTasks = {...testTasks}

    localTasks['taskOptions'] = {
      name: 'FOOBAR',
      cron: '',
      interval: '2h',
      offset: '15m',
      taskScheduleType: 'interval',
      orgID: orgs[0].id,
      toBucketName: buckets[1].name,
      toOrgName: orgs[0].name,
    }

    localTasks['newScript'] = sampleScript

    ui = setup({
      resources: {
        tasks: localTasks,
        orgs: testOrgs,
      },
    })

    jest.mocked(goToTasks).mockImplementation(() => {
      return () => {
        return {type: 'MOCKED'}
      }
    })

    await mockNotify()

    await mockPostTask(false)

    await fireEvent.click(screen.getByTestId('task-save-btn'))

    await waitFor(() => expect(notify).toHaveBeenCalled())

    expect(jest.mocked(notify).mock.calls[0][0].message).toEqual(
      'Failed to create new task: mocked error'
    )
    expect(jest.mocked(notify).mock.calls[0][0].icon).toEqual('AlertTriangle')
  })

  // ensure clean destruction
  it('clears the task state', () => {
    const localTasks = {...testTasks}

    localTasks['taskOptions'] = {
      name: 'FOOBAR',
      cron: '',
      interval: '2h',
      offset: '15m',
      taskScheduleType: 'interval',
      orgID: orgs[0].id,
      toBucketName: buckets[1].name,
      toOrgName: orgs[0].name,
    }

    localTasks['newScript'] = sampleScript
    localTasks['currentScript'] = 'ASDF'

    ui = setup({
      resources: {
        tasks: localTasks,
        orgs: testOrgs,
      },
    })

    let tasks = ui.store.getState().resources.tasks

    expect(tasks.newScript).toEqual(sampleScript)
    expect(tasks.currentScript).toEqual('ASDF')
    expect(tasks.taskOptions).toEqual(localTasks.taskOptions)

    ui.store.dispatch(clearTask())

    tasks = ui.store.getState().resources.tasks

    expect(tasks.newScript).toHaveLength(0)
    expect(tasks.currentScript).toHaveLength(0)
    expect(tasks.taskOptions).toEqual({
      name: '',
      interval: '',
      offset: '',
      cron: '',
      taskScheduleType: '',
      orgID: '',
      toBucketName: '',
      toOrgName: '',
    })
  })
})
