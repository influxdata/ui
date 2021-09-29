// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Form, DapperScrollbars, Grid, Columns} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import StreamingSelectorTelegrafUiRefresh from 'src/dataLoaders/components/collectorsWizard/select/StreamingSelector2'

// Actions
import {
  addTelegrafPlugin_telegrafUiRefresh,
  removePluginBundleWithPlugins,
} from 'src/dataLoaders/actions/dataLoaders'
import {setBucketInfo} from 'src/dataLoaders/actions/steps'

// Types
import {Bucket} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'
import {AppState, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'
import {TelegrafPlugin} from 'src/types/dataLoaders'

export interface OwnProps extends PluginCreateConfigurationStepProps {
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

  public componentDidUpdate() {
    const {setIsValidConfiguration} = this.props
    if (this.state.selectedBucketName && this.props.telegrafPlugins?.length) {
      setIsValidConfiguration(true)
    }
  }

  public render() {
    return (
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
                Telegraf is an open-source data collection agent for collecting
                and reporting metrics. Simply choose one of the plugin libraries
                to start writing data into influxDB. LINK.
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
      </Form>
    )
  }

  private handleSelectBucket = (bucket: Bucket) => {
    const {orgID, id, name} = bucket
    this.setState({selectedBucketName: name})
    this.props.onSetBucketInfo(orgID, name, id)
  }

  private handleTogglePluginBundle = (plugin: TelegrafPlugin) => {
    this.props.onAddPluginBundle(plugin)
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
