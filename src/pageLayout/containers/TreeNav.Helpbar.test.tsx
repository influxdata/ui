import React from 'react'
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react'
import {jest} from '@jest/globals'

// Imported mocks
import {
  OverlayController,
  OverlayProviderComp,
} from '../../overlays/components/OverlayController'
import TreeNav from 'src/pageLayout/containers/TreeNav'
import {notify} from 'src/shared/actions/notifications'
import {supportRequestError} from 'src/shared/copy/notifications'
import {renderWithReduxAndRouter} from 'src/mockState'

import {Me} from 'src/client/unityRoutes'

jest.mock('src/flows', () => {
  return () => <></>
})
jest.mock('src/pageLayout/utils', () => ({
  getNavItemActivation: jest.fn(() => {
    return false
  }),
}))
jest.mock('src/checks/components/NewThresholdCheckEO', () => () => null)
jest.mock('src/checks/components/NewDeadmanCheckEO', () => () => null)

jest.mock(
  'src/client/uiproxydRoutes',
  () => ({
    postUiproxySfdcSupport: (jest.fn() as any)
      .mockResolvedValueOnce({
        status: 204,
        headers: {},
        data: null,
      })
      .mockRejectedValueOnce({
        status: 500,
        headers: {},
        data: null,
      }),
  }),
  {virtual: true}
)

jest.mock('src/shared/utils/featureFlag', () => ({
  isFlagEnabled: jest.fn(() => true),
}))

jest.mock('src/cloud/utils/reporting', () => ({
  event: jest.fn(),
  updateReportingContext: jest.fn(),
}))
jest.mock('src/shared/actions/notifications')
jest.mock('src/shared/constants', () => ({CLOUD: true}))

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

describe('Free Account Contact Support', () => {
  afterEach(() => {
    cleanup()
  })

  it('opens support overlay for free account users', async () => {
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

describe('PAYG Contact Support', () => {
  it('can submit a support request from payg account', async () => {
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
    const severityDropDown = getByTestId('severity-level-dropdown')
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

    await waitFor(() => {
      fireEvent.click(submitButton)
    })

    const confirmationOverlay = getByTestId('confirmation-overlay-header')
    expect(confirmationOverlay).toBeVisible()
  })

  it('notifies user when support request has not been successfully submitted', async () => {
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
    const severityDropDown = getByTestId('severity-level-dropdown')
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

    await waitFor(() => {
      fireEvent.click(submitButton)
    })

    const [notifyCallArguments] = jest.mocked(notify).mock.calls
    const [notifyMessage] = notifyCallArguments
    expect(notifyMessage).toEqual(supportRequestError())
  })
})
