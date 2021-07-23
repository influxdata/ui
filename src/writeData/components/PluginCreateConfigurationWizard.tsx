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
} from 'src/dataLoaders/actions/steps'
import {clearDataLoaders} from 'src/dataLoaders/actions/dataLoaders'

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
  notify: typeof notifyAction
  onDecrementCurrentStepIndex: () => void
  onExit: () => void
  onIncrementCurrentStepIndex: () => void
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
  } = props

  useEffect(() => {
    onSetCurrentStepIndex(0)
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [])

  const handleDismiss = () => {
    onClearDataLoaders()
    onClearSteps()
    history.goBack()
  }

  const stepProps = {
    currentStepIndex,
    notify,
    onDecrementCurrentStepIndex,
    onExit: handleDismiss,
    onIncrementCurrentStepIndex,
  }

  const title =
    currentStepIndex === 0
      ? 'Configuration Options'
      : 'Create a Telegraf Configuration'

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={1200}>
        <Overlay.Header title={title} onDismiss={handleDismiss} />
        <Overlay.Body className="data-loading--overlay">
          <PluginCreateConfigurationStepSwitcher stepProps={stepProps} />
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      steps: {currentStep},
    },
  } = state

  return {
    currentStepIndex: currentStep,
  }
}

const mdtp = {
  notify: notifyAction,
  onClearSteps: clearSteps,
  onClearDataLoaders: clearDataLoaders,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onSetCurrentStepIndex: setCurrentStepIndex,
}

const connector = connect(mstp, mdtp)

export default connector(PluginCreateConfigurationWizard)
