// Libraries
import {FC, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Utils
import {getOrg} from 'src/organizations/selectors'
import useGetUserStatus from 'src/cloud/components/onboarding/useGetUserStatus'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {AppState} from 'src/types'

const EngagementLink: FC = () => {
  const [dataStates, setDataStates] = useState([])
  const pathname = useLocation().pathname
  const userpilot = window['userpilot']
  const org = useSelector(getOrg)
  const me = useSelector((state: AppState) => state.me)

  const {usageDataStates} = useGetUserStatus()

  useEffect(() => {
    if (userpilot) {
      if (usageDataStates.length) {
        setDataStates(usageDataStates)
      }
      sendToUserPilot()
      userpilot.reload()
    }
  }, [pathname, org, me, usageDataStates])

  const sendToUserPilot = (): void => {
    const host = window?.location?.hostname.split('.')

    if (org && me) {
      userpilot.identify(me.name, {
        email: me.name, // User Email address
        orgID: org.id, // Organization ID
        region: host[0], // Cloud provider region
        provider: host[1], // Cloud provider
        company: {
          id: org.id, // Organization ID
        },
        ...(isFlagEnabled('newUsageAPI') &&
          dataStates.length && {usageDataStates}),
      })
    }
  }

  return null
}

export default EngagementLink
