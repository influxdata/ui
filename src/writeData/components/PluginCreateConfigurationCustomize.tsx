// Libraries
import React, {ChangeEvent, FC, MouseEvent, useEffect} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router'

// Components
import {
  Button,
  ButtonShape,
  Columns,
  ComponentColor,
  ComponentSize,
  Form,
  Grid,
  IconFont,
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

// Utils
import {downloadTextFile} from 'src/shared/utils/download'

// Constants
// import {TELEGRAF_DEFAULT_OUTPUT} from 'src/writeData/constants/contentTelegrafPlugins'

type ParamsType = {
  [param: string]: string
}

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
    setPluginConfig,
  } = props

  const {contentID} = useParams<ParamsType>()

  const workingConfig = pluginConfig
  useEffect(() => {
    import(
      `src/writeData/components/telegrafInputPluginsConfigurationText/${contentID}.conf`
    ).then(module => {
      const pluginText = module.default ?? ''
      setPluginConfig(pluginText)
      onAddTelegrafPlugins([
        {
          name: contentID,
          configured: ConfigurationState.Configured,
          active: false,
          plugin: {
            name: contentID,
            type: 'input',
          },
        },
      ])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentID])

  const handleDownloadConfig = () => {
    downloadTextFile(workingConfig, telegrafConfigName || 'telegraf', '.conf')
  }

  const handleCopy = () => {}

  const handleClickCopy = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
  }

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
          <Grid.Column widthSM={Columns.Ten}>
            <Form.Element label="Agent Name">
              <Input
                type={InputType.Text}
                value={telegrafConfigName}
                name="name"
                onChange={handleNameInput}
                placeholder="Your configuration name"
                titleText="Agent Name"
                size={ComponentSize.Medium}
                autoFocus={true}
                testID="plugin-create-configuration-customize-input--name"
              />
            </Form.Element>
          </Grid.Column>
          <Grid.Column widthSM={Columns.Two}>
            <CopyToClipboard text={workingConfig} onCopy={handleCopy}>
              <Button
                className="plugin-create-configuration-copy-to-clipboard--button"
                color={ComponentColor.Default}
                onClick={handleClickCopy}
                shape={ButtonShape.Default}
                size={ComponentSize.Medium}
                testID="plugin-create-configuration-copy-to-clipboard"
                text="Copy to Clipboard"
                titleText="Copy to Clipboard"
              />
            </CopyToClipboard>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className="plugin-create-configuration-description-row">
          <Grid.Column widthSM={Columns.Ten}>
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
          </Grid.Column>
          <Grid.Column widthSM={Columns.Two}>
            <Button
              className="plugin-create-configuration-download--button"
              color={ComponentColor.Secondary}
              icon={IconFont.Download}
              onClick={handleDownloadConfig}
              size={ComponentSize.Medium}
              text="Download Config"
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className="plugin-creat-configuration--editor">
          <div className="config-overlay">
            <TelegrafConfig
              config={workingConfig}
              onChangeConfig={setPluginConfig}
            />
          </div>
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
