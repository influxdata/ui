// Libraries
import React, {FC, useEffect, useState} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router'

// Components
import {Overlay} from '@influxdata/clockface'
import PageSpinner from 'src/perf/components/PageSpinner'
import {Footer} from 'src/writeData/components/PluginAddToExistingConfiguration/Footer'

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

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Constants
import {TELEGRAF_PLUGINS} from 'src/shared/constants/routes'
const PLUGIN_CREATE_CONFIGURATION_OVERLAY_DEFAULT_WIDTH = 1200
const PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH = 480
const PREVENT_OVERLAY_FLICKER_STEP = -1

const StepSwitcher = Loadable({
  loader: () =>
    import(
      'src/writeData/components/PluginAddToExistingConfiguration/StepSwitcher'
    ),
  loading() {
    return <PageSpinner />
  },
})

interface WizardProps {
  history: {
    push: (route: string) => void
  }
}

type ParamsType = {
  [param: string]: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & WizardProps

const Wizard: FC<Props> = props => {
  const {
    currentStepIndex,
    history,
    notify,
    onClearDataLoaders,
    onClearSteps,
    onDecrementCurrentStepIndex,
    onIncrementCurrentStepIndex,
    onSetCurrentStepIndex,
    onSetSubstepIndex,
    org,
  } = props

  const {contentID} = useParams<ParamsType>()

  useEffect(() => {
    onSetCurrentStepIndex(0)
    onSetSubstepIndex(0, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [pluginConfig, setPluginConfig] = useState<string>('')
  const [isValidConfiguration, setIsValidConfiguration] =
    useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(true)

  const handleDismiss = () => {
    onClearDataLoaders()
    onClearSteps()
    onSetCurrentStepIndex(PREVENT_OVERLAY_FLICKER_STEP)
    history.push(`/orgs/${org.id}/load-data/${TELEGRAF_PLUGINS}/${contentID}`)
    setIsVisible(false)
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
    pluginConfigName: contentID,
    setIsValidConfiguration,
    setPluginConfig,
  }

  let title = 'Configuration Options'
  if (currentStepIndex !== 0) {
    title = 'Edit this Telegraf Configuration'
  }

  let maxWidth = PLUGIN_CREATE_CONFIGURATION_OVERLAY_DEFAULT_WIDTH
  if (currentStepIndex === 0) {
    maxWidth = PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH
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
          <StepSwitcher stepProps={stepProps} />
        </Overlay.Body>
        <Footer {...stepProps} />
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

  const org = getOrg(state)

  return {
    currentStepIndex: currentStep,
    org,
  }
}

const mdtp = {
  notify: notifyAction,
  onClearDataLoaders: clearDataLoaders,
  onClearSteps: clearSteps,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onSetCurrentStepIndex: setCurrentStepIndex,
  onSetSubstepIndex: setSubstepIndex,
}

const connector = connect(mstp, mdtp)

export default connector(Wizard)
