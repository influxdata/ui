// Libraries
import React, {ReactElement, PureComponent} from 'react'
import {Switch, Route, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import {GetFlags} from 'src/shared/containers/GetFlags'

// Utils
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from 'src/localStorage'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getPublicFlags} from 'src/shared/thunks/flags'

// Actions
import {getQuartzIdentityThunkNoErrorHandling} from 'src/identity/actions/thunks'
import {getIdpeMeThunk} from 'src/me/actions/thunks'
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Constants
import {sessionTimedOut} from 'src/shared/copy/notifications'
import {
  CLOUD,
  CLOUD_LOGIN_PATHNAME,
  CLOUD_QUARTZ_URL,
} from 'src/shared/constants'

// Types
import {RemoteDataState} from 'src/types'

// APIs
import {fetchIdentity, fetchLegacyIdentity} from './identity/apis/auth'

interface State {
  loading: RemoteDataState
  isAuthenticated: boolean
}

interface OwnProps {
  children: ReactElement<any>
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & RouteComponentProps & ReduxProps

const FETCH_WAIT = 60000

@ErrorHandling
class AuthenticateUnconnected extends PureComponent<Props, State> {
  public state: State = {
    loading: RemoteDataState.NotStarted,
    isAuthenticated: false,
  }

  private hasMounted = false
  private intervalID: NodeJS.Timer

  private handleAuthenticationFailure = error => {
    this.setState({isAuthenticated: false})
    const {
      location: {pathname},
    } = this.props

    clearInterval(this.intervalID)

    if (CLOUD) {
      if (
        isFlagEnabled('useQuartzLogin') &&
        process.env.NODE_ENV &&
        process.env.NODE_ENV !== 'development'
      ) {
        window.location.href = CLOUD_QUARTZ_URL
        return
      }

      const url = new URL(
        `${window.location.origin}${CLOUD_LOGIN_PATHNAME}?redirectTo=${window.location.href}`
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

  private fetchMe = async () => {
    try {
      if (CLOUD) {
        await this.props.getQuartzIdentityThunkNoErrorHandling()
        // TODO: completing https://github.com/influxdata/ui/issues/5826 will make this
        // line unnecessary
        await this.props.getIdpeMeThunk()
      } else {
        await this.props.getIdpeMeThunk()
      }

      this.setState({isAuthenticated: true})
      const redirectIsSet = !!getFromLocalStorage('redirectTo')
      if (redirectIsSet) {
        removeFromLocalStorage('redirectTo')
      }
    } catch (error) {
      this.handleAuthenticationFailure(error)
    }
  }

  private authenticate = async () => {
    try {
      if (CLOUD) {
        await fetchIdentity()
      } else {
        await fetchLegacyIdentity()
      }

      this.setState({isAuthenticated: true})
      const redirectIsSet = !!getFromLocalStorage('redirectTo')
      if (redirectIsSet) {
        removeFromLocalStorage('redirectTo')
      }
    } catch (error) {
      this.handleAuthenticationFailure(error)
    }
  }

  public async componentDidMount() {
    this.hasMounted = true
    this.setState({loading: RemoteDataState.Loading})

    // TODO: move this call up one layer into Setup
    if (CLOUD) {
      await this.props.onGetPublicFlags()
    }

    await this.fetchMe()

    if (this.hasMounted) {
      this.setState({loading: RemoteDataState.Done})
      this.intervalID = setInterval(() => {
        this.authenticate()
      }, FETCH_WAIT)
    }
  }

  public componentWillUnmount() {
    clearInterval(this.intervalID)
    this.hasMounted = false
  }

  public render() {
    const {loading, isAuthenticated} = this.state

    return (
      <SpinnerContainer loading={loading} spinnerComponent={<TechnoSpinner />}>
        {isAuthenticated && (
          <Switch>
            <Route component={GetFlags} />
          </Switch>
        )}
      </SpinnerContainer>
    )
  }
}

const mdtp = {
  notify: notifyAction,
  onGetPublicFlags: getPublicFlags,
  getQuartzIdentityThunkNoErrorHandling,
  getIdpeMeThunk,
}

const connector = connect(null, mdtp)

export const Authenticate = connector(AuthenticateUnconnected)
