// Libraries
import React, {FC, useState} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'
import {PluginCreateConfigurationFooter} from 'src/writeData/components/PluginCreateConfigurationFooter'

// Types
import {AppState} from 'src/types'
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

// Constants
import {BUCKET_OVERLAY_WIDTH} from 'src/buckets/constants'

const PLUGIN_CREATE_CONFIGURATION_OVERLAY_DEFAULT_WIDTH = 1200
const PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH = 480
const spinner = <div />

const PluginCreateConfigurationStepSwitcher = Loadable({
  loader: () =>
    import('src/writeData/components/PluginCreateConfigurationStepSwitcher'),
  loading() {
    return spinner
  },
})

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

export const PluginConfigSwitcher: FC<Props> = props => {
  const {
    currentStepIndex,
    notify,
    onClearSteps,
    onClearDataLoaders,
    onDecrementCurrentStepIndex,
    onIncrementCurrentStepIndex,
    onSetSubstepIndex,
    substepIndex,
    telegrafPlugins,
  } = props

  const handleDismiss = () => {
    onClearDataLoaders()
    onClearSteps()
  }

  const [pluginConfig, setPluginConfig] = useState<string>('')
  const [isValidConfiguration, setIsValidConfiguration] = useState<boolean>(
    false
  )

  const pluginConfigName = telegrafPlugins[0].name

  const stepProps = {
    currentStepIndex,
    isValidConfiguration,
    notify,
    onDecrementCurrentStepIndex,
    onExit: handleDismiss,
    onIncrementCurrentStepIndex,
    onSetSubstepIndex,
    pluginConfig,
    setIsValidConfiguration,
    setPluginConfig,
    substepIndex,
    pluginConfigName,
  }

  let title = 'Configuration Options'
  if (currentStepIndex === 0 && substepIndex === 1) {
    title = 'Create Bucket'
  } else if (currentStepIndex !== 0) {
    title = 'Add Plugin to a new Telegraf Configuration'
  }

  let maxWidth = PLUGIN_CREATE_CONFIGURATION_OVERLAY_DEFAULT_WIDTH
  if (currentStepIndex === 0) {
    if (substepIndex === 1) {
      maxWidth = BUCKET_OVERLAY_WIDTH
    } else {
      maxWidth = PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH
    }
  }

  let overlayBodyClassName = 'data-loading--overlay'

  if (currentStepIndex === 0 || currentStepIndex === 1) {
    overlayBodyClassName = ''
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={maxWidth}>
        <Overlay.Header title={title} onDismiss={handleDismiss} />
        <Overlay.Body className={overlayBodyClassName}>
          <PluginCreateConfigurationStepSwitcher stepProps={stepProps} />
        </Overlay.Body>
        <PluginCreateConfigurationFooter {...stepProps} />
      </Overlay.Container>
    </Overlay>
  )
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      dataLoaders: {telegrafPlugins},
      steps: {currentStep, substep = 0},
    },
  } = state

  return {
    telegrafPlugins,
    currentStepIndex: currentStep,
    substepIndex: typeof substep === 'number' ? substep : 0,
  }
}

const mdtp = {
  notify: notifyAction,
  onClearSteps: clearSteps,
  onClearDataLoaders: clearDataLoaders,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onSetCurrentStepIndex: setCurrentStepIndex,
  onSetSubstepIndex: setSubstepIndex,
}

const connector = connect(mstp, mdtp)

export default connector(PluginConfigSwitcher)
