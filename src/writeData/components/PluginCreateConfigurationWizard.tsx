// Libraries
import React, {FC, useEffect} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'

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
const PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH = 800

const spinner = <div />
const PluginCreateConfigurationStepSwitcher = Loadable({
  loader: () =>
    import('src/writeData/components/PluginCreateConfigurationStepSwitcher'),
  loading() {
    return spinner
  },
})

export interface PluginCreateConfigurationStepProps {
  currentStepIndex: number
  newBucketName: string
  notify: typeof notifyAction
  onDecrementCurrentStepIndex: () => void
  onExit: () => void
  onIncrementCurrentStepIndex: () => void
  onSetSubstepIndex: (currentStepIndex: number, subStepIndex: number) => void
  setNewBucketName: React.Dispatch<React.SetStateAction<string>>
  substepIndex: number
}

interface PluginCreateConfigurationWizardProps {
  history: {
    goBack: () => void
  }
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & PluginCreateConfigurationWizardProps

const PluginCreateConfigurationWizard: FC<Props> = props => {
  const {
    currentStepIndex,
    history,
    notify,
    onClearSteps,
    onClearDataLoaders,
    onDecrementCurrentStepIndex,
    onIncrementCurrentStepIndex,
    onSetCurrentStepIndex,
    onSetSubstepIndex,
    substepIndex,
  } = props

  useEffect(() => {
    onSetCurrentStepIndex(0)
    onSetSubstepIndex(0, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = () => {
    onClearDataLoaders()
    onClearSteps()
    if (substepIndex === 1) {
      onSetSubstepIndex(0, 0)
    } else {
      history.goBack()
    }
  }

  const stepProps = {
    currentStepIndex,
    notify,
    onDecrementCurrentStepIndex,
    onExit: handleDismiss,
    onIncrementCurrentStepIndex,
    onSetSubstepIndex,
    substepIndex,
  }

  let title = 'Configuration Options'
  if (currentStepIndex === 0 && substepIndex === 1) {
    title = 'Create Bucket'
  } else if (currentStepIndex !== 0) {
    title = 'Create a Telegraf Configuration'
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
    overlayBodyClassName += ' plugin-create-configuration'
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={maxWidth}>
        <Overlay.Header title={title} onDismiss={handleDismiss} />
        <Overlay.Body className={overlayBodyClassName}>
          <PluginCreateConfigurationStepSwitcher stepProps={stepProps} />
        </Overlay.Body>
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
  onClearSteps: clearSteps,
  onClearDataLoaders: clearDataLoaders,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onSetCurrentStepIndex: setCurrentStepIndex,
  onSetSubstepIndex: setSubstepIndex,
}

const connector = connect(mstp, mdtp)

export default connector(PluginCreateConfigurationWizard)
