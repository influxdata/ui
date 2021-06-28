// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'

// Items under test
import TaskRunsPage from './TaskRunsPage'
import {getTasksRuns, postTasksRun, Run} from 'src/client'
import * as Creators from '../actions/creators'

// Constants
import {tasks, orgs, withRouterProps, labels} from 'mocks/dummyData'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {RemoteDataState} from 'src/types'
import {mocked} from 'ts-jest/utils'

const runIDs = [
  '07a7f99e81cf2000',
  '07a7f99e81cf3000',
  '07a7f99e81cf5000',
  '07a7f99e81cfD000',
  '07a7f99e81d02000',
]

const dummyTaskRuns: Array<Run> = [
  {
    id: runIDs[0],
    taskID: tasks[0].id,
    status: 'success',
    scheduledFor: '2021-06-08T00:05:00Z',
    log: [
      {
        runID: runIDs[0],
        time: '2021-06-08T00:25:17.501582756Z',
        message:
          'started script "Ici Londres.  Les francais parlent aux francais...."',
      },
      {
        runID: runIDs[0],
        time: '2021-06-08T00:25:39.002064513Z',
        message: 'code: "Le boulanger cherche de levure.  Je repete..."',
      },
      {
        runID: runIDs[0],
        time: '2021-06-08T00:25:51.597799711Z',
        message: 'Completed(success)',
      },
    ],
    startedAt: '2021-06-08T00:25:17.612693867Z',
    finishedAt: '2021-06-08T00:25:52.118899855Z',
    requestedAt: '2021-06-08T00:24:33.768396216Z',
    links: {
      self: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[0]}`,
      task: `/api/v2/tasks/${tasks[0].id}`,
      retry: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[0]}/retry`,
    },
  },
  {
    id: runIDs[1],
    taskID: tasks[0].id,
    status: 'canceled',
    scheduledFor: '2021-06-08T02:05:00Z',
    log: [
      {
        runID: runIDs[1],
        time: '2021-06-08T02:25:17.501582756Z',
        message:
          'started script "Ici Londres.  Les francais parlent aux francais...."',
      },
      {
        runID: runIDs[1],
        time: '2021-06-08T02:25:39.002064513Z',
        message:
          'code: "Longtemps, je me suis couche de bonne heure.  Je repete..."',
      },
      {
        runID: runIDs[1],
        time: '2021-06-08T02:25:51.597799711Z',
        message: 'Completed(canceled)',
      },
    ],
    startedAt: '2021-06-08T02:25:17.612693867Z',
    finishedAt: '2021-06-08T02:25:52.118899855Z',
    requestedAt: '2021-06-08T02:24:33.768396216Z',
    links: {
      self: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[1]}`,
      task: `/api/v2/tasks/${tasks[0].id}`,
      retry: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[1]}/retry`,
    },
  },
  {
    id: runIDs[2],
    taskID: tasks[0].id,
    status: 'failed',
    scheduledFor: '2021-06-08T04:05:00Z',
    log: [
      {
        runID: runIDs[2],
        time: '2021-06-08T04:25:17.501582756Z',
        message:
          'started script "Ici Londres.  Les francais parlent aux francais...."',
      },
      {
        runID: runIDs[2],
        time: '2021-06-08T04:25:39.002064513Z',
        message:
          'code: "Ecoute plus souvent Les Choses que les Etres.  Je repete..."',
      },
      {
        runID: runIDs[2],
        time: '2021-06-08T04:25:51.597799711Z',
        message: 'Completed(failed)',
      },
    ],
    startedAt: '2021-06-08T04:25:17.612693867Z',
    finishedAt: '2021-06-08T04:25:52.118899855Z',
    requestedAt: '2021-06-08T04:24:33.768396216Z',
    links: {
      self: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[2]}`,
      task: `/api/v2/tasks/${tasks[0].id}`,
      retry: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[2]}/retry`,
    },
  },
  {
    id: runIDs[3],
    taskID: tasks[0].id,
    status: 'started',
    scheduledFor: '2021-06-08T06:05:00Z',
    log: [
      {
        runID: runIDs[3],
        time: '2021-06-08T06:25:17.501582756Z',
        message:
          'started script "Ici Londres.  Les francais parlent aux francais...."',
      },
      {
        runID: runIDs[3],
        time: '2021-06-08T06:25:39.002064513Z',
        message:
          'code: "Aujourd’hui, maman est morte. Ou peut-etre hier, je ne sais pas..  Je repete..."',
      },
    ],
    startedAt: '2021-06-08T06:25:17.612693867Z',
    requestedAt: '2021-06-08T06:24:33.768396216Z',
    links: {
      self: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[3]}`,
      task: `/api/v2/tasks/${tasks[0].id}`,
      retry: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[3]}/retry`,
    },
  },
  {
    id: runIDs[4],
    taskID: tasks[0].id,
    status: 'scheduled',
    scheduledFor: '2021-06-08T06:10:00Z',
    log: [],
    requestedAt: '2021-06-08T06:29:33.768396216Z',
    links: {
      self: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[3]}`,
      task: `/api/v2/tasks/${tasks[0].id}`,
      retry: `/api/v2/tasks/${tasks[0].id}/runs/${runIDs[3]}/retry`,
    },
  },
]

jest.mock('src/client', () => ({
  getTasksRuns: jest.fn(() => {
    return Promise.resolve({
      status: 200,
      headers: {},
      data: {
        runs: dummyTaskRuns,
      },
    })
  }),
  getTask: jest.fn(() => {
    return {
      data: tasks[0],
      headers: {},
      status: 200,
    }
  }),
  postTasksRun: jest.fn(() => ({
    headers: {},
    status: 201,
  })),
}))

jest.mock('src/resources/selectors', () => {
  return {
    getByID: jest.fn(() => {
      return tasks[0]
    }),
  }
})

jest.mock('src/resources/components/GetResources')

const setup = () => {
  const props: any = {
    ...withRouterProps,
    org: orgs[0],
    runStatus: RemoteDataState.Done,
  }

  const testState = {
    ...mockAppState,
    resources: {
      labels: {
        byID: {
          [labels[0].id]: labels[0],
          [labels[1].id]: labels[1],
        },
        allIDs: labels.map(l => l.id),
        status: RemoteDataState.Done,
      },
      tasks: {
        byID: {
          [tasks[0].id]: tasks[0],
          [tasks[1].id]: tasks[1],
        },
        allIDs: tasks.map(t => t.id),
        status: RemoteDataState.Done,
        searchTerm: '',
        labels: [],
        runs: dummyTaskRuns,
      },
      orgs: {
        byID: {
          [orgs[0].id]: orgs[0],
        },
        allIDs: orgs.map(t => t.id),
        status: RemoteDataState.Done,
        org: orgs[0],
      },
    },
  }

  return renderWithReduxAndRouter(<TaskRunsPage {...props} />, () => testState)
}

const verifyRecStatus = (rec: HTMLElement, run: Run) => {
  const cells = rec.querySelectorAll('[data-testid=table-cell]')
  expect(cells[0].textContent.trim()).toEqual(run.status)
  let testString = run.scheduledFor.replace('T', ' ').replace('Z', '')

  // ignore adjustment for local time zone but check the rest
  testString =
    '^' + testString.substring(0, 11) + '\\d\\d' + testString.substring(13)

  expect(cells[1].textContent.trim()).toMatch(new RegExp(testString))

  if (run.startedAt) {
    testString = run.startedAt.replace('T', ' ').replace('Z', '')
    // ignore adjustment for local time zone but check the rest
    testString = (
      '^' +
      testString.substring(0, 11) +
      '\\d\\d' +
      testString.substring(13)
    ).split('.')[0]
    expect(cells[2].textContent.trim()).toMatch(new RegExp(testString))
  }
}

describe('Tasks.Components.TaskRunsPage', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    jest.spyOn(Creators, 'setRuns')

    setup()

    await waitFor(() => expect(getTasksRuns).toBeCalled())
    await waitFor(() => expect(Creators.setRuns).toBeCalled())
  })

  it('displays run records', async () => {
    expect(mocked(Creators.setRuns).mock.calls[1][0].length).toEqual(
      dummyTaskRuns.length
    )

    const rows = await screen.findAllByTestId('table-row')

    // default sort is reverse of dummyTaskRuns declaration above
    for (let i = 0; i < rows.length; i++) {
      verifyRecStatus(rows[i], dummyTaskRuns[rows.length - (i + 1)])
    }

    const cells = rows[4].querySelectorAll('[data-testid=table-cell]')

    expect(cells[3].textContent.trim()).toContain('34.506 seconds')
  })

  it('triggers new task run', async () => {
    fireEvent.click(screen.getByTitle('Run Task'))

    await waitFor(() => expect(postTasksRun).toBeCalled())

    expect(getTasksRuns).toBeCalledTimes(2)
  })
})
