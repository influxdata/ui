// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  Alert,
  Button,
  FlexBox,
  IconFont,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

export const MqttEolAlert: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    event(`mqttEolAnnouncementBanner.displayed`)
  }, [])

  const handleDetailsClick = () => {
    event(`mqttEolAnnouncementBanner.details.clicked`)
    const overlayParams = {
      announcementID: 'mqttEolClickThroughAnnouncement',
    }
    dispatch(
      showOverlay('click-through-announcement', overlayParams, () =>
        dismissOverlay()
      )
    )
  }

  return (
    <Alert
      icon={IconFont.AlertTriangle}
      color={ComponentColor.Primary}
      className="mqtt-alert"
    >
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child grow={1} shrink={0}>
          Important Notice: The Native Collector - MQTT feature is being
          deprecated and will stop functioning on <b>April 30th, 2024</b>.
        </FlexBox.Child>
        <FlexBox.Child grow={0} shrink={0}>
          <Button
            text="Learn More"
            color={ComponentColor.Primary}
            onClick={handleDetailsClick}
          />
        </FlexBox.Child>
      </FlexBox>
    </Alert>
  )
}
