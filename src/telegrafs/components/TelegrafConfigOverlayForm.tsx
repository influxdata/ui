// Libraries
import React, {FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps, useRouteMatch} from 'react-router-dom'
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
} from '@influxdata/clockface'

// Utils
import {downloadTextFile} from 'src/shared/utils/download'

// Types
import {AppState, ResourceType, Telegraf} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

interface OwnProps {
  onClose: () => void
  onUpdateTelegraf: (telegraf: Telegraf) => void
}

type Params = {orgID: string; id: string}
interface Match {
  params: Params
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps

const TelegrafConfigOverlayForm: FC<Props> = ({
  telegrafs,
  onUpdateTelegraf,
  onClose,
}) => {
  const match: Match = useRouteMatch({
    path: '/orgs/:orgID/load-data/telegrafs/:id/view',
    exact: true,
    strict: false,
  })

  let telegraf

  if (match && match.params && match.params.id) {
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
    onUpdateTelegraf({...telegraf, config: workingConfig})
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
      <Overlay.Footer>
        <Button
          color={ComponentColor.Default}
          text="Cancel"
          onClick={onClose}
        />
        <Button
          color={ComponentColor.Success}
          text="Save Changes"
          onClick={handleSaveConfig}
        />
      </Overlay.Footer>
    </>
  )
}

const mstp = (state: AppState) => {
  return {
    telegrafs: getAll<Telegraf>(state, ResourceType.Telegrafs),
  }
}

const connector = connect(mstp)

export default connector(withRouter(TelegrafConfigOverlayForm))
