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
import ContactForm from 'src/checkout/ContactForm'
import CancelButton from 'src/checkout/CancelButton'
import NotificationSettingsForm from 'src/checkout/NotificationSettingsForm'
import ZuoraPaymentForm from 'src/checkout/ZuoraPaymentForm'
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import PoweredByStripeLogo from 'src/checkout/PoweredByStripeLogo'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Types

const CheckoutForm: FC = () => {
  const {zuoraParams, handleSetInputs, handleSubmit, isSubmitting} = useContext(
    CheckoutContext
  )

  // const {
  //   isSubmitting,
  //   setFieldValue,
  //   setFieldTouched,
  //   submitForm,
  //   validateForm,
  //   initialValues,
  //   values,
  // } = formikContext

  // const onZuoraSuccess = async (paymentMethodId: string) => {
  //   await handleSetInputs('paymentMethodId', paymentMethodId)

  //   try {
  //     await submitForm()
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  // async function resetNotificationSettingsIfDisabled() {
  //   // Solve for the edge case where a user enables settings,
  //   // deletes the values in the name and threshold fields,
  //   // disables settings, and then submits the form.

  //   if (!values.shouldNotify) {
  //     await resetIfEmpty('notifyEmail')
  //     await resetIfEmpty('balanceThreshold')
  //   }
  // }

  // const validateQuartzForms = async (): Promise<boolean> => {
  //   await resetNotificationSettingsIfDisabled()

  //   const errors = await validateForm()

  //   if (Object.keys(errors).length === 0) {
  //     return true
  //   } else {
  //     // Touch all error fields on submit so we show the message
  //     // https://github.com/formium/formik/issues/2734#issuecomment-690810715
  //     return false
  //   }
  // }

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <AppWrapper type="funnel">
        <FunnelPage logo={<LogoWithCubo />} enableGraphic={true}>
          <h1 className="cf-funnel-page--title checkout-header">
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
                  href="https://www.influxdata.com/influxdb-cloud-pricing-faq/"
                  target="_blank"
                >
                  Pricing FAQ
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
              {/* <ZuoraPaymentForm
                zuoraParams={zuoraParams}
                client={Z}
                onSuccess={onZuoraSuccess}
                onFocus={() => setFieldTouched('paymentMethodId', true, false)}
              /> */}
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
              <CancelButton onClick={_ => (window.location.href = '/')} />
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
              />
            </FlexBox>
          </FunnelPage.FooterSection>
        </FunnelPage.Footer>
      </AppWrapper>
    </Form>
  )
}

export default CheckoutForm
