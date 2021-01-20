import React from 'react'
import {screen} from '@testing-library/react'

import 'intersection-observer'
import {
  expectChangeDropdownValue,
  expectFormElementRequired,
  expectNoErrors,
  renderForm,
  submitForm,
  typeInInput,
} from 'js/testHelpers/formHelpers'
import {makeInitial, validationSchema} from './utils/contact'
import ContactForm from './ContactForm'

describe('CheckoutV2.ContactForm', () => {
  const countries = ['United States', 'Foo']
  const states = ['Bar', 'Baz']

  const render = (extraFormikProps = {}, defaultOverrides = {}) =>
    renderForm(<ContactForm countries={countries} states={states} />, {
      initialValues: {...makeInitial(countries, states), ...defaultOverrides},
      validationSchema,
      ...extraFormikProps,
    })

  test("doesn't call submit when required fields aren't filled out", async () => {
    const onSubmit = jest.fn()
    render({onSubmit})
    await submitForm()
    expect(onSubmit).toHaveBeenCalledTimes(0)
  })

  describe('when the country is US', () => {
    test('state is a dropdown', async () => {
      render()
      expect(screen.getByText('United States')).toBeInTheDocument()
      await expectChangeDropdownValue(states)
    })

    test('displays an error when its submitted with no city', async () => {
      render()
      await submitForm()
      await expectFormElementRequired('City')
    })

    test('displays an error when its submitted with no zip', async () => {
      render()
      await submitForm()
      await expectFormElementRequired('ZIP')
    })

    test('can submit form with only required fields', async () => {
      const onSubmit = jest.fn()

      render({onSubmit})
      typeInInput(/^city \*$/i, 'CITY')
      typeInInput(/^zip \*$/i, '12345')

      await submitForm()

      expectNoErrors()
      expect(onSubmit).toHaveBeenCalledWith(
        {
          country: countries[0],
          intlSubdivision: '',
          usSubdivision: states[0],
          city: 'CITY',
          postalCode: '12345',
          street1: '',
          street2: '',
        },
        expect.any(Object)
      )
    })

    test('can submit form with required and optional fields', async () => {
      const onSubmit = jest.fn()
      render({onSubmit})
      typeInInput(/^city \*$/i, 'CITY')
      typeInInput(/^zip \*$/i, '12345')
      typeInInput(/^address 1$/i, 'ADDRESS')
      typeInInput(/^address 2$/i, 'ADDRESS2')
      await submitForm()

      expectNoErrors()
      expect(onSubmit).toHaveBeenCalledWith(
        {
          country: countries[0],
          intlSubdivision: '',
          usSubdivision: states[0],
          city: 'CITY',
          postalCode: '12345',
          street1: 'ADDRESS',
          street2: 'ADDRESS2',
        },
        expect.any(Object)
      )
    })
  })

  describe('when the country is not us', () => {
    test('state starts as an empty input field', async () => {
      render()
      expect(
        screen.queryByRole('textbox', {name: /state/i})
      ).not.toBeInTheDocument()
      await expectChangeDropdownValue(countries)

      const stateInput = screen.getByRole('textbox', {name: /state/i})
      expect(stateInput).toHaveValue('')
    })

    test('when us is selected again, state goes back to being a dropdown defaulting to the first state', async () => {
      render()
      await expectChangeDropdownValue(countries)

      expect(screen.queryByText('United States')).not.toBeInTheDocument()
      expect(screen.queryByText(states[0])).not.toBeInTheDocument()

      await expectChangeDropdownValue(countries, 1, 0)

      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText(states[0])).toBeInTheDocument()
    })
  })

  describe('when the country is canada', () => {
    test('displays errors for required fields', async () => {
      render(undefined, {country: 'Canada'})
      await submitForm()
      await expectFormElementRequired('City')
    })

    test('can submit form with required fields', async () => {
      const onSubmit = jest.fn()
      render({onSubmit}, {country: 'Canada'})

      typeInInput(/^city \*$/i, 'CITY')
      await submitForm()

      expectNoErrors()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'Canada',
          intlSubdivision: '',
          city: 'CITY',
          postalCode: '',
          street1: '',
          street2: '',
        }),
        expect.any(Object)
      )
    })

    test('can submit form with required and optional fields', async () => {
      const onSubmit = jest.fn()
      render({onSubmit}, {country: 'Canada'})

      typeInInput(/^Province$/i, 'REGION')
      typeInInput(/^City \*$/i, 'CITY')
      typeInInput(/^Postal Code$/i, '12345')
      typeInInput(/^address 1$/i, 'ADDRESS')
      typeInInput(/^address 2$/i, 'ADDRESS2')
      await submitForm()

      expectNoErrors()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'Canada',
          intlSubdivision: 'REGION',
          city: 'CITY',
          postalCode: '12345',
          street1: 'ADDRESS',
          street2: 'ADDRESS2',
        }),
        expect.any(Object)
      )
    })
  })

  describe('when the country is not us or canada', () => {
    test('displays errors for required fields', async () => {
      render(undefined, {country: 'France'})
      await submitForm()
      await expectFormElementRequired('City / Town')
    })

    test('can submit form with required fields', async () => {
      const onSubmit = jest.fn()
      render({onSubmit}, {country: 'France'})

      typeInInput(/City \/ Town/i, 'CITY')
      await submitForm()

      expectNoErrors()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'France',
          intlSubdivision: '',
          city: 'CITY',
          postalCode: '',
          street1: '',
          street2: '',
        }),
        expect.any(Object)
      )
    })

    test('can submit form with required and optional fields', async () => {
      const onSubmit = jest.fn()
      render({onSubmit}, {country: 'France'})

      typeInInput(/^State \/ Province \/ Region$/i, 'REGION')
      typeInInput(/^City \/ Town \*$/i, 'CITY')
      typeInInput(/^ZIP \/ Postal Code$/i, '12345')
      typeInInput(/^address 1$/i, 'ADDRESS')
      typeInInput(/^address 2$/i, 'ADDRESS2')
      await submitForm()

      expectNoErrors()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'France',
          intlSubdivision: 'REGION',
          city: 'CITY',
          postalCode: '12345',
          street1: 'ADDRESS',
          street2: 'ADDRESS2',
        }),
        expect.any(Object)
      )
    })
  })
})
