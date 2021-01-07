import React from 'react'

const BillingPageContext = React.createContext({
  contact: {},
  ccPageParams: {},
  countries: [],
  states: [],
})

export default BillingPageContext
