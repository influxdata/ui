// Libraries
import React, {FC, useCallback, useContext} from 'react'

// Contexts
import {AppSettingContext} from 'src/shared/contexts/app'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
  InputLabel,
  Button,
  Icon,
  IconFont,
  JustifyContent,
  ComponentColor,
  ButtonType,
  Overlay,
  FlexBoxChild,
  ClickOutside,
} from '@influxdata/clockface'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import TextAreaWithLabel from 'src/writeData/subscriptions/components/TextAreaWithLabel'
import {event} from 'src/cloud/utils/reporting'
import {useDispatch} from 'react-redux'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {Subscription} from 'src/types'
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface OwnProps {
  edit?: boolean
  updateForm: (_: Subscription) => void
  subscription: Subscription
}

const NewCertificateInput: FC<OwnProps> = ({updateForm, subscription}) => {
  const handleUpdateCACert = useCallback(
    e => {
      updateForm({...subscription, brokerCACert: e.target.value})
    },
    [subscription, updateForm]
  )
  const handleUpdatePrivateKey = useCallback(
    e => {
      updateForm({...subscription, brokerClientKey: e.target.value})
    },
    [subscription, updateForm]
  )
  const handleUpdateCert = useCallback(
    e => {
      updateForm({...subscription, brokerClientCert: e.target.value})
    },
    [subscription, updateForm]
  )

  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      justifyContent={JustifyContent.Center}
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
    >
      <InputLabel size={ComponentSize.Medium}>
        TODO: CHANGE THIS We download your certs and put those
        <br />
        on a 1.44 inch floppy disk. The Gen Z/Alpha don't even
        <br />
        know about Floppy Drive.. So, we're gewd..
      </InputLabel>
      <TextAreaWithLabel
        name="Certificate"
        label="Certificate authority"
        description="TODO: Fix this"
        onChange={handleUpdateCACert}
        value={subscription?.brokerCACert ?? ''}
        placeholder={CertificatePlaceholders.caCert}
        rows={4}
        required
      />
      <TextAreaWithLabel
        name="PrivateKey"
        label="Private Key"
        onChange={handleUpdatePrivateKey}
        placeholder={CertificatePlaceholders.clientKey}
        value={subscription?.brokerClientKey ?? ''}
        rows={4}
      />
      <TextAreaWithLabel
        name="CertificateAuthority"
        label="Certificate"
        description="If your private key is included in this string, be sure to separate it and enter it in the Private key field"
        onChange={handleUpdateCert}
        value={subscription?.brokerClientCert ?? ''}
        placeholder={CertificatePlaceholders.clientCert}
        rows={4}
      />
    </FlexBox>
  )
}

const OldCertificateInput: FC = () => {
  const {
    subscriptionsCertificateInterest,
    setSubscriptionsCertificateInterest,
  } = useContext(AppSettingContext)
  return (
    <FlexBox
      alignItems={AlignItems.Center}
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
    >
      <InputLabel size={ComponentSize.Large} style={{fontWeight: 'bold'}}>
        Coming soon!
      </InputLabel>
      <InputLabel size={ComponentSize.Medium}>
        Interested in using certificates to authenticate with your broker? Let
        us know so we can notify you when it's available.
      </InputLabel>
      {!subscriptionsCertificateInterest && (
        <Button
          text="Notify me"
          onClick={() => setSubscriptionsCertificateInterest()}
        />
      )}
      {subscriptionsCertificateInterest && (
        <InputLabel size={ComponentSize.Large}>
          <div>
            <Icon glyph={IconFont.CheckMark_New} />
            {" You're on the list!"}
          </div>
        </InputLabel>
      )}
    </FlexBox>
  )
}

const CertificatePlaceholders = {
  caCert: `-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----`,
  clientCert: `-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----`,
  clientKey: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----`,
}

interface ReplaceCertificateModalProps {
  onClose: () => void
}
export const ReplaceCertificateOverlay: FC<ReplaceCertificateModalProps> = () => {
  const {
    onClose,
    params: {subscription, updateForm},
  } = useContext(OverlayContext)
  const handleReplaceCert = useCallback(() => {
    updateForm({...subscription, certProvidedAt: null})
    onClose()
  }, [subscription, updateForm, onClose])
  return (
    <Overlay visible={true} className="subscription-replace-cert-overlay">
      <ClickOutside onClickOutside={onClose}>
        <div>
          <Overlay.Container maxWidth={450} style={{paddingTop: '20px'}}>
            <Overlay.Body>
              <FlexBox
                direction={FlexDirection.Row}
                stretchToFitWidth={true}
                justifyContent={JustifyContent.SpaceBetween}
                alignItems={AlignItems.Center}
              >
                <div>
                  Are you sure you want to replace your certificate? Once you
                  save your changes, we cannot retrieve the previous
                  certificate.
                </div>
                <Button
                  color={ComponentColor.Primary}
                  text="Yes, Continue"
                  onClick={handleReplaceCert}
                  testID="subs-replace-cert-confirm-btn"
                />
              </FlexBox>
            </Overlay.Body>
          </Overlay.Container>
        </div>
      </ClickOutside>
    </Overlay>
  )
}

const CertificateDetails: FC<OwnProps> = ({subscription, updateForm, edit}) => {
  const dispatch = useDispatch()
  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
      justifyContent={JustifyContent.SpaceBetween}
      alignItems={AlignItems.Center}
    >
      <FlexBoxChild>
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.Stretch}
          justifyContent={JustifyContent.Center}
        >
          <InputLabel size={ComponentSize.Medium} style={{fontWeight: 'bold'}}>
            Certificate
          </InputLabel>
          <InputLabel size={ComponentSize.Small}>
            {subscription.certProvidedAt}
          </InputLabel>
        </FlexBox>
      </FlexBoxChild>
      {edit && (
        <Button
          text="Replace Certificate"
          color={ComponentColor.Secondary}
          onClick={() => {
            event('replace certificate clicked', {}, {feature: 'subscriptions'})
            dispatch(
              showOverlay(
                'subscription-replace-certificate',
                {subscription, updateForm},
                () => dispatch(dismissOverlay)
              )
            )
          }}
          type={ButtonType.Button}
          titleText="Edit"
          testID="update-sub-form--edit"
        />
      )}
    </FlexBox>
  )
}

const CertificateInput: FC<OwnProps> = ({subscription, updateForm, edit}) => {
  if (subscription.authType === 'certificate' && subscription.certProvidedAt) {
    return (
      <CertificateDetails
        subscription={subscription}
        updateForm={updateForm}
        edit={edit}
      />
    )
  }

  return isFlagEnabled('enableCertificateSupport') ? (
    <NewCertificateInput subscription={subscription} updateForm={updateForm} />
  ) : (
    <OldCertificateInput />
  )
}
export default CertificateInput
