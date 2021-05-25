import React, {FC, useContext} from 'react'
import {
  AppWrapper,
  AlignItems,
  Bullet,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  CTAButton,
  FlexBox,
  Form,
  FunnelPage,
  Gradients,
  Heading,
  HeadingElement,
  JustifyContent,
  Panel,
} from '@influxdata/clockface'

// Components
import ContactForm from 'src/checkout/utils/ContactForm'
import CancelButton from 'src/checkout/CancelButton'
import NotificationSettingsForm from 'src/checkout/NotificationSettingsForm'
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import PoweredByStripeLogo from 'src/checkout/PoweredByStripeLogo'
import CreditCardForm from 'src/shared/components/CreditCardForm'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Types

const CheckoutForm: FC = () => {
  const {
    handleFormValidation,
    zuoraParams,
    handleSubmit,
    setIsDirty,
  } = useContext(CheckoutContext)

  const onSubmit = () => {
    if (handleFormValidation() > 0) {
      return
    }

    try {
      Z.submit()
    } catch (error) {
      console.error(error)
      // TODO(ariel): what should we do if there's an error?
    }
  }

  const {isSubmitting} = useContext(CheckoutContext)

  return (
    <Form noValidate onSubmit={onSubmit}>
      <AppWrapper type="funnel">
        <FunnelPage logo={<LogoWithCubo />} enableGraphic={true}>
          <h1
            data-testid="checkout-page--header"
            className="cf-funnel-page--title checkout-header"
          >
            Upgrade to Usage-Based Account
          </h1>
          <Panel gradient={Gradients.BeijingEclipse}>
            <Panel.Body size={ComponentSize.Medium}>
              <p className="checkout-summary">
                No upfront commitment, pay only for what you use, and you can
                turn off at any time. <br /> You can set notifications to be
                alerted if your charges reach the limits you define. <br /> Have
                any questions? Check out our{' '}
                <a
                  href="https://www.influxdata.com/influxdb-pricing/"
                  target="_blank"
                >
                  InfluxDB Cloud Pricing
                </a>
                .
              </p>
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.SymbolHeader
              size={ComponentSize.Medium}
              symbol={<Bullet text={1} />}
              title={
                <Heading
                  element={HeadingElement.H2}
                  appearance={HeadingElement.H5}
                >
                  Set My Limits
                </Heading>
              }
            />
            <Panel.Body>
              <NotificationSettingsForm />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.SymbolHeader
              size={ComponentSize.Medium}
              symbol={<Bullet text={2} />}
              title={
                <FlexBox
                  justifyContent={JustifyContent.SpaceBetween}
                  stretchToFitWidth={true}
                  className="powered-by-payment-header"
                >
                  <Heading
                    element={HeadingElement.H2}
                    appearance={HeadingElement.H5}
                  >
                    Payment Information
                  </Heading>
                  <PoweredByStripeLogo />
                </FlexBox>
              }
            />
            <Panel.Body size={ComponentSize.Medium}>
              <CreditCardForm
                key="zuora_payment"
                onFocus={() => setIsDirty(true)}
                data-reactid="zuorapaymentform"
                zuoraParams={zuoraParams}
                onSubmit={handleSubmit}
              />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.SymbolHeader
              size={ComponentSize.Medium}
              symbol={<Bullet text={3} />}
              title={
                <Heading
                  element={HeadingElement.H2}
                  appearance={HeadingElement.H5}
                >
                  Billing Address
                </Heading>
              }
            />
            <Panel.Body>
              <ContactForm />
            </Panel.Body>
          </Panel>
        </FunnelPage>
        <FunnelPage.Footer>
          <FunnelPage.FooterSection>
            <FlexBox
              alignItems={AlignItems.Center}
              margin={ComponentSize.Large}
              justifyContent={JustifyContent.Center}
            >
              <CancelButton />
              <CTAButton
                color={ComponentColor.Primary}
                status={
                  isSubmitting
                    ? ComponentStatus.Loading
                    : ComponentStatus.Default
                }
                text="Upgrade"
                type={ButtonType.Submit}
                id="button-upgrade" // for google-analytics
                testID="checkout-upgrade--button"
              />
            </FlexBox>
          </FunnelPage.FooterSection>
        </FunnelPage.Footer>
      </AppWrapper>
    </Form>
  )
}

export default CheckoutForm
