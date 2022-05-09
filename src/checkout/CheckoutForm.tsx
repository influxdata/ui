import React, {FC, useContext} from 'react'
import {
  AlignItems,
  AppWrapper,
  BannerPanel,
  Bullet,
  ButtonType,
  CTAButton,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  Form,
  FunnelPage,
  Gradients,
  Heading,
  HeadingElement,
  Icon,
  IconFont,
  InfluxColors,
  JustifyContent,
  Panel,
} from '@influxdata/clockface'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'

// Components
import ContactForm from 'src/checkout/utils/ContactForm'
import CancelButton from 'src/checkout/CancelButton'
import NotificationSettingsForm from 'src/checkout/NotificationSettingsForm'
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import PoweredByStripeLogo from 'src/checkout/PoweredByStripeLogo'
import CreditCardForm from 'src/shared/components/CreditCardForm'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Events
import {event} from 'src/cloud/utils/reporting'

// Constants
import {
  CREDIT_250_EXPERIMENT_ID,
  PAYG_CREDIT_EXPERIMENT_ID,
} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const CheckoutForm: FC = () => {
  const {
    handleFormValidation,
    zuoraParams,
    handleSubmit,
    setIsDirty,
    isSubmitting,
    isPaygCreditActive,
  } = useContext(CheckoutContext)

  const onSubmit = () => {
    if (handleFormValidation() > 0) {
      return
    }

    try {
      event('User Upgrade Payment Plan')
      Z.submit()
    } catch (error) {
      // Ingest the error since the Zuora Form will return an error form based on the error returned
      // And the parent component will notify the user of an error based on error state and a notification
      console.error(error)
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <AppWrapper type="funnel">
        <FunnelPage logo={<LogoWithCubo />} enableGraphic={true}>
          <h1
            data-testid="checkout-page--header"
            className="cf-funnel-page--title checkout-header"
          >
            Upgrade to Usage-Based Account
          </h1>
          {isFlagEnabled('credit250Experiment') && (
            <GoogleOptimizeExperiment
              experimentID={CREDIT_250_EXPERIMENT_ID}
              variants={[
                <BannerPanel
                  key="credit-250-banner"
                  gradient={Gradients.Info}
                  size={ComponentSize.Small}
                  textColor={InfluxColors.White}
                >
                  <span className="checkout-credit-250--banner">
                    <Icon
                      className="checkout-credit-250--banner-icon"
                      glyph={IconFont.Star}
                    />
                    <span className="checkout-credit-250--banner-message">
                      Get free $250 credit for the first 30 days once you
                      upgrade
                    </span>
                  </span>
                </BannerPanel>,
              ]}
            />
          )}
          <Panel
            gradient={Gradients.BeijingEclipse}
            className="checkout--panel"
          >
            <Panel.Body size={ComponentSize.Medium}>
              <p className="checkout-summary">
                No upfront commitment, pay only for what you use, and you can
                turn off at any time. <br /> You can set notifications to be
                alerted if your charges reach the limits you define. <br /> Have
                any questions? Check out our{' '}
                <SafeBlankLink href="https://www.influxdata.com/influxdb-pricing/">
                  InfluxDB Cloud Pricing
                </SafeBlankLink>
                .
              </p>

              {isPaygCreditActive && (
                <GoogleOptimizeExperiment
                  experimentID={PAYG_CREDIT_EXPERIMENT_ID}
                  variants={[
                    <div
                      className="checkout-form--banner"
                      key="checkout-form-banner"
                    >
                      <strong className="checkout-banner--credit">$250</strong>
                      <p>credit applied</p>
                    </div>,
                  ]}
                />
              )}
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
                  Send Me Alerts
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
