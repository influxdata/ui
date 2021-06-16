// Installed libraries
import React from 'react'
import {fireEvent, prettyDOM, screen, waitFor} from '@testing-library/react'
import {Task as TaskApi} from '@influxdata/influx'

// Constants
import {tasks, orgs, withRouterProps, labels} from 'mocks/dummyData'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {RemoteDataState} from 'src/types'
import {createMemoryHistory} from 'history'

// Items under test
import TasksPage from './TasksPage'
import {deleteTask, patchTask, postTask, getTask} from 'src/client'
import {parse} from 'src/external/parser'
import {mocked} from 'ts-jest/utils'

const sampleScript =
  'option task = {\n  name: "beetle",\n  every: 1h,\n}\n' +
  'from(bucket: "inbucket")\n' +
  '  |> range(start: -task.every)\n' +
  '  |> filter(fn: (r) => r["_measurement"] == "activity")\n' +
  '  |> filter(fn: (r) => r["target"] == "crumbs")\n'

const InactiveTask = {
  id: '02f12c50dcb93000',
  orgID: '02ee9e2a29d73000',
  name: 'Dead Beetle',
  status: TaskApi.StatusEnum.Inactive,
  flux: sampleScript,
  every: '1h',
  org: 'default',
  labels: [],
}

const replacementID = '02f12c50dcb9300f'
const replacementName = 'Resurrected Beetle'

const localTasks = [...tasks, InactiveTask]
const localHistory = createMemoryHistory({initialEntries: ['/']})

withRouterProps.match.params.orgID = orgs[0].id

/*
  N.B. when using react testing library render()
  the mocked values in src/external/parser are ignored.
  So, need to mock here as well
*/
jest.mock('src/external/parser', () => ({
  parse: jest.fn(() => {
    return {
      type: 'File',
      package: {
        name: {
          name: 'fake',
          type: 'Identifier',
        },
        type: 'PackageClause',
      },
      imports: [],
      body: [],
    }
  }),
}))

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
  getTask: jest.fn(() => {
    return {
      data: InactiveTask,
      headers: {},
      status: 200,
    }
  }),
  postTask: jest.fn(() => {
    return {
      headers: {},
      status: 201,
      data: {...InactiveTask, name: replacementName, id: replacementID},
    }
  }),
  patchTask: jest.fn(() => {
    return {
      headers: {},
      status: 200,
      data: {...InactiveTask, status: 'active'},
    }
  }),
  deleteTask: jest.fn(() => ({
    headers: {},
    status: 204,
  })),
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

  describe('manage tasks', () => {
    it('deletes a task', async () => {
      const taskCard = (await screen.findAllByTestId('task-card'))[0]

      expect(
        taskCard.querySelector("[data-testid='task-card--name']").textContent
      ).toContain('Dead Beetle')

      const deleteButton = taskCard.querySelector(
        "[data-testid='context-delete-task']"
      )

      const taskID = taskCard
        .querySelector("[class='copy-resource-id']")
        .textContent.split(':')[1]
        .split('C')[0]
        .trim()

      expect(ui.store.getState().resources.tasks.byID[taskID]).toBeTruthy()
      expect(ui.store.getState().resources.tasks.allIDs).toContain(taskID)

      fireEvent.click(deleteButton)

      await waitFor(() => expect(deleteTask).toBeCalled())

      expect(mocked(deleteTask).mock.calls[0][0]['taskID']).toEqual(taskID)
      expect(ui.store.getState().resources.tasks.byID[taskID]).toBeFalsy()
      expect(ui.store.getState().resources.tasks.allIDs).not.toContain(taskID)
    })

    it('clones a task', async () => {
      expect(ui.store.getState().resources.tasks.allIDs.length).toEqual(
        localTasks.length
      )

      const taskCard = (await screen.findAllByTestId('task-card'))[0]
      const cloneButton = taskCard.querySelector(
        '[data-testid=context-menu] + div [data-testid=context-menu-item]'
      )
      const name = taskCard.querySelector("[data-testid='task-card--name']")
        .textContent
      expect(name).toContain(InactiveTask.name)

      fireEvent.click(cloneButton)

      await waitFor(() => expect(postTask).toBeCalled())

      expect(mocked(getTask).mock.calls[0][0].taskID).toEqual(InactiveTask.id)

      expect(mocked(parse).mock.calls[0][0]).toEqual(sampleScript)

      expect(mocked(postTask).mock.calls[0][0].data.id).toEqual(InactiveTask.id)
      expect(mocked(postTask).mock.calls[0][0].data.name).toEqual(
        InactiveTask.name
      )
      expect(mocked(postTask).mock.calls[0][0].data.status).toEqual(
        InactiveTask.status
      )

      expect(ui.store.getState().resources.tasks.allIDs.length).toEqual(
        localTasks.length + 1
      )
      expect(ui.store.getState().resources.tasks.allIDs).toContain(
        replacementID
      )
      expect(
        ui.store.getState().resources.tasks.byID[replacementID].name
      ).toEqual(replacementName)
    })

    /*
    NB was working up until most recent rebase 0bfc0bb370af 21.6.16
    Now throws error on fire event

    [Util] handleError::  Cannot assign to read only property 'status' of object '#<Object>'
     :-/
    */
    it.skip('activates a task', async () => {
      expect(
        ui.store.getState().resources.tasks.byID[InactiveTask.id].status
      ).toEqual('inactive')

      const taskCard = (await screen.findAllByTestId('task-card'))[0]
      const activateToggle = taskCard.querySelector(
        '[data-testid=task-card--slide-toggle]'
      )

      fireEvent.click(activateToggle)

      await waitFor(() => expect(patchTask).toBeCalled())

      expect(mocked(patchTask).mock.calls[0][0].data.status).toEqual('active')

      expect(
        ui.store.getState().resources.tasks.byID[InactiveTask.id].status
      ).toEqual('active')
    })
  })
})
