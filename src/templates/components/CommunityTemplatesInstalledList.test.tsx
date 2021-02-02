// Installed libraries
import React from 'react'
import {createStore} from 'redux'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {mocked} from 'ts-jest/utils'

// Manual mocks
jest.mock('src/cloud/utils/reporting')
jest.mock('src/resources/components/GetResources')
jest.mock('src/shared/actions/notifications')
jest.mock('src/shared/utils/errors')
jest.mock('src/buckets/actions/thunks.ts')

jest.mock('src/templates/api', () => {
  return {
    fetchStacks: jest.fn(() => {
      return []
    }),
    deleteStack: jest.fn(() => {
      return []
    }),
  }
})

// Imported mocks - don't import these until after mocking the functionality contained therein
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Mock State
import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'
import {mockAppState} from 'src/mockAppState'

// Redux
import {templatesReducer} from 'src/templates/reducers/index'

// What have you
import {
  communityTemplateDeleteSucceeded,
  communityTemplateDeleteFailed,
} from 'src/shared/copy/notifications'

// The file under test, imported last
import {CommunityTemplatesInstalledList} from 'src/templates/components/CommunityTemplatesInstalledList'

const defaultProps: any = {
  ...withRouterProps,
  notify: jest.fn(),
  setStagedTemplateUrl: jest.fn(),
  org: '',
  stagedTemplateUrl: '',
}

const setup = (props = defaultProps) => {
  const templatesStore = createStore(templatesReducer)

  return renderWithReduxAndRouter(
    <CommunityTemplatesInstalledList {...props} />,
    _fakeLocalStorage => {
      const appState = {...mockAppState} as any
      appState.resources.templates = templatesStore.getState()
      return appState
    }
  )
}

describe('the Community Templates installed List', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('starting to load the template list page', () => {
    it('loads an empty page when there are no templates', () => {
      setup()
      expect(screen.queryByText('Installed Templates')).not.toBeInTheDocument()
      expect(
        screen.queryByText(`You haven't installed any templates yet`)
      ).toBeVisible()
    })
  })

  describe('the template delete process', () => {
    it('user can delete a template from the template list', async () => {
      const {getByTitle, getByTestId, store} = setup()

      store.dispatch({
        type: 'SET_STACKS',
        stacks: [
          {
            createdAt: '2021-01-28T18:18:05.1446136Z',
            description: '',
            eventType: 'update',
            events: [],
            id: '06fe8d36f61bc000',
            name: 'github',
            orgID: '16273c0ad77f8a1c',
            resources: [],
            sources: [
              'https://github.com/influxdata/community-templates/blob/master/github/github.yml',
            ],
            updatedAt: '2021-01-28T18:18:05.2420165Z',
            urls: [],
          },
        ],
      })

      expect(screen.queryByText('Installed Templates')).toBeVisible()
      const trashButton = getByTestId('template-delete-button-github--button')
      fireEvent.click(trashButton)

      await waitFor(() => {
        const deleteButton = getByTitle('Delete')
        fireEvent.click(deleteButton)
      })
      const [eventCallArguments] = mocked(event).mock.calls
      const [eventName] = eventCallArguments
      expect(eventName).toBe('template_delete')
      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(communityTemplateDeleteSucceeded('github'))

      expect(
        screen.queryByText(`You haven't installed any templates yet`)
      ).toBeVisible()
    })

    it('handles failures in the delete', async () => {
      mocked(event).mockImplementation(() => {
        throw new Error('fake error')
      })

      const {getByTitle, getByTestId, store} = setup()

      store.dispatch({
        type: 'SET_STACKS',
        stacks: [
          {
            createdAt: '2021-01-28T18:18:05.1446136Z',
            description: '',
            eventType: 'update',
            events: [],
            id: '06fe8d36f61bc000',
            name: 'github',
            orgID: '16273c0ad77f8a1c',
            resources: [],
            sources: [
              'https://github.com/influxdata/community-templates/blob/master/github/github.yml',
            ],
            updatedAt: '2021-01-28T18:18:05.2420165Z',
            urls: [],
          },
        ],
      })

      expect(screen.queryByText('Installed Templates')).toBeVisible()
      const trashButton = getByTestId('template-delete-button-github--button')
      fireEvent.click(trashButton)

      await waitFor(() => {
        const deleteButton = getByTitle('Delete')
        fireEvent.click(deleteButton)
      })
      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(communityTemplateDeleteFailed('fake error'))

      const [honeyBadgerCallArguments] = mocked(
        reportErrorThroughHoneyBadger
      ).mock.calls
      expect(honeyBadgerCallArguments[1]).toEqual({
        name: 'The community template delete failed',
      })
    })
  })
})
