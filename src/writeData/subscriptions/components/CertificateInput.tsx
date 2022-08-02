// Libraries
import React, {FC, useContext} from 'react'

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
} from '@influxdata/clockface'

const CertificateInput: FC = () => {
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
export default CertificateInput
