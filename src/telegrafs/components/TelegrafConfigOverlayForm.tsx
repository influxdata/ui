// Libraries
import React, {FC, useState, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useRouteMatch} from 'react-router-dom'
import _ from 'lodash'

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
} from '@influxdata/clockface'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

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

type Params = {orgID: string; id: string}
interface Match {
  params: Params
}

const TelegrafConfigOverlayForm: FC = () => {
  const dispatch = useDispatch()
  const getTelegrafs = (state: AppState): Telegraf[] => {
    return getAll<Telegraf>(state, ResourceType.Telegrafs)
  }
  const telegrafs = useSelector(getTelegrafs)
  const {onClose} = useContext(OverlayContext)
  const match: Match = useRouteMatch({
    path: '/orgs/:orgID/load-data/telegrafs/:id/view',
    exact: true,
    strict: false,
  })

  let telegraf

  if (match?.params?.id) {
    telegraf = telegrafs.find(tel => tel.id === match.params.id)
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
          >
            <Heading element={HeadingElement.H5}>{telegraf.name}</Heading>
            <Button
              icon={IconFont.Download}
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
      <FeatureFlag name="editTelegrafs">
        <Overlay.Footer>
          <Button
            color={ComponentColor.Default}
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
      </FeatureFlag>
    </>
  )
}

export default TelegrafConfigOverlayForm
