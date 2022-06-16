import React, {FC, useContext} from 'react'

// Components
import {
  BannerPanel,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  Gradients,
  IconFont,
  InfluxColors,
  Overlay,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Constants
import {
  INFLUXDATA_SUPPORT_CONTACT_UK,
  INFLUXDATA_SUPPORT_CONTACT_UK_TELEPHONE_LINK,
  INFLUXDATA_SUPPORT_CONTACT_US,
  INFLUXDATA_SUPPORT_CONTACT_US_TELEPHONE_LINK,
} from 'src/shared/constants/index'

interface OwnProps {
  onClose: () => void
}

const ConfirmationOverlay: FC<OwnProps> = () => {
  const {onClose, params} = useContext(OverlayContext)

  const feedbackAndQuestions = (
    <p>
      Thank you for your submission! Please keep a lookout in your account email
      for confirmation and follow-up.
    </p>
  )

  const paygSupport = (
    <>
      <BannerPanel
        size={ComponentSize.ExtraSmall}
        gradient={Gradients.WarpSpeed}
        icon={IconFont.Info_New}
        textColor={InfluxColors.Yeti}
      >
        <div>
          For critical issues, in addition to opening this case, please contact
          the InfluxData support team at the toll-free numbers{' '}
          <a href={INFLUXDATA_SUPPORT_CONTACT_US_TELEPHONE_LINK}>
            {INFLUXDATA_SUPPORT_CONTACT_US}
          </a>{' '}
          or{' '}
          <a href={INFLUXDATA_SUPPORT_CONTACT_UK_TELEPHONE_LINK}>
            {INFLUXDATA_SUPPORT_CONTACT_UK}
          </a>
          .
        </div>
      </BannerPanel>
      <p>
        Your support ticket has been submitted. A Support Engineer will
        investigate the issue and get back to you shortly. Please check your
        account email for a confirmation and follow-up.
      </p>
      <p>
        For more resources, check out{' '}
        <SafeBlankLink href="https://support.influxdata.com">
          {' '}
          support.influxdata.com{' '}
        </SafeBlankLink>
      </p>
    </>
  )

  return (
    <Overlay.Container maxWidth={550}>
      <Overlay.Header
        testID="confirmation-overlay-header"
        title={
          params.type === 'PAYG' ? 'Contact Support' : 'Feedback & Questions'
        }
        onDismiss={onClose}
      />
      <Overlay.Body>
        {params.type === 'PAYG' ? paygSupport : feedbackAndQuestions}
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="OK"
          color={ComponentColor.Success}
          onClick={onClose}
          type={ButtonType.Button}
          testID="confirmation-overlay--OK"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default ConfirmationOverlay
