// Library
import React, {ChangeEvent, FC, useContext, useState} from 'react'
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
  InputType,
  ButtonType,
} from '@influxdata/clockface'
import {useDispatch} from 'react-redux'

// Components
import {BillingContext} from 'src/billing/context/billing'
import BillingContactSubdivision from 'src/billing/components/Checkout/BillingContactSudivision'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {billingContactIncompleteError} from 'src/shared/copy/notifications'

// Constants
import {states, countries} from 'src/billing/constants'

// Types
import {BillingContact} from 'src/types'

type Props = {
  toggleEditingOff: () => void
}

const BillingContactForm: FC<Props> = ({toggleEditingOff}) => {
  const {
    billingInfo: {contact},
    handleUpdateBillingContact,
  } = useContext(BillingContext)

  const dispatch = useDispatch()

  const [inputs, setInputs] = useState({
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    companyName: contact.companyName,
    street1: contact.street1,
    street2: contact.street2,
    city: contact.city,
    postalCode: contact.postalCode,
  })

  const [errorType, setErrorType] = useState('')

  const [country, setCountry] = useState(contact.country)
  const [subdivision, setSubdivision] = useState(contact.subdivision)

  const [countryError, setCountryError] = useState(false)
  const [subdivisionError, setSubdivisionError] = useState(false)

  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  const requiredErrorText = 'This is a required field'

  const requiredFields = [
    'email',
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

  const handleConfirmContactInfo = async () => {
    const contact = {
      email: inputs.email,
      firstName: inputs.firstName,
      lastName: inputs.lastName,
      companyName: inputs.companyName,
      country,
      street1: inputs.street1,
      street2: inputs.street2,
      city: inputs.city,
      subdivision,
      postalCode: inputs.postalCode,
    } as BillingContact

    setIsSubmittingContact(true)

    if (isContactInfoValid()) {
      await handleUpdateBillingContact(contact)
      toggleEditingOff()
      setIsSubmittingContact(false)
    } else {
      dispatch(notify(billingContactIncompleteError()))
    }
    setIsSubmittingContact(false)
  }

  return (
    <Form onSubmit={handleConfirmContactInfo}>
      <Panel.Body size={ComponentSize.Large}>
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Eight}>
              <Form.Element
                label="Email Address"
                required={true}
                errorMessage={errorType === 'email' && requiredErrorText}
              >
                <Input
                  autoFocus={true}
                  onChange={handleInputChange}
                  name="email"
                  titleText="Email Address"
                  value={inputs.email}
                  type={InputType.Email}
                  testID="form-input--email"
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
              <Form.Element
                label="First Name"
                required={true}
                errorMessage={errorType === 'firstName' && requiredErrorText}
              >
                <Input
                  onChange={handleInputChange}
                  name="firstName"
                  titleText="First Name"
                  value={inputs.firstName}
                  testID="form-input--firstname"
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
                  testID="form-input--lastname"
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
              <Form.Element
                label="Company Name"
                required={true}
                errorMessage={errorType === 'companyName' && requiredErrorText}
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
      </Panel.Body>
      <Panel.Footer>
        <FlexBox justifyContent={JustifyContent.Center}>
          <Button
            text="Save Contact Info"
            type={ButtonType.Submit}
            color={ComponentColor.Primary}
            size={ComponentSize.Large}
            status={
              isSubmittingContact
                ? ComponentStatus.Loading
                : ComponentStatus.Default
            }
            testID="save-contact--button"
          />
        </FlexBox>
      </Panel.Footer>
    </Form>
  )
}

export default BillingContactForm
