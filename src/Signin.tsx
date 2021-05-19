// Libraries
import React, {ReactElement, PureComponent} from 'react'
import {Switch, Route, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

import {client} from 'src/utils/api'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import GetMe from 'src/shared/containers/GetMe'

// Utils
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from 'src/localStorage'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getPublicFlags} from 'src/shared/thunks/flags'
import {loadRudderstack, identify} from 'src/cloud/utils/rudderstack'

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Constants
import {sessionTimedOut} from 'src/shared/copy/notifications'
import {
  CLOUD,
  CLOUD_LOGIN_PATHNAME,
  CLOUD_SIGNIN_PATHNAME,
} from 'src/shared/constants'

// Types
import {AppState, RemoteDataState} from 'src/types'
import {getOrg} from 'src/organizations/selectors'

interface State {
  loading: RemoteDataState
  auth: boolean
  rudderStackInitialized: boolean
}

interface OwnProps {
  children: ReactElement<any>
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & RouteComponentProps & ReduxProps

const FETCH_WAIT = 60000

@ErrorHandling
export class Signin extends PureComponent<Props, State> {
  public state: State = {
    loading: RemoteDataState.NotStarted,
    auth: false,
    rudderStackInitialized: false,
  }

  private hasMounted = false
  private intervalID: NodeJS.Timer

  public async componentDidMount() {
    this.hasMounted = true
    this.setState({loading: RemoteDataState.Loading})
    await this.props.onGetPublicFlags()

    await this.checkForLogin()

    if (this.hasMounted) {
      this.setState({loading: RemoteDataState.Done})
      this.intervalID = setInterval(() => {
        this.checkForLogin()
      }, FETCH_WAIT)
    }
  }

  public componentWillUnmount() {
    clearInterval(this.intervalID)
    this.hasMounted = false
  }

  public render() {
    const {loading, auth} = this.state

    return (
      <SpinnerContainer loading={loading} spinnerComponent={<TechnoSpinner />}>
        {auth && (
          <Switch>
            <Route component={GetMe} />
          </Switch>
        )}
      </SpinnerContainer>
    )
  }

  private checkForLogin = async () => {
    try {
      const user = await client.users.me()
      if (
        isFlagEnabled('rudderstackReporting') &&
        !this.state.rudderStackInitialized
      ) {
        loadRudderstack()
        identify(
          user.id,
          {email: user.name, orgID: this.props.orgID},
          {},
          () => {}
        )
        this.setState({rudderStackInitialized: true})
      }
      this.setState({auth: true})
      const redirectIsSet = !!getFromLocalStorage('redirectTo')
      if (redirectIsSet) {
        removeFromLocalStorage('redirectTo')
      }
    } catch (error) {
      this.setState({auth: false})
      const {
        location: {pathname},
      } = this.props

      clearInterval(this.intervalID)

      if (CLOUD && isFlagEnabled('authSessionCookieOn')) {
        const url = new URL(
          `${window.location.origin}${CLOUD_LOGIN_PATHNAME}?redirectTo=${window.location.href}`
        )
        setToLocalStorage('redirectTo', window.location.href)
        window.location.href = url.href
        throw error
      }

      if (CLOUD) {
        const url = new URL(
          `${window.location.origin}${CLOUD_SIGNIN_PATHNAME}?redirectTo=${window.location.href}`
        )
        setToLocalStorage('redirectTo', window.location.href)
        window.location.href = url.href
        throw error
      }

      if (pathname.startsWith('/signin')) {
        return
      }

      let returnTo = ''

      if (pathname !== '/') {
        returnTo = `?returnTo=${pathname}`
        this.props.notify(sessionTimedOut())
      }

      this.props.history.replace(`/signin${returnTo}`)
    }
  }
}

const mdtp = {
  notify: notifyAction,
  onGetPublicFlags: getPublicFlags,
}

const mstp = (state: AppState) => {
  const {id} = getOrg(state)

  return {
    orgID: id,
  }
}

const connector = connect(mstp, mdtp)

export default connector(Signin)
