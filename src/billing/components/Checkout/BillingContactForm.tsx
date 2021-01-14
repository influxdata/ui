import React, {FC, useState} from 'react'
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

  const [firstName, setFirstName] = useState(billingContact.firstName)
  const [lastName, setLastName] = useState(billingContact.lastName)
  const [companyName, setCompanyName] = useState(billingContact.companyName)
  const [country, setCountry] = useState(billingContact.country)
  const [street1, setStreet1] = useState(billingContact.street1)
  const [street2, setStreet2] = useState(billingContact.street2)
  const [city, setCity] = useState(billingContact.city)
  const [subdivision, setSubdivision] = useState(billingContact.subdivision)
  const [postalCode, setPostalCode] = useState(billingContact.postalCode)

  const [firstNameError, setFirstNameError] = useState(false)
  const [lastNameError, setLastNameError] = useState(false)
  const [companyNameError, setCompanyNameError] = useState(false)
  const [countryError, setCountryError] = useState(false)
  const [cityError, setCityError] = useState(false)
  const [subdivisionError, setSubdivisionError] = useState(false)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const requiredErrorText = 'This is a required field'

  const handleSetFirstName = (e): void => {
    const {value} = e.target
    setFirstNameError(value.trim() === '')
    setFirstName(value)
  }

  const handleSetLastName = (e): void => {
    const {value} = e.target
    setLastNameError(value.trim() === '')
    setLastName(value)
  }

  const handleCityChange = (e): void => {
    const {value} = e.target
    setCityError(value.trim() === '')
    setCity(value)
  }

  const handleStreet1Change = (e): void => {
    const {value} = e.target
    setStreet1(value)
  }

  const handleStreet2Change = (e): void => {
    const {value} = e.target
    setStreet2(value)
  }

  const handlePostalCodeChange = (e): void => {
    const {value} = e.target
    setPostalCode(value)
  }

  const handleSetCompanyName = (e): void => {
    const {value} = e.target
    setCompanyNameError(value.trim() === '')
    setCompanyName(value)
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

  const isContactInfoValid = ({
    firstName,
    lastName,
    companyName,
    country,
    city,
    subdivision,
  }) => {
    if (firstName.trim() === '') {
      setFirstNameError(true)
      return false
    }

    if (lastName.trim() === '') {
      setLastNameError(true)
      return false
    }

    if (companyName.trim() === '') {
      setCompanyNameError(true)
      return false
    }

    if (country.trim() === '') {
      setCountryError(true)
      return false
    }

    if (city.trim() === '') {
      setCityError(true)
      return false
    }

    if (subdivision.trim() === '') {
      setSubdivisionError(true)
      return false
    }

    return true
  }

  const handleConfirmContactInfo = async e => {
    e.preventDefault()

    const contact = {
      firstName,
      lastName,
      companyName,
      country,
      street1,
      street2,
      city,
      subdivision,
      postalCode,
    }

    if (isContactInfoValid(contact)) {
      try {
        await handleSubmitContactInfo(contact)
        onSubmitForm()
      } catch (_e) {
        setErrorMessage(
          'Could not update contact information, please try again.'
        )
        setIsSubmittingContact(false)
      }
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
                  errorMessage={firstNameError && requiredErrorText}
                >
                  <Input
                    autoFocus={true}
                    onChange={handleSetFirstName}
                    name="firstName"
                    titleText="First Name"
                    value={firstName}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="Last Name"
                  required={true}
                  errorMessage={lastNameError && requiredErrorText}
                >
                  <Input
                    onChange={handleSetLastName}
                    name="lastName"
                    titleText="Last Name"
                    value={lastName}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="Company Name"
                  required={true}
                  errorMessage={companyNameError && requiredErrorText}
                >
                  <Input
                    onChange={handleSetCompanyName}
                    name="companyName"
                    titleText="Company Name"
                    value={companyName}
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
                    onChange={handleStreet1Change}
                    name="street1"
                    titleText="Address Street 1"
                    value={street1}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element label="Address Street 2">
                  <Input
                    onChange={handleStreet2Change}
                    name="street2"
                    titleText="Address Street 2"
                    value={street2}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
                <Form.Element
                  label="City"
                  required={true}
                  errorMessage={cityError && requiredErrorText}
                >
                  <Input
                    onChange={handleCityChange}
                    name="city"
                    titleText="City"
                    value={city}
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
                <Form.Element label="Postal Code">
                  <Input
                    onChange={handlePostalCodeChange}
                    name="postalCode"
                    titleText="Postal Code"
                    value={postalCode}
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
