// Libraries
import React, {ChangeEvent, FC, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  ComponentSize,
  Form,
  Grid,
  Input,
  InputType,
} from '@influxdata/clockface'
import TelegrafConfig from 'src/telegrafs/components/TelegrafConfig'

// Actions
import {
  addTelegrafPlugins,
  setTelegrafConfigName,
  setTelegrafConfigDescription,
} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState, ConfigurationState, ResourceType, Telegraf} from 'src/types'
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getDataLoaders} from 'src/dataLoaders/selectors'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginConfigurationStepProps & ReduxProps

const CustomizeComponent: FC<Props> = props => {
  const {
    addTelegrafPlugins,
    pluginConfig,
    pluginConfigName,
    setIsValidConfiguration,
    setPluginConfig,
    setTelegrafConfigDescription,
    setTelegrafConfigName,
    telegrafConfig,
    telegrafConfigDescription,
    telegrafConfigName,
  } = props

  const handleError = error => {
    setIsValidConfiguration(false)
    setPluginConfig(`${error}`)
  }

  useEffect(() => {
    if (!pluginConfig) {
      try {
        import(
          `src/writeData/components/telegrafInputPluginsConfigurationText/${pluginConfigName}.conf`
        ).then(
          module => {
            setIsValidConfiguration(true)
            const pluginText = module.default ?? ''
            setPluginConfig(`${telegrafConfig}${pluginText}`)
            addTelegrafPlugins([
              {
                name: pluginConfigName,
                configured: ConfigurationState.Configured,
                active: false,
                plugin: {
                  name: pluginConfigName,
                  type: 'input',
                },
              },
            ])
          },
          error => handleError(error)
        )
      } catch (error) {
        handleError(error)
      }
    } else {
      setIsValidConfiguration(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeConfig = config => setPluginConfig(config)

  const handleNameInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTelegrafConfigName(event.target.value)
  }

  const handleDescriptionInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTelegrafConfigDescription(event.target.value)
  }

  return (
    <>
      <Grid testID="plugin-edit-configuration-customize">
        <Grid.Row className="plugin-edit-configuration-name-row">
          <Form.Element label="Configuration Name">
            <Input
              type={InputType.Text}
              value={telegrafConfigName}
              name="name"
              onChange={handleNameInput}
              placeholder="Your configuration name"
              titleText="Configuration Name"
              size={ComponentSize.Medium}
              autoFocus={true}
              testID="plugin-edit-configuration-customize-input--name"
            />
          </Form.Element>
        </Grid.Row>
        <Grid.Row className="plugin-edit-configuration-description-row">
          <Form.Element label="Configuration Description">
            <Input
              type={InputType.Text}
              value={telegrafConfigDescription}
              name="description"
              onChange={handleDescriptionInput}
              placeholder="Your configuration description"
              titleText="Description (Optional)"
              size={ComponentSize.Medium}
              autoFocus={true}
              testID="plugin-edit-configuration-customize-input--description"
            />
          </Form.Element>
        </Grid.Row>
        <Grid.Row>
          <div className="plugin-edit-configuration--editor">
            <TelegrafConfig
              config={pluginConfig}
              onChangeConfig={handleChangeConfig}
            />
          </div>
        </Grid.Row>
      </Grid>
    </>
  )
}

const mstp = (state: AppState) => {
  const {telegrafConfigDescription, telegrafConfigID, telegrafConfigName} =
    getDataLoaders(state)
  const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)

  const selectedTelegraf = telegrafs?.find(
    telegraf => telegraf.id === telegrafConfigID
  )
  return {
    telegrafConfig: selectedTelegraf?.config ?? '',
    telegrafConfigDescription,
    telegrafConfigName,
  }
}

const mdtp = {
  addTelegrafPlugins,
  setTelegrafConfigName,
  setTelegrafConfigDescription,
}

const connector = connect(mstp, mdtp)

export const Customize = connector(CustomizeComponent)
