// Libraries
import React, {FC, useEffect, useState} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router'

// Components
import {Overlay} from '@influxdata/clockface'
import PageSpinner from 'src/perf/components/PageSpinner'
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

const PluginCreateConfigurationStepSwitcher = Loadable({
  loader: () =>
    import('src/writeData/components/PluginCreateConfigurationStepSwitcher'),
  loading() {
    return <PageSpinner />
  },
})

export interface PluginCreateConfigurationStepProps {
  currentStepIndex: number
  isValidConfiguration: boolean
  notify: typeof notifyAction
  onDecrementCurrentStepIndex: () => void
  onExit: () => void
  onIncrementCurrentStepIndex: () => void
  onSetSubstepIndex: (currentStepIndex: number, subStepIndex: number) => void
  pluginConfig: string
  pluginConfigName: string
  setIsValidConfiguration: (isValid: boolean) => void
  setPluginConfig: (config: string) => void
  substepIndex?: number
}

interface PluginCreateConfigurationWizardProps {
  history: {
    goBack: () => void
  }
}

type ParamsType = {
  [param: string]: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & PluginCreateConfigurationWizardProps

const PluginCreateConfigurationWizard: FC<Props> = props => {
  const {
    currentStepIndex,
    history,
    notify,
    clearDataLoaders,
    onClearSteps,
    onDecrementCurrentStepIndex,
    onIncrementCurrentStepIndex,
    onSetCurrentStepIndex,
    onSetSubstepIndex,
    substepIndex,
  } = props

  const {contentID} = useParams<ParamsType>()

  useEffect(() => {
    clearDataLoaders()
    onSetCurrentStepIndex(0)
    onSetSubstepIndex(0, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [pluginConfig, setPluginConfig] = useState<string>('')
  const [isValidConfiguration, setIsValidConfiguration] = useState<boolean>(
    false
  )
  const [isVisible, setIsVisible] = useState<boolean>(true)

  const handleDismiss = () => {
    clearDataLoaders()
    onClearSteps()
    if (substepIndex === 1) {
      onSetSubstepIndex(0, 0)
    } else {
      setIsVisible(false)
      history.goBack()
    }
  }

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
    pluginConfigName: contentID,
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
    <Overlay visible={isVisible}>
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
      steps: {currentStep, substep = 0},
    },
  } = state

  return {
    currentStepIndex: currentStep,
    substepIndex: typeof substep === 'number' ? substep : 0,
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

export default connector(PluginCreateConfigurationWizard)
