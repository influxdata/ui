// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Form, DapperScrollbars, Grid, Columns} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import TelegrafUIRefreshSelector from 'src/dataLoaders/components/collectorsWizard/select/TelegrafUIRefreshSelector'

// Actions
import {
  addTelegrafPlugin_telegrafUiRefresh,
  removePluginBundleWithPlugins,
} from 'src/dataLoaders/actions/dataLoaders'
import {setBucketInfo} from 'src/dataLoaders/actions/steps'

// Types
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'
import {AppState, Bucket} from 'src/types'

// Selectors
import {getAllBuckets} from 'src/resources/selectors'

// Utils
import {TelegrafPlugin} from 'src/types/dataLoaders'

export interface OwnProps extends PluginConfigurationStepProps {
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
                <a
                  href="https://www.influxdata.com/time-series-platform/telegraf/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegraf
                </a>{' '}
                is an open-source data collection agent for collecting and
                reporting metrics. Simply choose a bucket and one of the plugin
                libraries to start writing data into InfluxDB. View Telegraf{' '}
                <a
                  href="https://docs.influxdata.com/telegraf/latest/plugins/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  plugin documentation.
                </a>
              </h5>
            </Grid.Column>
          </Grid.Row>
          <TelegrafUIRefreshSelector
            buckets={this.props.buckets}
            currentStepIndex={this.props.currentStepIndex}
            onSelectBucket={this.handleSelectBucket}
            onTogglePluginBundle={this.handleTogglePluginBundle}
            pluginBundles={this.props.pluginBundles}
            selectedBucketID={this.props.bucketID}
            setSubstepIndex={this.props.onSetSubstepIndex}
            telegrafPlugins={this.props.telegrafPlugins}
          />
        </DapperScrollbars>
      </Form>
    )
  }

  private handleSelectBucket = (bucket: Bucket) => {
    const {orgID, id, name} = bucket
    this.setState({selectedBucketName: name})
    this.props.setBucketInfo(orgID, name, id)
  }

  private handleTogglePluginBundle = (plugin: TelegrafPlugin) => {
    this.props.onAddPluginBundle(plugin)
  }
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      dataLoaders: {telegrafPlugins, pluginBundles},
      steps: {bucketID},
    },
  } = state
  const buckets = getAllBuckets(state)

  return {
    bucketID,
    buckets,
    pluginBundles,
    telegrafPlugins,
  }
}

const mdtp = {
  onAddPluginBundle: addTelegrafPlugin_telegrafUiRefresh,
  onRemovePluginBundle: removePluginBundleWithPlugins,
  setBucketInfo,
}

const connector = connect(mstp, mdtp)

export default connector(SelectCollectorsStep)
