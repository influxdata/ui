// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {Task as TaskApi} from '@influxdata/influx'

// Constants
import {tasks, orgs, withRouterProps, labels} from 'mocks/dummyData'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {RemoteDataState} from 'src/types'
import {createMemoryHistory} from 'history'

// Items under test
import TasksPage from './TasksPage'

// comment
const InactiveTask = {
  id: '02f12c50dcb93000',
  orgID: '02ee9e2a29d73000',
  name: 'Dead Beetle',
  status: TaskApi.StatusEnum.Inactive,
  flux:
    'option task = {\n  name: "beetle",\n  every: 1h,\n}\nfrom(bucket: "inbucket") \n|> range(start: -task.every)',
  every: '1h',
  org: 'default',
  labels: [],
}

const localTasks = [...tasks, InactiveTask]
const localHistory = createMemoryHistory({initialEntries: ['/']})

withRouterProps.match.params.orgID = orgs[0].id

jest.mock('src/client', () => ({
  getTasks: jest.fn(() => {
    return {
      data: {
        tasks: localTasks.map(t => {
          t.id, t.orgID, t.name, t.flux, t.labels
        }),
      },
      headers: {},
      status: 200,
    }
  }),
  getLabels: jest.fn(() => {
    return {
      data: {
        labels: labels,
      },
      headers: {},
      status: 200,
    }
  }),
}))

const defaultProps: any = {
  ...withRouterProps,
  org: orgs[0],
  history: localHistory,
}

const setup = (override = {}) => {
  const props = {
    ...defaultProps,
    ...override,
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
          [localTasks[0].id]: localTasks[0],
          [localTasks[1].id]: localTasks[1],
          [localTasks[2].id]: localTasks[2],
        },
        allIDs: localTasks.map(t => t.id),
        status: RemoteDataState.Done,
        searchTerm: '',
        labels: [],
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

  return renderWithReduxAndRouter(<TasksPage {...props} />, () => testState)
}

describe('Tasks.Containers.TasksPage', () => {
  let ui

  beforeEach(() => {
    jest.clearAllMocks()
    ui = setup()
  })

  describe('view tasks', () => {
    it('hides inactive tasks', async () => {
      expect(ui.store.getState().resources.tasks.showInactive).toBe(true)

      const cardsInit = await screen.findAllByTestId('task-card')
      expect(cardsInit.length).toBe(3)
      cardsInit.forEach(card => {
        expect(card).toBeVisible()
      })

      let alerts = (
        await screen.getByTestId('page-contents')
      ).getElementsByClassName('hidden-tasks-alert')
      expect(alerts.length).toBe(0)

      fireEvent.click(screen.getByTestId('slide-toggle'))

      expect(ui.store.getState().resources.tasks.showInactive).toBe(false)

      const cards = await screen.findAllByTestId('task-card')
      expect(cards.length).toBe(2)
      cards.forEach(card => {
        expect(card).toBeVisible()
      })

      alerts = (
        await screen.getByTestId('page-contents')
      ).getElementsByClassName('hidden-tasks-alert')
      expect(alerts.length).toBe(1)
      expect(alerts[0]).toBeVisible()
    })
  })

  describe('create tasks', () => {
    it('triggers create a new task', async () => {
      fireEvent.click(screen.getByTestId('add-resource-dropdown--button'))
      await waitFor(() => {
        expect(
          screen.queryByTestId('add-resource-dropdown--import')
        ).toBeVisible()
      })
      fireEvent.click(screen.getByTestId('add-resource-dropdown--new'))

      expect(localHistory.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            pathname: '/orgs/02ee9e2a29d73000/tasks/new',
          }),
        ])
      )
    })

    it('triggers task import', async () => {
      fireEvent.click(screen.getByTestId('add-resource-dropdown--button'))
      await waitFor(() => {
        expect(
          screen.queryByTestId('add-resource-dropdown--import')
        ).toBeVisible()
      })

      fireEvent.click(screen.getByTestId('add-resource-dropdown--import'))

      expect(localHistory.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            pathname: '/orgs/02ee9e2a29d73000/tasks/import',
          }),
        ])
      )
    })
  })
})
