// Libraries
import React, {PureComponent} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Overlay} from '@influxdata/clockface'
import {PluginCreateConfigurationFooter} from 'src/writeData/components/PluginCreateConfigurationFooter'

const spinner = <div />
const TelegrafUIRefreshStepSwitcher = Loadable({
  loader: () =>
    import(
      'src/dataLoaders/components/collectorsWizard/TelegrafUIRefreshStepSwitcher'
    ),
  loading() {
    return spinner
  },
})

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'
import {
  clearSteps,
  decrementCurrentStepIndex,
  incrementCurrentStepIndex,
  setBucketInfo,
  setCurrentStepIndex,
  setSubstepIndex,
} from 'src/dataLoaders/actions/steps'

import {clearDataLoaders} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{orgID: string}>

@ErrorHandling
class TelegrafUIRefreshWizard extends PureComponent<Props> {
  public state = {pluginConfig: '', isValidConfiguration: false}

  public componentDidMount() {
    const {bucket, buckets} = this.props
    if (!bucket && buckets && buckets.length) {
      const {orgID, name, id} = buckets[0]
      this.props.onSetBucketInfo(orgID, name, id)
    }
    this.props.onSetCurrentStepIndex(0)
  }

  public render() {
    const {currentStepIndex} = this.props
    let overlayBodyClassName = 'data-loading--overlay'

    if (currentStepIndex === 1) {
      overlayBodyClassName = ''
    }

    return (
      <Overlay visible={true}>
        <Overlay.Container maxWidth={1200}>
          <Overlay.Header
            title="Create a Telegraf Configuration"
            onDismiss={this.handleDismiss}
          />
          <Overlay.Body className={overlayBodyClassName}>
            <TelegrafUIRefreshStepSwitcher stepProps={this.stepProps} />
          </Overlay.Body>
          <PluginCreateConfigurationFooter {...this.stepProps} />
        </Overlay.Container>
      </Overlay>
    )
  }

  private handleDismiss = () => {
    const {history, org} = this.props
    const {onClearDataLoaders, onClearSteps} = this.props
    onClearDataLoaders()
    onClearSteps()
    history.push(`/orgs/${org.id}/load-data/telegrafs`)
  }

  private handleSetIsValidConfiguration = (isValid: boolean) => {
    this.setState({isValidConfiguration: isValid})
  }

  private handleSetPluginConfig = (config: string) => {
    this.setState({pluginConfig: config})
  }

  private get stepProps(): PluginCreateConfigurationStepProps {
    const {
      currentStepIndex,
      notify,
      onDecrementCurrentStepIndex,
      onIncrementCurrentStepIndex,
      onSetSubstepIndex,
      substep,
      telegrafPlugins,
    } = this.props

    const selectedPluginName = telegrafPlugins?.length
      ? telegrafPlugins[0].name
      : ''

    return {
      currentStepIndex,
      isValidConfiguration: this.state.isValidConfiguration,
      notify,
      onDecrementCurrentStepIndex,
      onExit: this.handleDismiss,
      onIncrementCurrentStepIndex,
      onSetSubstepIndex,
      pluginConfig: this.state.pluginConfig,
      pluginConfigName: selectedPluginName,
      setIsValidConfiguration: this.handleSetIsValidConfiguration,
      setPluginConfig: this.handleSetPluginConfig,
      substepIndex: typeof substep === 'number' ? substep : 0,
    }
  }
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      dataLoaders: {telegrafPlugins},
      steps: {currentStep, substep = 0, bucket},
    },
    me: {name},
    telegrafEditor,
  } = state

  const buckets = getAll<Bucket>(state, ResourceType.Buckets)

  const nonSystemBuckets = buckets.filter(
    bucket => !isSystemBucket(bucket.name)
  )

  const org = getOrg(state)

  return {
    telegrafPlugins,
    text: telegrafEditor.text,
    currentStepIndex: currentStep,
    substep,
    username: name,
    bucket,
    buckets: nonSystemBuckets,
    org,
  }
}

const mdtp = {
  notify: notifyAction,
  onClearDataLoaders: clearDataLoaders,
  onClearSteps: clearSteps,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onSetBucketInfo: setBucketInfo,
  onSetCurrentStepIndex: setCurrentStepIndex,
  onSetSubstepIndex: setSubstepIndex,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TelegrafUIRefreshWizard))
