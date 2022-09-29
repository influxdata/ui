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
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'
import {getAll} from 'src/resources/selectors'

interface FooterProps {
  hasDuplicatePlugin?: boolean
  isValidConfiguration: boolean
  onCancel: () => void
  onConfirm: () => void
  pluginConfigName?: string
}

const FooterConfigure: FC<FooterProps> = props => {
  const {
    hasDuplicatePlugin,
    isValidConfiguration,
    onCancel,
    onConfirm,
    pluginConfigName,
  } = props

  return (
    <>
      <Button
        color={ComponentColor.Tertiary}
        onClick={onCancel}
        tabIndex={1}
        testID="plugin-add-to-configuration-cancel"
        text="Cancel"
      />
      {isValidConfiguration && hasDuplicatePlugin ? (
        <ConfirmationButton
          color={ComponentColor.Primary}
          text="Add to Existing Config"
          onConfirm={onConfirm}
          confirmationButtonText="Yes"
          confirmationButtonColor={ComponentColor.Primary}
          confirmationLabel={`This configuration already contains ${pluginConfigName} Input Plugin. Are you sure you want to add another?`}
          status={ComponentStatus.Valid}
          tabIndex={0}
          testID="plugin-add-to-configuration"
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
          testID="plugin-add-to-configuration--button"
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
          testID="plugin-add-to-configuration-save-and-test--button"
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
    pluginConfig,
    pluginConfigName,
    setIsValidConfiguration,
    telegrafConfig,
    telegrafConfigDescription,
    telegrafConfigName,
    updateTelegraf,
  } = props

  const handleContinueFromConfigure = () => {
    setIsValidConfiguration(false)
    onIncrementCurrentStepIndex()
  }

  const handleSaveAndTest = () => {
    updateTelegraf({
      ...telegrafConfig,
      config: pluginConfig,
      description: telegrafConfigDescription,
      name: telegrafConfigName,
    })
    onIncrementCurrentStepIndex()
  }

  const pattern = `[[inputs.${pluginConfigName}]]`

  let FooterButtons = null

  if (currentStepIndex === PluginConfigurationStep.Configure) {
    FooterButtons = (
      <FooterConfigure
        hasDuplicatePlugin={telegrafConfig?.config?.includes(pattern) ?? false}
        isValidConfiguration={isValidConfiguration}
        onCancel={onExit}
        onConfirm={handleContinueFromConfigure}
        pluginConfigName={pluginConfigName}
      />
    )
  }

  if (currentStepIndex === PluginConfigurationStep.Customize) {
    FooterButtons = (
      <FooterCustomize
        isValidConfiguration={isValidConfiguration}
        onCancel={onDecrementCurrentStepIndex}
        onConfirm={handleSaveAndTest}
      />
    )
  }

  return <Overlay.Footer>{FooterButtons}</Overlay.Footer>
}

const mstp = (state: AppState) => {
  const {telegrafConfigDescription, telegrafConfigID, telegrafConfigName} =
    getDataLoaders(state)

  let telegrafConfig = null
  if (telegrafConfigID) {
    const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)
    telegrafConfig = telegrafs.find(
      telegraf => telegraf.id === telegrafConfigID
    )
  }

  return {telegrafConfig, telegrafConfigDescription, telegrafConfigName}
}

const mdtp = {updateTelegraf}

const connector = connect(mstp, mdtp)

export const Footer = connector(FooterComponent)
