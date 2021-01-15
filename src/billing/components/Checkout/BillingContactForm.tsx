import React, {ChangeEvent, FC, useState} from 'react'
import {
  Form,
  Input,
  Columns,
  SelectDropdown,
  ComponentColor,
  Button,
  ComponentStatus,
  Grid,
  Panel,
  ComponentSize,
  FlexBox,
  JustifyContent,
  Alert,
  IconFont,
} from '@influxdata/clockface'

import BillingContactSubdivision from 'src/billing/components/Checkout/BillingContactSudivision'
import {states, countries} from 'src/billing/constants'

import {convertKeysToSnakecase} from 'src/billing/utils/checkout'
import {useBilling} from 'src/billing/components/BillingPage'

type Props = {
  onSubmitForm: () => void
}

const BillingContactForm: FC<Props> = ({onSubmitForm}) => {
  const [
    {
      account: {billingContact},
    },
  ] = useBilling()

  const [inputs, setInputs] = useState({
    firstName: billingContact.firstName,
    lastName: billingContact.lastName,
    companyName: billingContact.companyName,
    street1: billingContact.street1,
    street2: billingContact.street2,
    city: billingContact.city,
    postalCode: billingContact.postalCode,
  })

  const [errorType, setErrorType] = useState('')

  const [country, setCountry] = useState(billingContact.country)
  const [subdivision, setSubdivision] = useState(billingContact.subdivision)

  const [countryError, setCountryError] = useState(false)
  const [subdivisionError, setSubdivisionError] = useState(false)

  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const requiredErrorText = 'This is a required field'

  const requiredFields = [
    'firstName',
    'lastName',
    'city',
    'companyName',
    'postalCode',
  ]
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target

    if (requiredFields.includes(name) && value.trim() === '') {
      setErrorType(name)
    }

    if (errorType === name && value.trim() !== '') {
      setErrorType('')
    }
    const inputState = {...inputs, [name]: value}
    setInputs(inputState)
  }

  const handleChangeSubdivision = subdivision => {
    setSubdivisionError(subdivision === '')
    setSubdivision(subdivision)
  }

  const handleChangeCountry = (nation: string) => {
    const state = nation === 'United States' ? states[0] : ''
    setCountry(nation)
    setCountryError(country === '')
    setSubdivision(state)
    setSubdivisionError(state === '')
  }

  const handleSubmitContactInfo = async contact => {
    const payload = {
      contact: convertKeysToSnakecase(contact),
    }
    setIsSubmittingContact(true)
    await fetch(`APIPrivate/billing_contact`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    setIsSubmittingContact(false)
  }

  const isContactInfoValid = () => {
    if (country.trim() === '') {
      setCountryError(true)
      return false
    }

    if (subdivision.trim() === '') {
      setSubdivisionError(true)
      return false
    }

    return requiredFields.every(field => {
      return inputs[field].trim() !== ''
    })
  }

  const handleConfirmContactInfo = async e => {
    e.preventDefault()

    const contact = {
      firstName: inputs.firstName,
      lastName: inputs.lastName,
      companyName: inputs.companyName,
      country,
      street1: inputs.street1,
      street2: inputs.street2,
      city: inputs.city,
      subdivision,
      postalCode: inputs.postalCode,
    }

    if (isContactInfoValid()) {
      try {
        await handleSubmitContactInfo(contact)
        onSubmitForm()
      } catch (_e) {
        setErrorMessage(
          'Could not update contact information, please try again.'
        )
        setIsSubmittingContact(false)
      }
    } else {
      setErrorMessage(
        'Looks like your billing information is incomplete. Please complete the form before resubmitting.'
      )
      setIsSubmittingContact(false)
    }
  }

  return (
    <>
      <Panel.Body size={ComponentSize.Large}>
        {errorMessage && (
          <Alert
            color={ComponentColor.Danger}
            icon={IconFont.AlertTriangle}
            className="billing-contact--alert"
          >
            {errorMessage}
          </Alert>
        )}
        <Form>
          <Grid>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="First Name"
                  required={true}
                  errorMessage={errorType === 'firstName' && requiredErrorText}
                >
                  <Input
                    autoFocus={true}
                    onChange={handleInputChange}
                    name="firstName"
                    titleText="First Name"
                    value={inputs.firstName}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="Last Name"
                  required={true}
                  errorMessage={errorType === 'lastName' && requiredErrorText}
                >
                  <Input
                    onChange={handleInputChange}
                    name="lastName"
                    titleText="Last Name"
                    value={inputs.lastName}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="Company Name"
                  required={true}
                  errorMessage={
                    errorType === 'companyName' && requiredErrorText
                  }
                >
                  <Input
                    onChange={handleInputChange}
                    name="companyName"
                    titleText="Company Name"
                    value={inputs.companyName}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="Country"
                  required={true}
                  errorMessage={countryError && requiredErrorText}
                >
                  <SelectDropdown
                    options={countries}
                    selectedOption={country}
                    onSelect={handleChangeCountry}
                    buttonColor={ComponentColor.Default}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element label="Address Street 1">
                  <Input
                    onChange={handleInputChange}
                    name="street1"
                    titleText="Address Street 1"
                    value={inputs.street1}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element label="Address Street 2">
                  <Input
                    onChange={handleInputChange}
                    name="street2"
                    titleText="Address Street 2"
                    value={inputs.street2}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="City"
                  required={true}
                  errorMessage={errorType === 'city' && requiredErrorText}
                >
                  <Input
                    onChange={handleInputChange}
                    name="city"
                    titleText="City"
                    value={inputs.city}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <BillingContactSubdivision
                  states={states}
                  country={country}
                  subdivision={subdivision}
                  errorMessage={subdivisionError && requiredErrorText}
                  onChange={handleChangeSubdivision}
                />
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="Postal Code"
                  required={true}
                  errorMessage={errorType === 'postalCode' && requiredErrorText}
                >
                  <Input
                    onChange={handleInputChange}
                    name="postalCode"
                    titleText="Postal Code"
                    value={inputs.postalCode}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>
      </Panel.Body>
      <Panel.Footer>
        <FlexBox justifyContent={JustifyContent.Center}>
          <Button
            text="Save Contact Info"
            onClick={handleConfirmContactInfo}
            color={ComponentColor.Primary}
            size={ComponentSize.Large}
            status={
              isSubmittingContact
                ? ComponentStatus.Loading
                : ComponentStatus.Default
            }
          />
        </FlexBox>
      </Panel.Footer>
    </>
  )
}

export default BillingContactForm
