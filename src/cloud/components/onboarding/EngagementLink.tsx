// Libraries
import {FC, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'

const EngagementLink: FC = () => {
  const pathname = useLocation().pathname
  const userpilot = window['userpilot']
  const org = useSelector(getOrg)
  const me = useSelector((state: AppState) => state.me)

  useEffect(() => {
    if (userpilot) {
      sendToUserPilot()
      userpilot.reload()
    }
  }, [pathname, org, me])

  const sendToUserPilot = (): void => {
    const host = window?.location?.hostname.split('.')

    if (org && me) {
      userpilot.identify(me.name, {
        email: me.name, // User Email address
        orgID: org.id, // Organization ID
        region: host[0], // Cloud provider region
        provider: host[1], // Cloud provider
      })
    }
  }

  return null
}

export default EngagementLink
