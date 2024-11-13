// Libraries
import {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useLocalStorageState} from 'use-local-storage-state'

// Utils
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

export enum AnnouncementID {
  MqttEol = 'mqttEolClickThroughAnnouncement',
}

enum AnnouncementState {
  Dismissed = 'dismissed',
  Display = 'display',
}

export const ClickThroughAnnouncementHandler: FC = () => {
  const dispatch = useDispatch()

  const [announcementState, setAnnouncementState] = useLocalStorageState(
    'clickThroughAnnouncement',
    {}
  )

  const initAnnouncement = (announcementID: string): void => {
    if (!announcementState[announcementID]) {
      setAnnouncementState(prevState => ({
        ...prevState,
        [announcementID]: AnnouncementState.Display,
      }))
    }
  }

  const handleDismissAnnouncement = (announcementID: string): void => {
    dismissOverlay()
    event(`${announcementID}.dismissed`)
    setTimeout(() => {
      setAnnouncementState(prevState => ({
        ...prevState,
        [announcementID]: AnnouncementState.Dismissed,
      }))
    }, 1000)
  }

  const handleDisplayAnnouncement = (announcementID: string): void => {
    initAnnouncement(announcementID)

    if (announcementState[announcementID] === AnnouncementState.Display) {
      const overlayParams = {
        announcementID,
      }
      dispatch(
        showOverlay('click-through-announcement', overlayParams, () =>
          handleDismissAnnouncement(announcementID)
        )
      )
    }
  }

  useEffect(() => {
    // MQTT Audience: Cloud users with MQTT feature flag enabled
    const isMqttAudience = isFlagEnabled('subscriptionsUI')

    // Sequentially display announcements in order of priority
    if (
      isMqttAudience &&
      announcementState[AnnouncementID.MqttEol] !== AnnouncementState.Dismissed
    ) {
      handleDisplayAnnouncement(AnnouncementID.MqttEol)
    }
  }, [announcementState])

  return null
}
