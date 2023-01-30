// Libraries
import React, {ChangeEvent, createRef, FC, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Appearance,
  ComponentSize,
  Form,
  Grid,
  Input,
  InputType,
  Popover,
  PopoverInteraction,
  PopoverPosition,
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
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginConfigurationStepProps & ReduxProps

interface AgentOutputNotificationProps {
  triggerRef: React.RefObject<HTMLElement>
}

const AgentOutputNotification: FC<AgentOutputNotificationProps> = props => (
  <>
    <Popover
      appearance={Appearance.Outline}
      contents={() => (
        <span className="plugin-create-configuration--popover-contents">
          The agent settings configures Telegraf across all plugins. Read{' '}
          <a
            href="https://docs.influxdata.com/telegraf/latest/configuration/#agent-configuration"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>{' '}
          for more information about these settings.
        </span>
      )}
      distanceFromTrigger={8}
      hideEvent={PopoverInteraction.Hover}
      position={PopoverPosition.Above}
      showEvent={PopoverInteraction.Hover}
      triggerRef={props.triggerRef}
    />
    <span>
      Input plugin configuration will be appended to default
      <code
        className="plugin-create-configuration--agent-notification"
        ref={props.triggerRef}
      >
        {' '}
        agent{' '}
      </code>
      settings and InfluxDB output upon saving
    </span>
  </>
)

const CustomizeComponent: FC<Props> = props => {
  const {
    onAddTelegrafPlugins,
    onSetTelegrafConfigName,
    onSetTelegrafConfigDescription,
    telegrafConfigDescription,
    telegrafConfigName,
    pluginConfig,
    setIsValidConfiguration,
    setPluginConfig,
    pluginConfigName,
  } = props

  const handleError = error => {
    setIsValidConfiguration(false)
    setPluginConfig(`${error}`)
  }

  useEffect(() => {
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

  const notificationRef = createRef<HTMLElement>()

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
        <Grid.Row>
          <div className="plugin-create-configuration-customize-editor">
            <TelegrafConfig
              config={pluginConfig}
              onChangeConfig={handleChangeConfig}
            />
          </div>
        </Grid.Row>
        <Grid.Row>
          <AgentOutputNotification triggerRef={notificationRef} />
        </Grid.Row>
      </Grid>
    </>
  )
}

const mstp = (state: AppState) => {
  const {telegrafConfigDescription, telegrafConfigName} = getDataLoaders(state)

  return {
    telegrafConfigDescription,
    telegrafConfigName,
  }
}

const mdtp = {
  onAddTelegrafPlugins: addTelegrafPlugins,
  onSetTelegrafConfigName: setTelegrafConfigName,
  onSetTelegrafConfigDescription: setTelegrafConfigDescription,
}

const connector = connect(mstp, mdtp)

export const Customize = connector(CustomizeComponent)
