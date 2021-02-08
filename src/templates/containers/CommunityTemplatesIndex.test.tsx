// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {normalize} from 'normalizr'
import {mocked} from 'ts-jest/utils'

// Manual mocks
jest.mock('src/cloud/utils/reporting')
jest.mock('src/resources/components/GetResources')
jest.mock('src/shared/actions/notifications')

jest.mock('src/templates/api', () => {
  return {
    fetchStacks: jest.fn(() => {
      return []
    }),
    reviewTemplate: jest.fn(() => {
      return {summary: {}}
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

// Types
import {Organization, RemoteDataState, OrgEntities} from 'src/types'
import {arrayOfOrgs} from 'src/schemas'

// What have you
import {communityTemplateUnsupportedFormatError} from 'src/shared/copy/notifications'

// The file under test, imported last
import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'

const defaultProps: any = {
  ...withRouterProps,
  notify: jest.fn(),
  setStagedTemplateUrl: jest.fn(),
  org: '',
  stagedTemplateUrl: '',
}

const setup = (props = defaultProps) => {
  return renderWithReduxAndRouter(<CommunityTemplatesIndex {...props} />)
}

describe('the Community Templates index', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('starting the template install process', () => {
    it('notifies the user when there is no template url to lookup', () => {
      const {getByTitle} = setup()
      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(communityTemplateUnsupportedFormatError())
    })

    it('opens the install overlay when the template url is valid', () => {
      const {getByTitle, store} = setup()

      // This successful call opens the Community Templates Installer overlay which requires orgs to be set
      const org = {name: 'zoe', id: '12345'}
      store.dispatch({
        type: 'SET_ORG',
        org: org,
      })
      const organizations = normalize<Organization, OrgEntities, string[]>(
        [org],
        arrayOfOrgs
      )
      store.dispatch({
        type: 'SET_ORGS',
        schema: organizations,
        status: RemoteDataState.Done,
      })

      store.dispatch({
        type: 'SET_STAGED_TEMPLATE_URL',
        templateUrl:
          'https://github.com/influxdata/community-templates/blob/master/fortnite/fn-template.yml',
      })

      expect(screen.queryByText('Template Installer')).not.toBeInTheDocument()

      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [eventCallArguments] = mocked(event).mock.calls
      const [eventName, eventMetaData] = eventCallArguments
      expect(eventName).toBe('template_click_lookup')
      expect(eventMetaData).toEqual({templateName: 'fn-template'})

      waitFor(() => {
        expect(screen.queryByText('Template Installer')).toBeVisible()
      })
    })

    it('handles failures', () => {
      const {getByTitle, store} = setup()

      store.dispatch({
        type: 'SET_STAGED_TEMPLATE_URL',
        templateUrl:
          'https://github.com/influxdata/community-templates/blob/master/fortnite/fn-template.yml',
      })

      mocked(event).mockImplementation(() => {
        throw new Error()
      })

      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [notifyCallArguments] = mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(communityTemplateUnsupportedFormatError())

      const [honeyBadgerCallArguments] = mocked(
        reportErrorThroughHoneyBadger
      ).mock.calls
      expect(honeyBadgerCallArguments[1]).toEqual({
        name: 'The community template getTemplateDetails failed',
      })
    })
  })
})
