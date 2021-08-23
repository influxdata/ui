// Libraries
import React, {ChangeEvent, FC, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'

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
  addPluginBundleWithPlugins,
  setTelegrafConfigName,
  setTelegrafConfigDescription,
  createOrUpdateTelegrafConfigAsync,
} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'

// Utils
import {downloadTextFile} from 'src/shared/utils/download'

// Constants
import {TELEGRAF_DEFAULT_OUTPUT} from 'src/writeData/constants/contentTelegrafPlugins'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const PluginCreateConfigurationCustomizeComponent: FC<Props> = props => {
  const {
    onSetTelegrafConfigName,
    onSetTelegrafConfigDescription,
    telegrafConfigDescription,
    telegrafConfigName,
  } = props

  const workingConfig = TELEGRAF_DEFAULT_OUTPUT

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

  const handleChangeConfig = () => {}

  return (
    <>
      <Grid>
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
              onChangeConfig={handleChangeConfig}
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
  onAddPluginBundle: addPluginBundleWithPlugins,
  onSetTelegrafConfigName: setTelegrafConfigName,
  onSaveTelegrafConfig: createOrUpdateTelegrafConfigAsync,
  onSetTelegrafConfigDescription: setTelegrafConfigDescription,
}

const connector = connect(mstp, mdtp)

export const PluginCreateConfigurationCustomize = connector(
  PluginCreateConfigurationCustomizeComponent
)
