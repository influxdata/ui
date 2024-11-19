// Libraries
import {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useLocalStorageState} from 'use-local-storage-state'

// Utils
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {event} from 'src/cloud/utils/reporting'

export enum AnnouncementID {
  None = 'none',
}

enum AnnouncementState {
  Dismissed = 'dismissed',
  Display = 'display',
  Disabled = 'disabled',
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
    if (announcementID === AnnouncementID.None) {
      return null
    }

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
    // Sequentially display announcements in order of priority (use AnnouncementID.None to disable)
    handleDisplayAnnouncement(AnnouncementID.None)
  }, [announcementState])

  return null
}
