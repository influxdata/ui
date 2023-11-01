// Libraries
import {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useLocalStorageState} from 'use-local-storage-state'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Utils
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

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
        [announcementID]: 'display',
      }))
    }
  }

  const handleDismissAnnouncement = (announcementID: string): void => {
    dismissOverlay()
    event(`${announcementID}.dismissed`)
    setTimeout(() => {
      setAnnouncementState(prevState => ({
        ...prevState,
        [announcementID]: 'dismissed',
      }))
    }, 1000)
  }

  const handleDisplayAnnouncement = (announcementID: string): void => {
    initAnnouncement(announcementID)

    if (announcementState[announcementID] === 'display') {
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
    const mqttAnnouncementID = 'mqttEolClickThroughAnnouncement'
    const isMqttAudience = isFlagEnabled('subscriptionsUI')

    // PAYG Pricing Increase Audience: Pay As You Go & Direct Signups
    const priceIncreaseAnnouncementID = 'pricingClickThroughAnnouncement'
    const isPaygAccount = account.type === 'pay_as_you_go'
    const isDirectSignup = account.billingProvider === 'zuora'
    const isPriceIncreaseAudience = isPaygAccount && isDirectSignup

    // Sequentially display announcements in order of priority
    if (
      isMqttAudience &&
      announcementState[mqttAnnouncementID] !== 'dismissed'
    ) {
      handleDisplayAnnouncement(mqttAnnouncementID)
    } else if (
      isPriceIncreaseAudience &&
      announcementState[priceIncreaseAnnouncementID] !== 'dismissed'
    ) {
      handleDisplayAnnouncement(priceIncreaseAnnouncementID)
    }
  }, [announcementState])

  return null
}
