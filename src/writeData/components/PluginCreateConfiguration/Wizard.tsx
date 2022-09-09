// Libraries
import React, {FC, useEffect, useState} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router'

// Components
import {Overlay} from '@influxdata/clockface'
import PageSpinner from 'src/perf/components/PageSpinner'
import {Footer} from 'src/writeData/components/PluginCreateConfiguration/Footer'

// Types
import {AppState} from 'src/types'

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

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Constants
import {getBucketOverlayWidth} from 'src/buckets/constants'
import {TELEGRAF_PLUGINS} from 'src/shared/constants/routes'
const PLUGIN_CREATE_CONFIGURATION_OVERLAY_DEFAULT_WIDTH = 1200
const PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH = 480

const StepSwitcher = Loadable({
  loader: () =>
    import('src/writeData/components/PluginCreateConfiguration/StepSwitcher'),
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
    clearDataLoaders,
    onClearSteps,
    onDecrementCurrentStepIndex,
    onIncrementCurrentStepIndex,
    onSetCurrentStepIndex,
    onSetSubstepIndex,
    org,
    setBucketInfo,
    substepIndex,
  } = props

  const {contentID} = useParams<ParamsType>()

  useEffect(() => {
    clearDataLoaders()
    onSetCurrentStepIndex(0)
    onSetSubstepIndex(0, 0)
    setBucketInfo('', '', '')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [pluginConfig, setPluginConfig] = useState<string>('')
  const [isValidConfiguration, setIsValidConfiguration] =
    useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(true)

  const handleDismiss = () => {
    clearDataLoaders()
    onClearSteps()
    if (substepIndex === 1) {
      onSetSubstepIndex(0, 0)
    } else {
      setIsVisible(false)
      history.push(`/orgs/${org.id}/load-data/${TELEGRAF_PLUGINS}/${contentID}`)
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
      maxWidth = getBucketOverlayWidth()
    } else {
      maxWidth = PLUGIN_CREATE_CONFIGURATION_OVERLAY_OPTIONS_WIDTH
    }
  }

  let overlayBodyClassName = 'data-loading--overlay'

  if (currentStepIndex === 0 || substepIndex === 1) {
    overlayBodyClassName = ''
  }
  if (currentStepIndex === 1) {
    overlayBodyClassName = 'configuration-overlay--body'
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
      steps: {currentStep, substep = 0},
    },
  } = state

  const org = getOrg(state)

  return {
    currentStepIndex: currentStep,
    org,
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
  setBucketInfo,
}

const connector = connect(mstp, mdtp)

export default connector(Wizard)
