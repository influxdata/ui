// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'
import {MqttEolAnnouncement} from 'src/me/components/announcements/MqttEolAnnouncement'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {AnnouncementID} from 'src/homepageExperience/ClickThroughAnnouncementHandler'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

interface ClickThroughAnnouncementOverlayProps {
  onClose: () => void
}

export const ClickThroughAnnouncementOverlay: FC<
  ClickThroughAnnouncementOverlayProps
> = ({onClose}) => {
  const {announcementID} = useSelector(getOverlayParams)

  useEffect(() => {
    event(`${announcementID}.displayed`)
  }, [])

  const handleDetailsClick = () => {
    event(`${announcementID}.details.clicked`)
  }

  const handleAcknowledgeClick = () => {
    event(`${announcementID}.acknowledge.clicked`)
    onClose()
  }

  const announcementContents = (): JSX.Element => {
    switch (announcementID) {
      case AnnouncementID.MqttEol:
        return (
          <MqttEolAnnouncement
            handleAcknowledgeClick={handleAcknowledgeClick}
            handleDetailsClick={handleDetailsClick}
          />
        )
      default:
        return null
    }
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container>{announcementContents()}</Overlay.Container>
    </Overlay>
  )
}
