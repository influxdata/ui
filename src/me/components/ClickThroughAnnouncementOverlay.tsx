// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'

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
> = () => {
  const {announcementID} = useSelector(getOverlayParams)

  useEffect(() => {
    event(`${announcementID}.displayed`)
  }, [])

  const announcementContents = (): JSX.Element => {
    switch (announcementID) {
      case AnnouncementID.None:
        return null
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
