// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Button, ComponentColor, Overlay} from '@influxdata/clockface'

// Actions
import {
  addPluginBundleWithPlugins,
  createOrUpdateTelegrafConfigAsync,
} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {BundleName} from 'src/types/dataLoaders'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const PluginCreateConfigurationFooterComponent: FC<Props> = props => {
  const {
    currentStepIndex,
    onAddPluginBundle,
    onDecrementCurrentStepIndex,
    onExit,
    onIncrementCurrentStepIndex,
    onSaveTelegrafConfig,
    substepIndex,
  } = props

  const handleSaveAndTest = () => {
    onAddPluginBundle(BundleName.System)
    onSaveTelegrafConfig()
    onIncrementCurrentStepIndex()
  }

  if (substepIndex === 1 || currentStepIndex === 2) {
    return null
  }

  if (currentStepIndex === 0) {
    return (
      <Overlay.Footer>
        <Button
          color={ComponentColor.Default}
          onClick={onExit}
          tabIndex={1}
          testID="plugin-create-configuration-cancel"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Primary}
          onClick={onIncrementCurrentStepIndex}
          tabIndex={0}
          testID="plugin-create-configuration-continue-configuring"
          text="Continue Configuring"
        />
      </Overlay.Footer>
    )
  }
  return (
    <Overlay.Footer>
      <Button
        color={ComponentColor.Default}
        onClick={onDecrementCurrentStepIndex}
        tabIndex={1}
        testID="plugin-create-configuration-previous"
        text="Previous"
      />
      <Button
        color={ComponentColor.Primary}
        onClick={handleSaveAndTest}
        tabIndex={0}
        testID="plugin-create-configuration-save-and-test"
        text="Save and Test"
      />
    </Overlay.Footer>
  )
}

const mdtp = {
  onAddPluginBundle: addPluginBundleWithPlugins,
  onSaveTelegrafConfig: createOrUpdateTelegrafConfigAsync,
}

const connector = connect(null, mdtp)

export const PluginCreateConfigurationFooter = connector(
  PluginCreateConfigurationFooterComponent
)
