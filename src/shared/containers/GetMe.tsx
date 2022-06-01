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
import {getIdentity} from 'src/me/actions/thunks'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface State {
  loading: RemoteDataState
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

@ErrorHandling
class GetIdentity extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loading: RemoteDataState.NotStarted,
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
    this.props.getIdentity()
    this.setState({loading: RemoteDataState.Done})
  }
}

const mdtp = {
  getIdentity,
}

const connector = connect(null, mdtp)

export default connector(GetIdentity)
