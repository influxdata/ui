// Libraries
import {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useLocalStorageState} from 'use-local-storage-state'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Utils
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {event} from 'src/cloud/utils/reporting'

export enum AnnouncementID {
  PriceIncrease = 'pricingClickThroughAnnouncement',
}

enum AnnouncementState {
  Dismissed = 'dismissed',
  Display = 'display',
}

export const ClickThroughAnnouncementHandler: FC = () => {
  const dispatch = useDispatch()
  const {account} = useSelector(selectCurrentIdentity)

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
    // PAYG Pricing Increase Audience: Pay As You Go & Direct Signups
    const isPaygAccount = account.type === 'pay_as_you_go'
    const isDirectSignup = account.billingProvider === 'zuora'
    const isPriceIncreaseAudience = isPaygAccount && isDirectSignup

    // Sequentially display announcements in order of priority
    if (
      isPriceIncreaseAudience &&
      announcementState[AnnouncementID.PriceIncrease] !==
        AnnouncementState.Dismissed
    ) {
      handleDisplayAnnouncement(AnnouncementID.PriceIncrease)
    }
  }, [announcementState])

  return null
}
