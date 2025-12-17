import React, {FC, useContext} from 'react'
import {useDispatch} from 'react-redux'

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

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

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
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()

  const handleContactSupport = () => {
    dispatch(showOverlay('contact-support', null, dismissOverlay))
  }

  return (
    <Overlay.Container maxWidth={550}>
      <Overlay.Header
        testID="confirmation-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <BannerPanel
          size={ComponentSize.ExtraSmall}
          gradient={Gradients.WarpSpeed}
          icon={IconFont.Info_New}
          textColor={InfluxColors.Yeti}
        >
          <div>
            For critical issues, in addition to opening this case, please
            contact the InfluxData support team at the toll-free numbers{' '}
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
          For more resources, you can{' '}
          <button
            onClick={handleContactSupport}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            contact our support team
          </button>
          .
        </p>
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
