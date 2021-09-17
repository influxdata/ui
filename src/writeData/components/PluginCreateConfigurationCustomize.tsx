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
import {AppState, ConfigurationState} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'



type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const PluginCreateConfigurationCustomizeComponent: FC<Props> = props => {
  const {
    onAddTelegrafPlugins,
    onSetTelegrafConfigName,
    onSetTelegrafConfigDescription,
    telegrafConfigDescription,
    telegrafConfigName,
    pluginConfig,
    setIsValidConfiguration,
    setPluginConfig,
    pluginConfigName
  } = props

  console.log("i should be a string", typeof pluginConfigName)


  const handleError = error => {
    setIsValidConfiguration(false)
    setPluginConfig(`${error}`)
    console.error(error)
  }

  useEffect(() => {
    console.log("hi", pluginConfigName)
    try {
      import(
        `src/writeData/components/telegrafInputPluginsConfigurationText/${pluginConfigName}.conf`
      ).then(
        module => {
          setIsValidConfiguration(true)
          const pluginText = module.default ?? ''
          setPluginConfig(pluginText)
          onAddTelegrafPlugins([
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluginConfigName])

  const handleChangeConfig = config => setPluginConfig(config)

  const handleNameInput = (event: ChangeEvent<HTMLInputElement>) => {
    onSetTelegrafConfigName(event.target.value)
  }

  const handleDescriptionInput = (event: ChangeEvent<HTMLInputElement>) => {
    onSetTelegrafConfigDescription(event.target.value)
  }

  return (
    <>
      <Grid testID="plugin-create-configuration-customize">
        <Grid.Row className="plugin-create-configuration-name-row">
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
              testID="plugin-create-configuration-customize-input--name"
            />
          </Form.Element>
        </Grid.Row>
        <Grid.Row className="plugin-create-configuration-description-row">
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
              testID="plugin-create-configuration-customize-input--description"
            />
          </Form.Element>
        </Grid.Row>
        <Grid.Row className="plugin-create-configuration--editor">
          <div className="config-overlay">
            <TelegrafConfig
              config={pluginConfig}
              onChangeConfig={handleChangeConfig}
            />
          </div>
        </Grid.Row>
        <Grid.Row>
          <span className="plugin-create-configuration--notify-agent-output">
            Input configuration will be appended to a default agent and output
            upon saving
          </span>
        </Grid.Row>
      </Grid>
    </>
  )
}

const mstp = (state: AppState) => {
  const {
    telegrafConfigDescription,
    telegrafConfigName,
    telegrafConfigID,
  } = getDataLoaders(state)

  return {
    telegrafConfigDescription,
    telegrafConfigID,
    telegrafConfigName,
  }
}

const mdtp = {
  onAddTelegrafPlugins: addTelegrafPlugins,
  onSetTelegrafConfigName: setTelegrafConfigName,
  onSetTelegrafConfigDescription: setTelegrafConfigDescription,
}

const connector = connect(mstp, mdtp)

export const PluginCreateConfigurationCustomize = connector(
  PluginCreateConfigurationCustomizeComponent
)
