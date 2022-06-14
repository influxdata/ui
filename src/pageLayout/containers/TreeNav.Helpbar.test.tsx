import React from 'react'
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'
import {Me} from 'src/client/unityRoutes'
import {mocked} from 'ts-jest/utils'

jest.mock('src/flows', () => {
  return () => <></>
})
jest.mock('src/pageLayout/utils', () => ({
  ...jest.requireActual('src/templates/api/index.ts'),
  getNavItemActivation: jest.fn(() => {
    return false
  }),
}))
jest.mock('src/checks/components/NewThresholdCheckEO.tsx', () => () => null)
jest.mock('src/checks/components/NewDeadmanCheckEO.tsx', () => () => null)

jest.mock(
  'src/client/uiProxydRoutes',
  () => ({
    ...jest.requireActual('src/client/uiProxydRoutes'),
    postUiproxySfdcSupport: jest.fn(),
  }),
  {virtual: true}
)

jest.mock('src/shared/utils/featureFlag.ts', () => ({
  ...jest.requireActual('src/shared/utils/featureFlag.ts'),
  isFlagEnabled: jest.fn(() => true),
}))

jest.mock('src/cloud/utils/reporting', () => ({
  event: jest.fn(),
  updateReportingContext: jest.fn(),
}))
jest.mock('src/shared/actions/notifications')

// Imported mocks
import {
  OverlayController,
  OverlayProviderComp,
} from '../../overlays/components/OverlayController'
import TreeNav from 'src/pageLayout/containers/TreeNav'
import {notify} from 'src/shared/actions/notifications'
import {supportRequestError} from 'src/shared/copy/notifications'

const setup = (quartzMe: Me) => {
  const newState = {
    me: {
      quartzMe,
    },
  }

  return renderWithReduxAndRouter(
    <>
      <OverlayProviderComp>
        <OverlayController />
      </OverlayProviderComp>
      <TreeNav />
    </>,
    defaultState => ({
      ...defaultState,
      ...newState,
    })
  )
}
jest.mock('src/shared/constants', () => ({CLOUD: true}))

const mockPostUiproxySFDCSupport = (success: boolean) => {
  switch (success) {
    case true:
      return Promise.resolve({
        status: 204,
        headers: {},
        data: null,
      })
    case false:
      return Promise.resolve({
        status: 500,
        headers: {},
        data: null,
      })
  }
}

describe('PAYG Contact Support', () => {
  afterEach(() => {
    cleanup()
  })

  it('can open payg account Contact Support overlay', async () => {
    const fakeAccount: Me = {
      id: '',
      email: '',
      accountType: 'pay_as_you_go',
      billingProvider: 'zuora',
      clusterHost: 'string',
      isRegionBeta: true,
      regionCode: 'string',
      regionName: 'string',
      isOperator: false,
      accountCreatedAt: 'string',
    }
    const {getByTestId} = setup(fakeAccount)

    expect(getByTestId('nav-item-support')).toBeVisible()

    const contactSupport = getByTestId('nav-subitem-contact-support')
    fireEvent.click(contactSupport)

    await waitFor(() => {
      expect(screen.queryByTitle('Submit')).toBeVisible()
    })

    // subject
    const supportSubject = getByTestId('contact-support-subject-input')
    fireEvent.change(supportSubject, {target: {value: 'Testing Subject'}})

    // severity
    const severityDropDownButton = getByTestId('dropdown--button')
    const severityDropDown = getByTestId('contact-support-dropdown')
    fireEvent.click(severityDropDownButton)
    fireEvent.click(severityDropDown)

    const selectOption = await screen.findByText('1 - Critical')
    fireEvent.click(selectOption)

    // description
    const supportDescription = getByTestId('support-description--textarea')
    fireEvent.change(supportDescription, {
      target: {value: 'Testing description area'},
    })

    // submit support request
    const submitButton = getByTestId('payg-contact-support--submit')
    expect(submitButton).not.toBeDisabled()

    await mockPostUiproxySFDCSupport(true)
    await waitFor(() => {
      fireEvent.click(submitButton)
    })

    const confirmationOverlay = getByTestId('confirmation-overlay-header')
    expect(confirmationOverlay).toBeVisible()
  })

  it('handles 500 error on submit', async () => {
    const fakeAccount: Me = {
      id: '',
      email: '',
      accountType: 'pay_as_you_go',
      billingProvider: 'zuora',
      clusterHost: 'string',
      isRegionBeta: true,
      regionCode: 'string',
      regionName: 'string',
      isOperator: false,
      accountCreatedAt: 'string',
    }
    const {getByTestId} = setup(fakeAccount)

    expect(getByTestId('nav-item-support')).toBeVisible()

    const contactSupport = getByTestId('nav-subitem-contact-support')
    fireEvent.click(contactSupport)

    await waitFor(() => {
      expect(screen.queryByTitle('Submit')).toBeVisible()
    })

    // subject
    const supportSubject = getByTestId('contact-support-subject-input')
    fireEvent.change(supportSubject, {target: {value: 'Testing Subject'}})

    // severity
    const severityDropDownButton = getByTestId('dropdown--button')
    const severityDropDown = getByTestId('contact-support-dropdown')
    fireEvent.click(severityDropDownButton)
    fireEvent.click(severityDropDown)

    const selectOption = await screen.findByText('1 - Critical')
    fireEvent.click(selectOption)

    // description
    const supportDescription = getByTestId('support-description--textarea')
    fireEvent.change(supportDescription, {
      target: {value: 'Testing description area'},
    })

    // submit support request
    const submitButton = getByTestId('payg-contact-support--submit')
    expect(submitButton).not.toBeDisabled()

    await mockPostUiproxySFDCSupport(false)
    await waitFor(() => {
      fireEvent.click(submitButton)
    })

    const [notifyCallArguments] = mocked(notify).mock.calls
    const [notifyMessage] = notifyCallArguments
    expect(notifyMessage).toEqual(supportRequestError())
  })
})

describe('Free Account Contact Support', () => {
  afterEach(() => {
    cleanup()
  })

  it('can open free account support overlay', async () => {
    const fakeAccount: Me = {
      id: '',
      email: '',
      accountType: 'free',
      billingProvider: 'zuora',
      clusterHost: 'string',
      isRegionBeta: true,
      regionCode: 'string',
      regionName: 'string',
      isOperator: false,
      accountCreatedAt: 'string',
    }
    const {getByTestId} = setup(fakeAccount)

    expect(getByTestId('nav-item-support')).toBeVisible()

    const contactSupport = getByTestId('nav-subitem-contact-support')
    fireEvent.click(contactSupport)

    await waitFor(() => {
      const freeAccountOverlay = screen.getByTestId(
        'free-support-overlay-header'
      )
      expect(freeAccountOverlay).toBeVisible()
    })
  })
})
