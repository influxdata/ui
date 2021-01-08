import React, {Fragment} from 'react'
import {
  Form,
  Input,
  SelectDropdown,
  ComponentColor,
  Button,
  ComponentStatus,
  Grid,
  GridRow,
  GridColumn,
  Panel,
  ComponentSize,
  FlexBox,
  JustifyContent,
  Alert,
  IconFont,
} from '@influxdata/clockface'

import BillingContactSubdivision from 'src/billing/components/Checkout/BillingContactSudivision'

import 'babel-polyfill'
import axios from 'axios'
import {convertKeysToSnakecase} from 'src/billing/utils/checkout'

class BillingContactForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = this.defaultState()
  }

  render() {
    const {
      firstName,
      lastName,
      companyName,
      country,
      street1,
      street2,
      subdivision,
      city,
      postalCode,
      firstNameError,
      lastNameError,
      companyNameError,
      countryError,
      subdivisionError,
      cityError,
      isSubmittingContact,
      errorMessage,
    } = this.state

    const {states, countries} = this.props

    const requiredErrorText = 'This is a required field'

    return (
      <Fragment>
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
              <GridRow>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element
                    label="First Name"
                    required={true}
                    errorMessage={firstNameError && requiredErrorText}
                  >
                    <Input
                      autoFocus={true}
                      onChange={this.handleRequiredInputChange}
                      name="firstName"
                      title="First Name"
                      value={firstName}
                    />
                  </Form.Element>
                </GridColumn>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element
                    label="Last Name"
                    required={true}
                    errorMessage={lastNameError && requiredErrorText}
                  >
                    <Input
                      onChange={this.handleRequiredInputChange}
                      name="lastName"
                      title="Last Name"
                      value={lastName}
                    />
                  </Form.Element>
                </GridColumn>
              </GridRow>
              <GridRow>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element
                    label="Company Name"
                    required={true}
                    errorMessage={companyNameError && requiredErrorText}
                  >
                    <Input
                      onChange={this.handleRequiredInputChange}
                      name="companyName"
                      title="Company Name"
                      value={companyName}
                    />
                  </Form.Element>
                </GridColumn>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element
                    label="Country"
                    required={true}
                    errorMessage={countryError && requiredErrorText}
                  >
                    <SelectDropdown
                      titleText="Country"
                      options={countries}
                      selectedOption={country}
                      onSelect={this.handleChangeCountry}
                      buttonColor={ComponentColor.Default}
                    />
                  </Form.Element>
                </GridColumn>
              </GridRow>
              <GridRow>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element label="Address Street 1">
                    <Input
                      onChange={this.handleInputChange}
                      name="street1"
                      title="Address Street 1"
                      value={street1}
                    />
                  </Form.Element>
                </GridColumn>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element label="Address Street 2">
                    <Input
                      onChange={this.handleInputChange}
                      name="street2"
                      title="Address Street 2"
                      value={street2}
                    />
                  </Form.Element>
                </GridColumn>
              </GridRow>
              <GridRow>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element
                    label="City"
                    required={true}
                    errorMessage={cityError && requiredErrorText}
                  >
                    <Input
                      onChange={this.handleRequiredInputChange}
                      name="city"
                      title="City"
                      value={city}
                    />
                  </Form.Element>
                </GridColumn>
                <GridColumn widthXS="12" widthSM="4">
                  <BillingContactSubdivision
                    states={states}
                    country={country}
                    subdivision={subdivision}
                    errorMessage={subdivisionError && requiredErrorText}
                    onChange={this.handleChangeSubdivision}
                  />
                </GridColumn>
                <GridColumn widthXS="12" widthSM="4">
                  <Form.Element label="Postal Code">
                    <Input
                      onChange={this.handleInputChange}
                      name="postalCode"
                      title="Postal Code"
                      value={postalCode}
                    />
                  </Form.Element>
                </GridColumn>
              </GridRow>
            </Grid>
          </Form>
        </Panel.Body>
        <Panel.Footer>
          <FlexBox justifyContent={JustifyContent.Center}>
            <Button
              text="Save Contact Info"
              onClick={this.handleConfirmContactInfo}
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
      </Fragment>
    )
  }

  defaultState() {
    const contact = this.props.contact
    return {
      firstName: contact ? contact.firstName : '',
      firstNameError: false,
      lastName: contact ? contact.lastName : '',
      lastNameError: false,
      companyName: contact ? contact.companyName : '',
      companyNameError: false,
      street1: (contact && contact.street1) || '',
      street2: (contact && contact.street2) || '',
      postalCode: (contact && contact.postalCode) || '',
      country: (contact && contact.country) || 'United States',
      countryError: false,
      city: (contact && contact.city) || '',
      cityError: false,
      subdivision: (contact && contact.subdivision) || this.props.states[0],
      subdivisionError: false,
      errorMessage: '',
    }
  }

  handleRequiredInputChange = e => {
    const {name, value} = e.target

    const errorField = `${name}Error`
    const isError = value.trim() === ''

    this.setState({
      [name]: value,
      [errorField]: isError,
    })
  }

  handleInputChange = e => {
    const {name, value} = e.target
    this.setState({
      [name]: value,
    })
  }

  handleChangeSubdivision = subdivision => {
    this.setState({
      subdivision,
      subdivisionError: subdivision === '',
    })
  }

  handleChangeCountry = country => {
    const subdivision = country === 'United States' ? this.props.states[0] : ''

    this.setState({
      country,
      countryError: country === '',
      subdivision,
      subdivisionError: subdivision === '',
    })
  }

  handleSubmitContactInfo = async contact => {
    const payload = {
      contact: convertKeysToSnakecase(contact),
    }
    this.setState({isSubmittingContact: true})
    await axios.put(`APIPrivate/billing_contact`, payload)
    this.setState({isSubmittingContact: false})
  }

  isContactInfoValid = ({
    firstName,
    lastName,
    companyName,
    country,
    city,
    subdivision,
  }) => {
    if (firstName.trim() === '') {
      this.setState({firstNameError: true})
      return false
    }

    if (lastName.trim() === '') {
      this.setState({lastNameError: true})
      return false
    }

    if (companyName.trim() === '') {
      this.setState({companyNameError: true})
      return false
    }

    if (country.trim() === '') {
      this.setState({countryError: true})
      return false
    }

    if (city.trim() === '') {
      this.setState({cityError: true})
      return false
    }

    if (subdivision.trim() === '') {
      this.setState({subdivisionError: true})
      return false
    }

    return true
  }

  handleConfirmContactInfo = async e => {
    e.preventDefault()

    const {
      firstName,
      lastName,
      companyName,
      country,
      street1,
      street2,
      city,
      subdivision,
      postalCode,
    } = this.state
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

    if (this.isContactInfoValid(contact)) {
      try {
        await this.handleSubmitContactInfo(contact)
        this.props.onSubmit(contact)
      } catch (_e) {
        this.setState({
          errorMessage:
            'Could not update contact information, please try again.',
          isSubmittingContact: false,
        })
      }
    }
  }
}

export default BillingContactForm
