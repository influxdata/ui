import React from 'react'
import {render, screen} from '@testing-library/react'

import {ZuoraClient, ZuoraParams} from 'src/types/billing'

import ZuoraPaymentForm, {Props} from './ZuoraPaymentForm'

import {createTestClient, zuoraResponse} from 'js/testHelpers/zuora'

describe('CheckoutV2.ZuoraPaymentForm', () => {
  const zuoraParams: ZuoraParams = Object.freeze({
    id: 'zuoraId',
    tenantId: 'zuoraTenantId',
    key: 'zuoraKey',
    signature: 'zuoraSignature',
    token: 'zuoraToken',
    style: 'zuoraStyle',
    submitEnabled: 'true',
    url: 'zuoraURL',
  })

  let client: ZuoraClient = null

  beforeEach(() => {
    client = createTestClient()
  })

  test('renders Zuora div with appropriate id', () => {
    const renderSpy = jest.spyOn(client, 'render').mockImplementation(() => {
      expect(screen.getByTestId('payment-form')).toBeTruthy()
    })

    const props: Props = {
      client,
      zuoraParams,
      onSuccess: jest.fn(),
    }

    render(<ZuoraPaymentForm {...props} />)

    expect(renderSpy).toHaveBeenCalled()
  })

  test('calls Zuora render exactly once', () => {
    const onSuccess = jest.fn()

    const renderSpy = jest.spyOn(client, 'render')
    const props: Props = {onSuccess, zuoraParams, client}

    const {rerender} = render(<ZuoraPaymentForm {...props} />)

    rerender(<ZuoraPaymentForm {...props} />)

    expect(renderSpy).toHaveBeenCalledTimes(1)
  })

  test('does not re-render Zuora form on prop changes', () => {
    const clientRenderSpy = jest.spyOn(client, 'render')

    const {rerender} = render(
      <ZuoraPaymentForm
        client={client}
        zuoraParams={zuoraParams}
        onSuccess={_ => null}
      />
    )

    const newClient = createTestClient()
    const newClientRenderSpy = jest.spyOn(newClient, 'render')

    rerender(
      <ZuoraPaymentForm
        client={newClient}
        zuoraParams={{...zuoraParams}}
        onSuccess={_ => null}
      />
    )

    expect(clientRenderSpy).toBeCalledTimes(1)
    expect(newClientRenderSpy).toBeCalledTimes(0)
  })

  test('calls provided callback when Zuora form submitted', () => {
    const mockSuccess = jest.fn()

    render(
      <ZuoraPaymentForm
        client={client}
        zuoraParams={zuoraParams}
        onSuccess={mockSuccess}
      />
    )

    client.submit()

    expect(mockSuccess).toBeCalledWith(zuoraResponse.refId)
  })

  test('calls latest provided callback when Zuora form submitted', () => {
    const successMock = jest.fn()

    const {rerender} = render(
      <ZuoraPaymentForm
        client={client}
        zuoraParams={zuoraParams}
        onSuccess={successMock}
      />
    )

    const latestSuccessMock = jest.fn()

    rerender(
      <ZuoraPaymentForm
        client={client}
        zuoraParams={zuoraParams}
        onSuccess={latestSuccessMock}
      />
    )

    client.submit()

    expect(successMock).not.toHaveBeenCalled()
    expect(latestSuccessMock).toHaveBeenCalledWith(zuoraResponse.refId)
  })
})
