// Libraries
import React, {FC, useEffect, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router'

// Components
import {
  Button,
  ComponentColor,
  ComponentStatus,
  Overlay,
} from '@influxdata/clockface'

// Actions
import {createOrUpdateTelegrafConfigAsync} from 'src/dataLoaders/actions/dataLoaders'
import {updateTelegraf} from 'src/telegrafs/actions/thunks'

// Types
import {AppState, ResourceType, Telegraf} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'
import {getAll} from 'src/resources/selectors'

type ParamsType = {
  [param: string]: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const PluginCreateConfigurationFooterComponent: FC<Props> = props => {
  const {
    currentStepIndex,
    isValidConfiguration,
    onDecrementCurrentStepIndex,
    onExit,
    onIncrementCurrentStepIndex,
    onSaveTelegrafConfig,
    onUpdateTelegraf,
    substepIndex,
    telegrafConfig,
    pluginConfig,
  } = props

  const shouldTelegrafUpdate = useMemo(() => {
    return Boolean(telegrafConfig)
  }, [telegrafConfig])

  const {contentID} = useParams<ParamsType>()

  useEffect(() => {
    if (telegrafConfig) {
      const {config} = telegrafConfig
      const position =
        typeof config === 'string'
          ? config.indexOf(`[[inputs.${contentID}]]`)
          : -1
      const updatedConfig =
        position >= 0
          ? `${config.substring(0, position)}${pluginConfig}`
          : `${config}${pluginConfig}`

      onUpdateTelegraf({
        ...telegrafConfig,
        config: updatedConfig,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldTelegrafUpdate])

  const handleSaveAndTest = () => {
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
        status={
          isValidConfiguration
            ? ComponentStatus.Valid
            : ComponentStatus.Disabled
        }
        tabIndex={0}
        testID="plugin-create-configuration-save-and-test"
        text="Save and Test"
      />
    </Overlay.Footer>
  )
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
  onSaveTelegrafConfig: createOrUpdateTelegrafConfigAsync,
  onUpdateTelegraf: updateTelegraf,
}

const connector = connect(mstp, mdtp)

export const PluginCreateConfigurationFooter = connector(
  PluginCreateConfigurationFooterComponent
)
