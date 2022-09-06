// Installed libraries
import React from 'react'
import {createStore} from 'redux'
import {cleanup, fireEvent, screen, waitFor} from '@testing-library/react'
import {normalize} from 'normalizr'
import {jest} from '@jest/globals'

// Manual mocks
jest.mock('src/cloud/utils/reporting')
jest.mock('src/resources/components/GetResources')
jest.mock('src/shared/actions/notifications')
jest.mock('src/buckets/actions/thunks.ts')

jest.mock('src/templates/selectors/index.ts', () => {
  return {
    getTotalResourceCount: jest.fn(() => {
      return 1
    }),
    getResourceInstallCount: jest.fn(() => {
      return 1
    }),
  }
})

jest.mock('src/templates/utils/index.ts', () => {
  return {
    getTemplateNameFromUrl: jest.fn(() => {
      return {name: 'fn-template', extension: 'ext', directory: 'directory'}
    }),
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
    updateStackName: jest.fn(() => {
      return Promise.resolve({summary: {}})
    }),
  }
})

// Imported mocks - don't import these until after mocking the functionality contained therein
import {installTemplate, updateStackName} from 'src/templates/api'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'

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
import {communityTemplateInstallSucceeded} from 'src/shared/copy/notifications'
import {
  communityTemplateInstallFailed,
  communityTemplateRenameFailed,
} from 'src/shared/copy/notifications'

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

let getByTitle

describe('the Community Templates Install Overlay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const renderResult = setup()
    const store = renderResult.store
    getByTitle = renderResult.getByTitle
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
  })

  describe('handling the template install process', () => {
    it('handles failures to rename', async () => {
      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [templateClickEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName] = templateClickEventCallArguments
      expect(eventName).toBe('template_click_lookup')

      jest.mocked(updateStackName).mockImplementationOnce(() => {
        throw new Error()
      })

      await waitFor(() => {
        expect(screen.queryByText('Template Installer')).toBeVisible()
      })

      await waitFor(() => {
        const installButton = screen.queryByTitle('Install Template')
        expect(installButton).toBeVisible()
        fireEvent.click(installButton)
      })

      const [, , installEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName2] = installEventCallArguments
      expect(eventName2).toBe('community_template.install.failure')

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(communityTemplateRenameFailed())
    })

    it('handles failures to install', async () => {
      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [templateClickEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName] = templateClickEventCallArguments
      expect(eventName).toBe('template_click_lookup')

      jest.mocked(event).mockImplementationOnce(() => {
        throw new Error()
      })

      await waitFor(() => {
        expect(screen.queryByText('Template Installer')).toBeVisible()
      })

      await waitFor(() => {
        const installButton = screen.queryByTitle('Install Template')
        expect(installButton).toBeVisible()
        fireEvent.click(installButton)
      })

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(communityTemplateInstallFailed())

      cleanup()
    })
    it('installs the template', async () => {
      const templateButton = getByTitle('Lookup Template')

      fireEvent.click(templateButton)

      const [templateClickEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName] = templateClickEventCallArguments
      expect(eventName).toBe('template_click_lookup')
      await waitFor(() => {
        expect(screen.queryByText('Template Installer')).toBeVisible()
      })

      await waitFor(() => {
        const installButton = screen.queryByTitle('Install Template')
        expect(installButton).toBeVisible()
        fireEvent.click(installButton)
      })

      expect(installTemplate).toHaveBeenCalled()

      const [, installEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName2] = installEventCallArguments
      expect(eventName2).toBe('template_install.success')

      expect(updateStackName).toHaveBeenCalled()

      const [, , renameEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName3] = renameEventCallArguments
      expect(eventName3).toBe('template_rename')

      const [notifyCallArguments] = jest.mocked(notify).mock.calls
      const [notifyMessage] = notifyCallArguments
      expect(notifyMessage).toEqual(
        communityTemplateInstallSucceeded('fn-template')
      )

      const [, , , ctInstallEventCallArguments] = jest.mocked(event).mock.calls
      const [eventName4] = ctInstallEventCallArguments
      expect(eventName4).toBe('community_template.install.success')
    })
  })
})
