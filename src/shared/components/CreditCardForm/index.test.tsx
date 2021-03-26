import React from 'react'
import {render, screen, act, waitFor} from '@testing-library/react'

import {ZuoraClient, CreditCardParams} from '../../../types/billing'
import {RemoteDataState} from '../../../types'

import CreditCardForm, {Props} from './index'

interface ZuoraResponse {
  success: boolean
  responseFrom: string
  refId: string
}

export const zuoraResponse: ZuoraResponse = {
  responseFrom: 'zuora',
  success: true,
  refId: 'somePaymentMethodID',
}

export const createTestClient = (
  response: ZuoraResponse = zuoraResponse
): ZuoraClient => {
  let handleSubmit = null

  return {
    render: (_zuoraParams, _presets, onSubmit) => {
      handleSubmit = onSubmit
    },
    submit: () => {
      handleSubmit(response)
    },
  }
}

describe('CheckoutV2.CreditCardForm', () => {
    const zuoraParams: CreditCardParams = Object.freeze({
      id: 'zuoraId',
      tenantId: 'zuoraTenantId',
      key: 'zuoraKey',
      signature: 'zuoraSignature',
      token: 'zuoraToken',
      style: 'zuoraStyle',
      submitEnabled: 'false',
      url: 'zuoraURL',
      status: RemoteDataState.Done
    })

    let zuoraClient: ZuoraClient = null

    beforeEach(() => {
      zuoraClient = createTestClient()
    })

    test('renders Zuora div with appropriate id', () => {
      const onSubmit = jest.fn()
      const renderSpy = jest.spyOn(zuoraClient, 'render').mockImplementation(() => {
        expect(screen.getByTestId('payment-form')).toBeTruthy()
      })

      const props: Props = {
        zuoraParams,
        onSubmit,
        zuoraClient
      }

      render(<CreditCardForm {...props} />)

      expect(renderSpy).toHaveBeenCalled()
    })

    test('calls Zuora render exactly once', () => {
      const onSubmit = jest.fn()
      const renderSpy = jest.spyOn(zuoraClient, 'render')
      const props: Props = {onSubmit, zuoraParams, zuoraClient}

      const {rerender} = render(<CreditCardForm {...props} />)

      rerender(<CreditCardForm {...props} />)

      expect(renderSpy).toHaveBeenCalledTimes(1)
    })

    test('does not re-render Zuora form on prop changes', () => {
      const onSubmit = jest.fn()
      const clientRenderSpy = jest.spyOn(zuoraClient, 'render')
      const props: Props = {onSubmit, zuoraParams, zuoraClient}

      const {rerender} = render(<CreditCardForm {...props} />)

      const newClient = createTestClient()
      const newClientRenderSpy = jest.spyOn(newClient, 'render')

      rerender(<CreditCardForm {...props} />)

      expect(clientRenderSpy).toBeCalledTimes(1)
      expect(newClientRenderSpy).toBeCalledTimes(0)
    })

    test('calls provided callback when Zuora form submitted', async () => {
      const onSubmit = jest.fn()
      const renderSpy = jest.spyOn(zuoraClient, 'render')
      const props: Props = {onSubmit, zuoraParams, zuoraClient}

      render(<CreditCardForm {...props} />)

      act(() => zuoraClient.submit())
      await waitFor(()=>{
        expect(renderSpy).toBeCalledTimes(1)
        expect(onSubmit).toBeCalledTimes(1)
        expect(onSubmit).toBeCalledWith(zuoraResponse.refId)
      }, {timeout: 1000})
    })

    test('calls latest provided callback when Zuora form submitted', async () => {
      const onSubmit = jest.fn()
      const renderSpy = jest.spyOn(zuoraClient, 'render')
      const {rerender} = render(
        <CreditCardForm
        zuoraClient={zuoraClient}
        zuoraParams={zuoraParams}
        onSubmit={onSubmit}
        />
      )

      const latestSubmitMock = jest.fn()
      const latestClient = createTestClient()

      rerender(
        <CreditCardForm
        zuoraClient={latestClient}
        zuoraParams={zuoraParams}
        onSubmit={latestSubmitMock}
        />
      )

      act(() => zuoraClient.submit())
      await waitFor(()=>{
        expect(onSubmit).not.toHaveBeenCalled()
        expect(renderSpy).toBeCalledTimes(1)
        expect(latestSubmitMock).toHaveBeenCalledWith(zuoraResponse.refId)
      }, {timeout: 1000})

    })
})
