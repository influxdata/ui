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
} from '@influxdata/clockface'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import TextAreaWithLabel from 'src/writeData/subscriptions/components/TextAreaWithLabel'
import {SubscriptionCertificateContext} from 'src/writeData/subscriptions/context/subscription.certificate'

const NewCertificateInput: FC = () => {
  const {certificate, updateCertificate} = useContext(
    SubscriptionCertificateContext
  )

  const handleUpdateCACert = useCallback(
    e => {
      updateCertificate({...certificate, rootCA: e.target.value})
    },
    [certificate, updateCertificate]
  )
  const handleUpdatePrivateKey = useCallback(
    e => {
      updateCertificate({...certificate, key: e.target.value})
    },
    [certificate, updateCertificate]
  )
  const handleUpdateCert = useCallback(
    e => {
      updateCertificate({...certificate, cert: e.target.value})
    },
    [certificate, updateCertificate]
  )

  console.log(certificate)

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
        required={true}
        onChange={handleUpdateCACert}
        value={certificate?.rootCA}
        rows={4}
      />
      <TextAreaWithLabel
        name="PrivateKey"
        label="Private Key"
        onChange={handleUpdatePrivateKey}
        value={certificate?.key}
        rows={4}
      />
      <TextAreaWithLabel
        name="CertificateAuthority"
        label="Certificate"
        description="If your private key is included in this string, be sure to separate it and enter it in the Private key field"
        onChange={handleUpdateCert}
        value={certificate?.cert}
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
const CertificateInput: FC = () => {
  return isFlagEnabled('enableCertificateSupport') ? (
    <NewCertificateInput />
  ) : (
    <OldCertificateInput />
  )
}
export default CertificateInput
