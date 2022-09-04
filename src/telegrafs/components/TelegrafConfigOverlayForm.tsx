// Libraries
import React, {FC, useState, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import TelegrafConfig from 'src/telegrafs/components/TelegrafConfig'
import {
  ComponentColor,
  Button,
  Overlay,
  Panel,
  Heading,
  HeadingElement,
  FlexDirection,
  AlignItems,
  JustifyContent,
  IconFont,
  ConfirmationButton,
  ComponentSize,
} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Actions
import {updateTelegraf} from 'src/telegrafs/actions/thunks'

// Utils
import {downloadTextFile} from 'src/shared/utils/download'

// Types
import {AppState, ResourceType, Telegraf} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

const TelegrafConfigOverlayForm: FC = () => {
  const dispatch = useDispatch()
  const getTelegrafs = (state: AppState): Telegraf[] => {
    return getAll<Telegraf>(state, ResourceType.Telegrafs)
  }
  const telegrafs = useSelector(getTelegrafs)
  const {params, onClose} = useContext(OverlayContext)

  let telegraf

  if (params?.collectorId) {
    telegraf = telegrafs.find(tel => tel.id === params.collectorId)
  }

  const [workingConfig, updateWorkingConfig] = useState<string>(
    telegraf?.config || ''
  )

  if (!telegraf) {
    return null
  }

  const handleDownloadConfig = () => {
    const {name} = telegraf
    downloadTextFile(workingConfig, name || 'telegraf', '.conf')
  }

  const handleSaveConfig = (): void => {
    dispatch(updateTelegraf({...telegraf, config: workingConfig}))
    onClose()
  }

  const handleChangeConfig = (config: string): void => {
    updateWorkingConfig(config)
  }

  return (
    <>
      <Overlay.Body>
        <Panel style={{marginBottom: '8px'}}>
          <Panel.Body
            direction={FlexDirection.Row}
            alignItems={AlignItems.Center}
            justifyContent={JustifyContent.SpaceBetween}
            size={ComponentSize.ExtraSmall}
          >
            <Heading element={HeadingElement.H4}>{telegraf.name}</Heading>
            <Button
              icon={IconFont.Download_New}
              color={ComponentColor.Secondary}
              text="Download Config"
              onClick={handleDownloadConfig}
            />
          </Panel.Body>
        </Panel>
        <div className="config-overlay">
          <TelegrafConfig
            config={workingConfig}
            onChangeConfig={handleChangeConfig}
          />
        </div>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          text="Cancel"
          onClick={onClose}
        />
        <ConfirmationButton
          color={ComponentColor.Success}
          text="Save Changes"
          onConfirm={handleSaveConfig}
          confirmationButtonText="Save"
          confirmationButtonColor={ComponentColor.Success}
          confirmationLabel="This cannot be undone, are you sure?"
        />
      </Overlay.Footer>
    </>
  )
}

export default TelegrafConfigOverlayForm
