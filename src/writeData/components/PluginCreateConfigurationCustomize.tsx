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
  Overlay,
} from '@influxdata/clockface'
import TelegrafConfig from 'src/telegrafs/components/TelegrafConfig'

// Actions
import {
  addPluginBundleWithPlugins,
  setTelegrafConfigName,
  createOrUpdateTelegrafConfigAsync,
} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState} from 'src/types'
import {BundleName} from 'src/types/dataLoaders'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getDataLoaders} from 'src/dataLoaders/selectors'

// Utils
// import {downloadTextFile} from 'src/shared/utils/download'

// Constants
import {TELEGRAF_DEFAULT_OUTPUT} from 'src/writeData/constants/contentTelegrafPlugins'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const PluginCreateConfigurationCustomize: FC<Props> = props => {
  const {
    onAddPluginBundle,
    onDecrementCurrentStepIndex,
    onIncrementCurrentStepIndex,
    onSaveTelegrafConfig,
    onSetTelegrafConfigName,
    telegrafConfigName,
  } = props

  const handleDownloadConfig = () => {
    // const {name} = telegraf
    // downloadTextFile(workingConfig, name || 'telegraf', '.conf')
  }

  const handleCopy = () => {}

  const handleClickCopy = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const handleNameInput = (event: ChangeEvent<HTMLInputElement>) => {
    onSetTelegrafConfigName(event.target.value)
  }

  const workingConfig = TELEGRAF_DEFAULT_OUTPUT

  const handleChangeConfig = () => {}

  const handleSaveAndTest = () => {
    onAddPluginBundle(BundleName.System)
    onSaveTelegrafConfig()
    onIncrementCurrentStepIndex()
  }
  return (
    <>
      <Grid>
        <Grid.Row>
          <Grid.Column widthLG={Columns.Eight}>
            <Form.Element label="Agent Name">
              <Input
                type={InputType.Text}
                value={telegrafConfigName}
                name="name"
                onChange={handleNameInput}
                titleText="Agent Name"
                size={ComponentSize.Medium}
                autoFocus={true}
              />
            </Form.Element>
          </Grid.Column>
          <Grid.Column widthLG={Columns.Two}>
            <CopyToClipboard text="hello clipboard" onCopy={handleCopy}>
              <Button
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
          <Grid.Column widthLG={Columns.Two}>
            <Button
              color={ComponentColor.Secondary}
              icon={IconFont.Download}
              onClick={handleDownloadConfig}
              size={ComponentSize.Medium}
              text="Download Config"
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <div className="config-overlay">
            <TelegrafConfig
              config={workingConfig}
              onChangeConfig={handleChangeConfig}
            />
          </div>
        </Grid.Row>
      </Grid>
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
    </>
  )
}

const mstp = (state: AppState) => {
  const {telegrafConfigName, telegrafConfigID} = getDataLoaders(state)

  return {
    telegrafConfigID,
    telegrafConfigName,
  }
}

const mdtp = {
  onAddPluginBundle: addPluginBundleWithPlugins,
  onSetTelegrafConfigName: setTelegrafConfigName,
  onSaveTelegrafConfig: createOrUpdateTelegrafConfigAsync,
}

const connector = connect(mstp, mdtp)

export default connector(PluginCreateConfigurationCustomize)
