// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// APIs
import {getSetup} from 'src/client'

// Actions
import {dismissAllNotifications} from 'src/shared/actions/notifications'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import SigninForm from 'src/onboarding/components/SigninForm'
import {
  SpinnerContainer,
  TechnoSpinner,
  Panel,
  AlignItems,
  InfluxDBCloudLogo,
  FunnelPage,
  AppWrapper,
} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'
import VersionInfo from 'src/shared/components/VersionInfo'
import Notifications from 'src/shared/components/notifications/Notifications'

// Constants
import {CLOUD, CLOUD_SIGNIN_PATHNAME} from 'src/shared/constants'

interface State {
  status: RemoteDataState
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = RouteComponentProps & ReduxProps
@ErrorHandling
class OSSLoginPage extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      status: RemoteDataState.Loading,
    }
  }
  public async componentDidMount() {
    const resp = await getSetup({})

    if (resp.status !== 200) {
      throw new Error('There was an error onboarding')
    }

    const {allowed} = resp.data

    if (allowed) {
      this.props.history.push('/onboarding/0')
    } else if (CLOUD) {
      window.location.pathname = CLOUD_SIGNIN_PATHNAME
      return
    }

    this.setState({status: RemoteDataState.Done})
  }

  componentWillUnmount() {
    this.props.dismissAllNotifications()
  }

  public render() {
    return (
      <SpinnerContainer
        loading={this.state.status}
        spinnerComponent={<TechnoSpinner />}
      >
        <Notifications />
        <AppWrapper>
          <FunnelPage className="signin-page" testID="signin-page">
            <Panel className="signin-page--panel">
              <Panel.Body alignItems={AlignItems.Center}>
                <div className="signin-page--cubo" />
                <InfluxDBCloudLogo
                  cloud={false}
                  className="signin-page--logo"
                />
                <SigninForm />
              </Panel.Body>
              <Panel.Footer>
                <VersionInfo />
              </Panel.Footer>
            </Panel>
          </FunnelPage>
        </AppWrapper>
      </SpinnerContainer>
    )
  }
}

const mdtp = {
  dismissAllNotifications,
}

const connector = connect(null, mdtp)

export default connector(withRouter(OSSLoginPage))
