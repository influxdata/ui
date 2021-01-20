import {Checkout, makeInitial, toBackend} from './checkout'

describe('CheckoutV2.utils.checkout', () => {
  const countries = ['United States', 'A', 'B', 'C']
  const email = 'me@example.com'
  const states = ['X', 'Y', 'Z']

  describe('initialization', () => {
    test('creates new checkout object with defaults', () => {
      const checkout = makeInitial(email, states)

      expect(checkout).toEqual({
        street1: '',
        street2: '',
        city: '',
        country: countries[0],
        notifyEmail: email,
        intlSubdivision: '',
        balanceThreshold: 10,
        paymentMethodId: null,
        shouldNotify: true,
        usSubdivision: states[0],
        postalCode: '',
      })
    })
  })

  describe('converting from form values to backend format', () => {
    test('includes email and limits even if not notifying', () => {
      const checkout: Checkout = {
        ...makeInitial(email, states),
        shouldNotify: false,
      }
      const backend = toBackend(checkout)

      expect(backend).toMatchObject({
        notifyEmail: checkout.notifyEmail,
        balanceThreshold: checkout.balanceThreshold,
        shouldNotify: checkout.shouldNotify,
      })
    })

    test('includes email and limits if notifying', () => {
      const checkout: Checkout = {
        ...makeInitial(email, states),
        shouldNotify: true,
      }
      const backend = toBackend(checkout)

      expect(backend).toMatchObject({
        notifyEmail: checkout.notifyEmail,
        balanceThreshold: checkout.balanceThreshold,
        shouldNotify: checkout.shouldNotify,
      })
    })

    test('uses US state if country is US', () => {
      const checkout: Checkout = {
        ...makeInitial(email, states),
        country: 'United States',
        intlSubdivision: 'International State',
        usSubdivision: 'US State',
      }
      const backend = toBackend(checkout)

      expect(backend).toMatchObject({
        subdivision: checkout.usSubdivision,
      })
      expect(backend).not.toHaveProperty('intlSubdivision')
      expect(backend).not.toHaveProperty('usSubdivision')
    })

    test('uses international state if country is not US', () => {
      const checkout: Checkout = {
        ...makeInitial(email, states),
        country: 'B',
        intlSubdivision: 'International State',
        usSubdivision: 'US State',
      }
      const backend = toBackend(checkout)

      expect(backend).toMatchObject({
        subdivision: checkout.intlSubdivision,
      })
      expect(backend).not.toHaveProperty('intlSubdivision')
      expect(backend).not.toHaveProperty('usSubdivision')
    })
  })
})
