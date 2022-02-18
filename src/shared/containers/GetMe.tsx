// Libraries
import React, {PureComponent} from 'react'
import {Switch, Route} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import GetFlags from 'src/shared/containers/GetFlags'

// Types
import {RemoteDataState} from 'src/types'

// Actions
import {getMe} from 'src/me/actions/thunks'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface State {
  loading: RemoteDataState
  getMeCalledAfterFlagsLoaded: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

@ErrorHandling
class GetMe extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loading: RemoteDataState.NotStarted,
      getMeCalledAfterFlagsLoaded: false,
    }
  }

  public render() {
    const {loading} = this.state

    return (
      <SpinnerContainer loading={loading} spinnerComponent={<TechnoSpinner />}>
        <Switch>
          <Route component={GetFlags} />
        </Switch>
      </SpinnerContainer>
    )
  }

  public componentDidMount() {
    this.props.getMe()
    this.setState({loading: RemoteDataState.Done})
  }

  public componentDidUpdate() {
    // when the flags are loaded, we want to call this again so we can decide
    // whether quartz or IDPE needs to be called to get the user information

    // getMeCalledAfterFlagsLoaded state controls the call so it's only called once after flags are loaded.
    if (this.state.getMeCalledAfterFlagsLoaded === false) {
      this.props.getMe()
      this.setState({getMeCalledAfterFlagsLoaded: true})
    }
  }
}

const mdtp = {
  getMe,
}

const connector = connect(null, mdtp)

export default connector(GetMe)
