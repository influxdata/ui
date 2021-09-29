// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  ComponentColor,
  ComponentStatus,
  ConfirmationButton,
  Overlay,
} from '@influxdata/clockface'

// Actions
import {updateTelegraf} from 'src/telegrafs/actions/thunks'

// Types
import {AppState, ResourceType, Telegraf} from 'src/types'
import {PluginConfigurationStep} from 'src/types/dataLoaders'
import {PluginConfigurationStepProps} from 'src/writeData/components/PluginAddToExistingConfiguration/Wizard'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'
import {getAll} from 'src/resources/selectors'

interface FooterProps {
  onCancel: () => void
  onConfirm: () => void
  hasDuplicatePlugin?: boolean
  isValidConfiguration: boolean
}

const FooterConfigure: FC<FooterProps> = props => {
  const {onCancel, onConfirm, hasDuplicatePlugin, isValidConfiguration} = props

  return (
    <>
      <Button
        color={ComponentColor.Default}
        onClick={onCancel}
        tabIndex={1}
        testID="plugin-add-to-existing-configuration-cancel"
        text="Cancel"
      />
      {isValidConfiguration && hasDuplicatePlugin ? (
        <ConfirmationButton
          color={ComponentColor.Primary}
          text="Add to Existing Config"
          onConfirm={onConfirm}
          confirmationButtonText="Yes"
          confirmationButtonColor={ComponentColor.Primary}
          confirmationLabel="This configuration already contains this plugin. Are you sure you want to add another?"
          status={ComponentStatus.Valid}
          tabIndex={0}
          testID="plugin-add-to-existing-configuration"
        />
      ) : (
        <Button
          color={ComponentColor.Primary}
          text="Add to Existing Config"
          onClick={onConfirm}
          status={
            isValidConfiguration
              ? ComponentStatus.Valid
              : ComponentStatus.Disabled
          }
          tabIndex={0}
          testID="plugin-add-to-existing-configuration"
        />
      )}
    </>
  )
}

const FooterCustomize: FC<FooterProps> = props => {
  const {onCancel, onConfirm, isValidConfiguration} = props

  return (
    <>
      <Button
        color={ComponentColor.Default}
        onClick={onCancel}
        tabIndex={1}
        testID="plugin-add-to-configuration-previous"
        text="Previous"
      />
      {isValidConfiguration ? (
        <ConfirmationButton
          color={ComponentColor.Primary}
          text="Save and Test"
          onConfirm={onConfirm}
          confirmationButtonText="Save"
          confirmationButtonColor={ComponentColor.Primary}
          confirmationLabel="Are you sure you want to save changes?"
          status={ComponentStatus.Valid}
          tabIndex={0}
          testID="plugin-add-to-configuration-save-and-test"
        />
      ) : (
        <Button
          color={ComponentColor.Primary}
          text="Save and Test"
          onClick={onConfirm}
          status={ComponentStatus.Disabled}
          tabIndex={0}
          testID="plugin-add-to-configuration-save-and-test"
        />
      )}
    </>
  )
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginConfigurationStepProps & ReduxProps

const FooterComponent: FC<Props> = props => {
  const {
    currentStepIndex,
    isValidConfiguration,
    onDecrementCurrentStepIndex,
    onExit,
    onIncrementCurrentStepIndex,
    onUpdateTelegraf,
    pluginConfig,
    pluginConfigName,
    setIsValidConfiguration,
    telegrafConfig,
  } = props

  const handleContinueFromConfigure = () => {
    setIsValidConfiguration(false)
    onIncrementCurrentStepIndex()
  }

  const handleSaveAndTest = () => {
    onUpdateTelegraf({
      ...telegrafConfig,
      config: pluginConfig,
    })
    onIncrementCurrentStepIndex()
  }

  const pattern = `[[inputs.${pluginConfigName}]]`

  let FooterButtons = null

  if (currentStepIndex === PluginConfigurationStep.Configure) {
    FooterButtons = (
      <FooterConfigure
        onCancel={onExit}
        onConfirm={handleContinueFromConfigure}
        hasDuplicatePlugin={telegrafConfig?.config?.includes(pattern) ?? false}
        isValidConfiguration={isValidConfiguration}
      />
    )
  }

  if (currentStepIndex === PluginConfigurationStep.Customize) {
    FooterButtons = (
      <FooterCustomize
        onCancel={onDecrementCurrentStepIndex}
        onConfirm={handleSaveAndTest}
        isValidConfiguration={isValidConfiguration}
      />
    )
  }

  return <Overlay.Footer>{FooterButtons}</Overlay.Footer>
}

const mstp = (state: AppState) => {
  const {telegrafConfigID} = getDataLoaders(state)
  let telegrafConfig = null
  if (telegrafConfigID) {
    const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)
    telegrafConfig = telegrafs.find(
      telegraf => telegraf.id === telegrafConfigID
    )
  }
  return {telegrafConfig}
}

const mdtp = {
  onUpdateTelegraf: updateTelegraf,
}

const connector = connect(mstp, mdtp)

export const Footer = connector(FooterComponent)
