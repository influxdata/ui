// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import TasksList from 'src/tasks/components/TasksList'

// Types
import {Task} from 'src/types'

// Constants
import {tasks} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override?) => {
  const props = {
    tasks,
    searchTerm: '',
    onActivate: oneTestFunction,
    onDelete: oneTestFunction,
    onCreate: secondTestFunction,
    onSelect: oneTestFunction,
    onImportTask: oneTestFunction,
    checkTaskLimits: secondTestFunction,
    ...override,
  }

  renderWithReduxAndRouter(<TasksList {...props} />)
}

const oneTestFunction = (tasks: Task) => {
  tasks[0].name = 'someone'
  return
}

const secondTestFunction = () => {
  return
}

describe('TasksList', () => {
  describe('rendering', () => {
    it('renders', async () => {
      setup()
      const elm = await screen.findAllByTestId('task-card')
      expect(elm[0]).toBeVisible()
    })
  })
})
