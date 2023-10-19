// Libraries
import {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useLocalStorageState} from 'use-local-storage-state'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Utils
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

export const ClickThroughAnnouncementHandler: FC = () => {
  const dispatch = useDispatch()
  const {account} = useSelector(selectCurrentIdentity)

  const [announcementState, setAnnouncementState] = useLocalStorageState(
    'clickThroughAnnouncement',
    {
      announcementID: '',
      display: true,
    }
  )

  const setCurrentAnnouncement = (announcementID: string): void => {
    if (announcementState['announcementID'] !== announcementID) {
      setAnnouncementState({
        announcementID: announcementID,
        display: true,
      })
    }
  }

  const handleDismissAnnouncement = (): void => {
    setAnnouncementState(prevState => ({
      ...prevState,
      display: false,
    }))
    dismissOverlay()
  }

  useEffect(() => {
    // Current Announcement: PAYG Pricing Increase
    // Audience: Pay As You Go & Direct Signups
    const isPaygAccount = account.type === 'pay_as_you_go'
    const isDirectSignup = account.billingProvider === 'zuora'
    const isTargetAudience = isPaygAccount && isDirectSignup

    if (isTargetAudience) {
      setCurrentAnnouncement('payg-pricing-increase-announcement')

      if (announcementState['display']) {
        dispatch(
          showOverlay(
            'click-through-announcement',
            null,
            handleDismissAnnouncement
          )
        )
      }
    }
  }, [announcementState])

  return null
}
