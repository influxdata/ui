// Libraries
import React, {PureComponent} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Overlay} from '@influxdata/clockface'
import PageSpinner from 'src/perf/components/PageSpinner'
import {Footer} from 'src/writeData/components/PluginCreateConfiguration/Footer'

const TelegrafUIRefreshStepSwitcher = Loadable({
  loader: () =>
    import(
      'src/dataLoaders/components/collectorsWizard/TelegrafUIRefreshStepSwitcher'
    ),
  loading() {
    return <PageSpinner />
  },
})

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'
import {
  clearSteps,
  decrementCurrentStepIndex,
  incrementCurrentStepIndex,
  setCurrentStepIndex,
  setSubstepIndex,
} from 'src/dataLoaders/actions/steps'

import {clearDataLoaders} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

// Constants
import {getBucketOverlayWidth} from 'src/buckets/constants'
const TELEGRAF_UI_REFRESH_OVERLAY_DEFAULT_WIDTH = 1200

interface OwnProps {
  onClose: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps<{orgID: string}>

@ErrorHandling
class TelegrafUIRefreshWizard extends PureComponent<Props> {
  public state = {
    pluginConfig: '',
    isValidConfiguration: false,
  }

  public componentDidMount() {
    this.props.onSetCurrentStepIndex(0)
    this.props.onSetSubstepIndex(0, 0)
  }

  public render() {
    const {currentStepIndex, substepIndex} = this.props
    let overlayBodyClassName = 'data-loading--overlay'

    let maxWidth = TELEGRAF_UI_REFRESH_OVERLAY_DEFAULT_WIDTH
    if (currentStepIndex === 0 && substepIndex === 1) {
      maxWidth = getBucketOverlayWidth()
    }

    if (
      (currentStepIndex === 0 && substepIndex === 1) ||
      currentStepIndex === 1
    ) {
      overlayBodyClassName = ''
    }

    return (
      <Overlay.Container maxWidth={maxWidth}>
        <Overlay.Header
          title="Create a Telegraf Configuration"
          onDismiss={this.handleDismiss}
        />
        <Overlay.Body className={overlayBodyClassName}>
          <TelegrafUIRefreshStepSwitcher stepProps={this.stepProps} />
        </Overlay.Body>
        <Footer {...this.stepProps} />
      </Overlay.Container>
    )
  }

  private handleDismiss = () => {
    const {
      clearDataLoaders,
      onClearSteps,
      onClose,
      history,
      locationOnDismiss,
    } = this.props
    clearDataLoaders()
    onClearSteps()
    if (locationOnDismiss) {
      onClose()
      history.push(locationOnDismiss)
    } else {
      onClose()
    }
  }

  private handleSetIsValidConfiguration = (isValid: boolean) => {
    this.setState({isValidConfiguration: isValid})
  }

  private handleSetPluginConfig = (config: string) => {
    this.setState({pluginConfig: config})
  }

  private get stepProps(): PluginConfigurationStepProps {
    const {
      currentStepIndex,
      notify,
      onDecrementCurrentStepIndex,
      onIncrementCurrentStepIndex,
      onSetSubstepIndex,
      substepIndex,
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
      substepIndex,
    }
  }
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      dataLoaders: {locationOnDismiss, telegrafPlugins},
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
    bucket,
    buckets: nonSystemBuckets,
    currentStepIndex: currentStep,
    locationOnDismiss,
    org,
    substepIndex: typeof substep === 'number' ? substep : 0,
    telegrafPlugins,
    text: telegrafEditor.text,
    username: name,
  }
}

const mdtp = {
  notify: notifyAction,
  clearDataLoaders,
  onClearSteps: clearSteps,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onSetCurrentStepIndex: setCurrentStepIndex,
  onSetSubstepIndex: setSubstepIndex,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TelegrafUIRefreshWizard))
