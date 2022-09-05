// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Components
import {
  Form,
  DapperScrollbars,
  Button,
  ComponentColor,
  ButtonType,
  FlexBox,
} from '@influxdata/clockface'
import DataStreaming from 'src/dataLoaders/components/verifyStep/DataStreaming'

// Types
import {CollectorsStepProps} from 'src/dataLoaders/components/collectorsWizard/CollectorsWizard'
import {AppState} from 'src/types'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {clearDataLoaders} from 'src/dataLoaders/actions/dataLoaders'

type OwnProps = CollectorsStepProps

interface StateProps {
  username: string
  telegrafConfigID: string
  bucket: string
  org: string
  token: string
}

interface DispatchProps {
  onClearDataLoaders: () => void
}

export type Props = StateProps &
  DispatchProps &
  OwnProps &
  RouteComponentProps<{orgID: string}>

@ErrorHandling
export class VerifyCollectorStep extends PureComponent<Props> {
  public render() {
    const {telegrafConfigID, bucket, org, onExit, token} = this.props

    return (
      <Form onSubmit={onExit} className="data-loading--form">
        <DapperScrollbars
          autoHide={false}
          className="data-loading--scroll-content"
        >
          <div>
            <h3 className="wizard-step--title">Test your Configuration</h3>
            <h5 className="wizard-step--sub-title">
              Start Telegraf and ensure data is being written to InfluxDB
            </h5>
          </div>
          <DataStreaming
            org={org}
            bucket={bucket}
            token={token}
            configID={telegrafConfigID}
          />
        </DapperScrollbars>

        <FlexBox className="data-loading--button-container">
          <Button
            color={ComponentColor.Primary}
            text="Finish"
            type={ButtonType.Submit}
            testID="next"
            onClick={this.goToTelegrafPage}
          />
        </FlexBox>
      </Form>
    )
  }

  private goToTelegrafPage = () => {
    const {
      match: {
        params: {orgID},
        url,
      },
      onExit,
      onClearDataLoaders,
    } = this.props
    onClearDataLoaders()
    if (url.includes('telegraf-plugins')) {
      this.props.history.push(`/orgs/${orgID}/load-data/telegrafs`)
    } else {
      onExit()
    }
  }
}

const mstp = ({
  dataLoading: {
    dataLoaders: {telegrafConfigID, token},
    steps: {bucket, org},
  },
  me: {name},
}: AppState) => ({
  username: name,
  telegrafConfigID,
  bucket,
  org,
  token,
})

const mdtp = {
  onClearDataLoaders: clearDataLoaders,
}

const connector = connect<StateProps, DispatchProps>(mstp, mdtp)

export default connector(withRouter(VerifyCollectorStep))
