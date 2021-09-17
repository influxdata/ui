// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import {Form, DapperScrollbars, Grid, Columns} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import StreamingSelectorTelegrafUiRefresh from 'src/dataLoaders/components/collectorsWizard/select/StreamingSelector2'
import OnboardingButtons from 'src/onboarding/components/OnboardingButtons'
import PluginCreateConfigurationWizard from 'src/writeData/components/PluginCreateConfigurationWizard'

// Constants
import {
  CONTENT_ID,
  ORGS,
  ORG_ID,
  TELEGRAF_PLUGINS,
} from 'src/shared/constants/routes'

// Actions
import {
  addTelegrafPlugin_telegrafUiRefresh,
  removePluginBundleWithPlugins,
} from 'src/dataLoaders/actions/dataLoaders'
import {setBucketInfo} from 'src/dataLoaders/actions/steps'

// Types
import {Bucket} from 'src/types'
import {ComponentStatus} from '@influxdata/clockface'
import {CollectorsStepProps} from 'src/dataLoaders/components/collectorsWizard/CollectorsWizard'
import {AppState, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

export interface OwnProps extends CollectorsStepProps {
  buckets: Bucket[]
}

interface State {
  selectedBucketName: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

@ErrorHandling
export class SelectCollectorsStep extends PureComponent<Props, State> {
  state = {selectedBucketName: ''}
  public render() {
    return (
      <>
        <Form
          onSubmit={this.props.onIncrementCurrentStepIndex}
          className="data-loading--form"
        >
          <DapperScrollbars
            autoHide={false}
            className="data-loading--scroll-content"
          >
            <Grid.Row style={{textAlign: 'start'}}>
              <Grid.Column widthSM={Columns.Ten}>
                <h3 className="wizard-step--title">
                  Where do you want to collect data from?
                </h3>
                <h5 className="wizard-step--sub-title">
                  Telegraf is an open-source data collection agent for
                  collecting and reporting metrics. Simply choose one of the
                  plugin libraries to start writing data into influxDB. LINK.
                </h5>
              </Grid.Column>
            </Grid.Row>
            <StreamingSelectorTelegrafUiRefresh
              pluginBundles={this.props.pluginBundles}
              telegrafPlugins={this.props.telegrafPlugins}
              onTogglePluginBundle={this.handleTogglePluginBundle}
              buckets={this.props.buckets ?? []}
              selectedBucketName={this.props.bucket}
              onSelectBucket={this.handleSelectBucket}
            />
          </DapperScrollbars>
          <OnboardingButtons
            autoFocusNext={true}
            nextButtonStatus={this.nextButtonStatus}
            className="data-loading--button-container"
          />
        </Form>
        <Switch>
          <Route
            path={`/${ORGS}/${ORG_ID}/load-data/telegrafs/:contentID/new`}
            component={PluginCreateConfigurationWizard}
          />
        </Switch>
      </>
    )
  }

  private get nextButtonStatus(): ComponentStatus {
    const {telegrafPlugins, buckets} = this.props
    const {selectedBucketName} = this.state
    const orgID = "56d04e61c0473a71" // we need to get this
    const contentID = telegrafPlugins

    console.log(telegrafPlugins)

    if (!buckets || !buckets.length) {
      return ComponentStatus.Disabled
    }

    if (!telegrafPlugins.length) {
      return ComponentStatus.Disabled
    }

    if (telegrafPlugins.length >= 1) {
      window.history.push("object or string", "Title",`/${ORGS}/${orgID}/load-data/telegrafs/${contentID}/new`);
    }

    if (!selectedBucketName) {
      return ComponentStatus.Disabled
    }

    return ComponentStatus.Default
  }

  private handleSelectBucket = (bucket: Bucket) => {
    const {orgID, id, name} = bucket
    this.setState({selectedBucketName: name})
    this.props.onSetBucketInfo(orgID, name, id)
  }

  private handleTogglePluginBundle = (bundle: string) => {
    this.props.onAddPluginBundle(bundle)
  }
}

const mstp = ({
  dataLoading: {
    dataLoaders: {telegrafPlugins, pluginBundles},
    steps: {bucket},
  },
  ...state
}: AppState) => {
  const buckets = getAll<Bucket>(state as AppState, ResourceType.Buckets)
  const nonSystemBuckets = buckets.filter(
    bucket => !isSystemBucket(bucket.name)
  )

  return {
    telegrafPlugins,
    bucket,
    pluginBundles,
    buckets: nonSystemBuckets,
  }
}

const mdtp = {
  onAddPluginBundle: addTelegrafPlugin_telegrafUiRefresh,
  onRemovePluginBundle: removePluginBundleWithPlugins,
  onSetBucketInfo: setBucketInfo,
}

const connector = connect(mstp, mdtp)

export default connector(SelectCollectorsStep)
