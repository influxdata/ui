// Libraries
import {FC, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const EngagementLink: FC<Props> = ({org, me}) => {
  const pathname = useLocation().pathname

  useEffect(() => {
    sendToUserPilot()
  }, [pathname, org, me])

  const sendToUserPilot = (): void => {
    const userpilot = get(window, 'userpilot')
    const host = window.location.hostname.split('.')

    if (userpilot && org && me) {
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

const mstp = (state: AppState) => {
  const org = getOrg(state)
  const me = state.me
  return {org, me}
}

const connector = connect(mstp)
export default connector(EngagementLink)
