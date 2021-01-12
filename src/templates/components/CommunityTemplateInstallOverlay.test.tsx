// Installed libraries
import React from 'react'
import {createStore} from 'redux'
import {findByTitle, fireEvent, screen, waitFor} from '@testing-library/react'
import {normalize} from 'normalizr'
import {mocked} from 'ts-jest/utils'

// Manual mocks
jest.mock('src/cloud/utils/reporting')
jest.mock('src/resources/components/GetResources')
jest.mock('src/shared/actions/notifications')
jest.mock('src/shared/utils/errors')

jest.mock('src/templates/selectors/index.ts', ()=>{
  return {
    getTotalResourceCount: jest.fn(()=>{
      return 1
    }),
    getResourceInstallCount: jest.fn(()=>{
      return 1
    })
  }
})

jest.mock('src/templates/api', () => {
  return {
    fetchStacks: jest.fn(() => {
      return []
    }),
    reviewTemplate: jest.fn(() => {
      return {summary: {}}
    }),
    installTemplate: jest.fn(() => {
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
import {mockAppState} from 'src/mockAppState'

// Types
import {Organization, RemoteDataState, OrgEntities} from 'src/types'
import {arrayOfOrgs} from 'src/schemas'

// Redux
import {templatesReducer} from 'src/templates/reducers/index'

// What have you
import {communityTemplateUnsupportedFormatError} from 'src/shared/copy/notifications'

// The file under test, imported last
import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'

const defaultProps = {
  ...withRouterProps,
  notify: jest.fn(),
  setStagedTemplateUrl: jest.fn(),
  org: '',
  stagedTemplateUrl: '',
}

const setup = (props = defaultProps) => {
  const templatesStore = createStore(templatesReducer)

  return renderWithReduxAndRouter(
    <CommunityTemplatesIndex {...props} />,
    _fakeLocalStorage => {
      const appState = {...mockAppState} as any
      appState.resources.templates = templatesStore.getState()
      return appState
    }
  )
}

describe('the Community Templates Install Overlay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handling the template install process', () => {
    it('opens the install overlay when the template url is valid', async () => {
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

      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [eventCallArguments] = mocked(event).mock.calls
      const [eventName, eventMetaData] = eventCallArguments
      expect(eventName).toBe('template_click_lookup')
      expect(eventMetaData).toEqual({templateName: 'fn-template'})
      
      await waitFor(() => {
        expect(screen.queryByText('Template Installer')).toBeVisible()

      })

      await waitFor(() => {
        expect(screen.queryByTitle('Install Template')).toBeVisible()
        // const installButton = screen.queryByTitle('Install Template')
        // fireEvent.click(installButton)
        // const [eventCallArguments] = mocked(event).mock.calls
        // const [eventName, eventMetaData] = eventCallArguments
        // expect(eventName).toBe('template_install')
      })

      
    })

    //     it('opens the install overlay when the template url is valid', () => {
    //       const {getByTitle, store} = setup()

    //       // This successful call opens the Community Templates Installer overlay which requires orgs to be set
    //       const org = {name: 'zoe', id: '12345'}
    //       store.dispatch({
    //         type: 'SET_ORG',
    //         org: org,
    //       })
    //       const organizations = normalize<Organization, OrgEntities, string[]>(
    //         [org],
    //         arrayOfOrgs
    //       )
    //       store.dispatch({
    //         type: 'SET_ORGS',
    //         schema: organizations,
    //         status: RemoteDataState.Done,
    //       })

    //       store.dispatch({
    //         type: 'SET_STAGED_TEMPLATE_URL',
    //         templateUrl:
    //           'https://github.com/influxdata/community-templates/blob/master/fortnite/fn-template.yml',
    //       })

    //       store.dispatch({
    //         type: 'SET_STAGED_TEMPLATE',
    //         template: {summary: {}},
    //       })

    //       const templateButton = getByTitle('Lookup Template')

    //       fireEvent.click(templateButton)

    //       const [eventCallArguments] = mocked(event).mock.calls
    //       const [eventName, eventMetaData] = eventCallArguments
    //       expect(eventName).toBe('template_click_lookup')
    //       expect(eventMetaData).toEqual({templateName: 'fn-template'})
    //       expect(screen.getByText('Template Installer')).toBeInTheDocument()
    //     })

    //     it('handles failure of getting the preview', () => {
    //       const {getByTitle, store} = setup()

    //       store.dispatch({
    //         type: 'SET_STAGED_TEMPLATE_URL',
    //         templateUrl:
    //           'https://github.com/influxdata/community-templates/blob/master/fortnite/fn-template.yml',
    //       })

    //       store.dispatch({
    //         type: 'SET_STAGED_TEMPLATE',
    //         template: {summary: {}},
    //       })

    //       mocked(event).mockImplementation(() => {
    //         throw new Error()
    //       })

    //       const templateButton = getByTitle('Lookup Template')

    //       fireEvent.click(templateButton)

    //       const [notifyCallArguments] = mocked(notify).mock.calls
    //       const [notifyMessage] = notifyCallArguments
    //       expect(notifyMessage).toEqual(communityTemplateUnsupportedFormatError())
    //       const [honeyBadgerCallArguments] = mocked(
    //         reportErrorThroughHoneyBadger
    //       ).mock.calls
    //       expect(honeyBadgerCallArguments[1]).toEqual({
    //         name: 'The community template getTemplateDetails failed',
    //       })
    //     })
  })
})
