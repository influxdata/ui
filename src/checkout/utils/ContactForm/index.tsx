import React, {FC, useContext} from 'react'

// Components
import CanadaContactForm from 'src/checkout/utils/ContactForm/CanadaContactForm'
import USContactForm from './USContactForm'
import IntlContactForm from './IntlContactForm'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

const ContactForm: FC = () => {
  const {inputs} = useContext(CheckoutContext)

  switch (inputs.country) {
    case 'United States':
      return <USContactForm />
    case 'Canada':
      return <CanadaContactForm />
    default:
      return <IntlContactForm />
  }
}

export default ContactForm
