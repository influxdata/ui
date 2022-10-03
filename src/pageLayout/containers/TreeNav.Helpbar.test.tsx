import React from 'react'
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react'
import {jest} from '@jest/globals'

// Mocks
const identityMock = {
  user: {
    id: '03b0f952abf7e5ce',
    email: 'test@influxdata.com',
    firstName: 'Marty',
    lastName: 'McFly',
    operatorRole: null,
    accountCount: 1,
    orgCount: 1,
  },

  org: {
    id: 'a12eb3c74e6c3azc',
    name: 'Test Organization',
    clusterHost: 'https://us-west1.iamzuora.cloud2.influxdata.com',
  },

  account: {
    id: 416,
    name: 'Influx',
    type: 'free',
    accountCreatedAt:
      'Tue Jun 01 2022 08:49:14 GMT-0400 (Eastern Daylight Time)',
    isUpgradeable: false,
  },
}

// Imported mocks
import {
  OverlayController,
  OverlayProviderComp,
} from 'src/overlays/components/OverlayController'
import TreeNav from 'src/pageLayout/containers/TreeNav'
import {notify} from 'src/shared/actions/notifications'
import {supportRequestError} from 'src/shared/copy/notifications'
import {renderWithReduxAndRouter} from 'src/mockState'

// Utils
import {cloneDeep} from 'lodash'

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

const setup = currentIdentity => {
  const newState = {
    identity: {
      currentIdentity,
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

  const freeAccountMock = cloneDeep(identityMock)

  it('opens support overlay for free account users', async () => {
    const {getByTestId} = setup(freeAccountMock)

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
    const paygMock = cloneDeep(identityMock)
    paygMock.account.type = 'pay_as_you_go'

    const {getByTestId} = setup(paygMock)

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
    const paygMock = cloneDeep(identityMock)
    paygMock.account.type = 'pay_as_you_go'
    const {getByTestId} = setup(paygMock)

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
