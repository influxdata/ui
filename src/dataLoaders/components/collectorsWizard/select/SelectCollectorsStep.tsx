// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Form, DapperScrollbars, Grid, Columns} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import StreamingSelector from 'src/dataLoaders/components/collectorsWizard/select/StreamingSelector'
import OnboardingButtons from 'src/onboarding/components/OnboardingButtons'

// Actions
import {
  addTelegrafPlugin,
  removePluginBundleWithPlugins,
} from 'src/dataLoaders/actions/dataLoaders'
import {setBucketInfo} from 'src/dataLoaders/actions/steps'

// Types
import {Bucket} from 'src/types'
import {ComponentStatus} from '@influxdata/clockface'
import {CollectorsStepProps} from 'src/dataLoaders/components/collectorsWizard/CollectorsWizard'
import {BundleName} from 'src/types/dataLoaders'
import {AppState, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

export interface OwnProps extends CollectorsStepProps {
  buckets: Bucket[]
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

@ErrorHandling
export class SelectCollectorsStep extends PureComponent<Props> {
  public render() {
    const selectedBucketName = this.props.bucket ?? this.props.buckets[0]?.name
    return (
      <Form
        onSubmit={this.props.onIncrementCurrentStepIndex}
        className="data-loading--form"
      >
        <DapperScrollbars
          autoHide={false}
          className="data-loading--scroll-content"
        >
          <div className="wizard-step--grid-container">
          <Grid.Row>
              <Grid.Column widthSM={Columns.Ten}>
            <h3 className="wizard-step--title">Where do you want to collect data from?</h3>
            <h5 className="wizard-step--sub-title">
              Telegraf is an open-source data collection agent for collecting and reporting metrics. Simply choose one of the 
              plugin libraries to start writing data into influxDB. LINK. 
            </h5>
            </Grid.Column>
            </Grid.Row>
          </div>
          <StreamingSelector
            pluginBundles={this.props.pluginBundles}
            telegrafPlugins={this.props.telegrafPlugins}
            onTogglePluginBundle={this.handleTogglePluginBundle}
            buckets={this.props.buckets ?? []}
            selectedBucketName={selectedBucketName}
            onSelectBucket={this.handleSelectBucket}
          />
        </DapperScrollbars>
        <OnboardingButtons
          autoFocusNext={true}
          nextButtonStatus={this.nextButtonStatus}
          className="data-loading--button-container"
        />
      </Form>
    )
  }

  private get nextButtonStatus(): ComponentStatus {
    const {telegrafPlugins, buckets} = this.props

    if (!buckets || !buckets.length) {
      return ComponentStatus.Disabled
    }

    if (!telegrafPlugins.length) {
      return ComponentStatus.Disabled
    }

    return ComponentStatus.Default
  }

  private handleSelectBucket = (bucket: Bucket) => {
    const {orgID, id, name} = bucket

    this.props.onSetBucketInfo(orgID, name, id)
  }

  private handleTogglePluginBundle = (
    bundle: string,
  ) => {
    // if (isSelected) {
    //   this.props.onRemovePluginBundle(bundle)

    //   return
    // }

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
console.log(buckets)
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
  onAddPluginBundle: addTelegrafPlugin,
  onRemovePluginBundle: removePluginBundleWithPlugins,
  onSetBucketInfo: setBucketInfo,
}

const connector = connect(mstp, mdtp)

export default connector(SelectCollectorsStep)
