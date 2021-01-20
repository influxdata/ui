import React from 'react'
import {act} from '@testing-library/react'

import {renderForm, findAndClick} from 'js/testHelpers/formHelpers'
import CancelButton from './CancelButton'
import {useFormikContext} from 'formik'

import {Checkout, validationSchema, makeInitial} from './utils/checkout'

describe('CheckoutV2.CancelButton', () => {
  const touchedFields = {street1: true}

  let onClick = jest.fn()

  let triggerTouch: () => void
  let triggerAbandonedCartSpy: jest.SpyInstance

  const CancelForm = _ => {
    const {setTouched} = useFormikContext<Checkout>()

    triggerTouch = () =>
      act(() => {
        setTouched(touchedFields, true)
      })

    return <CancelButton onClick={onClick} />
  }

  const render = (extraFormikProps = {}) => {
    renderForm(<CancelForm />, {
      initialValues: makeInitial('testEmail', ['United States'], ['State']),
      validationSchema,
      ...extraFormikProps,
    })
  }

  beforeEach(() => {
    onClick = jest.fn()
    triggerAbandonedCartSpy = jest.spyOn(_abcr, 'triggerAbandonedCart')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('triggers cart abandonment if form is touched', () => {
    render()

    triggerTouch()
    findAndClick('Cancel')

    expect(triggerAbandonedCartSpy).toHaveBeenCalled()
    expect(onClick).toHaveBeenCalled()
  })

  test('does not trigger cart abandonment if form has not been touched', () => {
    render()

    findAndClick('Cancel')

    expect(triggerAbandonedCartSpy).not.toHaveBeenCalled()
    expect(onClick).toHaveBeenCalled()
  })
})
