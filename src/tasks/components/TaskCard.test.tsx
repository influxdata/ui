// Libraries
import React from 'react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import {TaskCard} from 'src/tasks/components/TaskCard'

// Constants
import {tasks, withRouterProps, labels} from 'mocks/dummyData'
import {RemoteDataState} from '@influxdata/clockface'

const task = tasks[1] // The 2nd task mock has labels on it

const setup = (override = {}) => {
  const props = {
    ...withRouterProps,
    task,
    onActivate: jest.fn(),
    onDelete: jest.fn(),
    onClone: jest.fn(),
    onSelect: jest.fn(),
    onRunTask: jest.fn(),
    onFilterChange: jest.fn(),
    onUpdate: jest.fn(),
    onAddTaskLabel: jest.fn(),
    onDeleteTaskLabel: jest.fn(),
    sendNotification: jest.fn(),
    onCreateLabel: jest.fn(),
    setCurrentTasksPage: jest.fn(),
    labels: [], // all labels
    onPinTask: jest.fn(),
    onUnpinTask: jest.fn(),
    org: {id: 'BUCKSINSIX', name: 'Milwaukee Bucks'},
    me: {
      id: 'FORTHECULTURE',
      name: 'Bucks',
      links: {
        self: '',
        log: '',
      },
      quartzMeStatus: RemoteDataState.NotStarted,
    },
    ...override,
  }

  const redux = {
    resources: {
      labels: {
        byID: {
          [labels[0].id]: labels[0],
          [labels[1].id]: labels[1],
        },
        allIDs: labels.map(l => l.id),
      },
    },
  }

  return {
    ui: renderWithReduxAndRouter(<TaskCard {...props} />, () => redux),
    props: props,
  }
}

describe('Tasks.Components.TaskCard', () => {
  describe('if task has labels', () => {
    it('renders with labels', () => {
      const {getAllByTestId} = setup().ui

      const labels = getAllByTestId(/label--pill /)

      expect(labels.length).toEqual(task.labels.length)
    })
  })
})
