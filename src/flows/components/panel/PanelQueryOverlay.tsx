// Libraries
import React, {useContext, FC, useCallback} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import ClientCodeCopyPage from 'src/writeData/components/ClientCodeCopyPage'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'

// Utils
import ClientCodeQueryHelper from 'src/writeData/components/ClientCodeQueryHelper'
import WriteDataDetailsProvider from 'src/writeData/components/WriteDataDetailsContext'
import {Provider as TemplateProvider} from 'src/shared/components/CodeSnippet'
import {FlowQueryContext, Stage} from 'src/flows/context/flow.query'
import {PopupContext} from 'src/flows/context/popup'

const PanelQueryOverlay: FC = () => {
  const {data, closeFn} = useContext(PopupContext)
  const panelID = data.panelID
  const contentID = data.contentID

  const {generateMap} = useContext(FlowQueryContext)

  const getPanelQuery = useCallback(
    (panelID: string): string => {
      const stage = generateMap().find((stage: Stage) => {
        return !!stage.instances.find(instance => instance.id == panelID)
      })

      return stage?.text ?? ''
    },
    [generateMap]
  )

  return (
    <Overlay visible={true}>
      <Overlay.Container>
        <Overlay.Header
          title={`Export to ${CLIENT_DEFINITIONS[contentID].name} Client Library`}
          onDismiss={closeFn}
        />
        <Overlay.Body>
          <ClientCodeQueryHelper
            contentID={contentID}
            clientQuery={getPanelQuery(panelID)}
          />
          <ClientCodeCopyPage contentID={contentID} />
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default () => (
  <TemplateProvider>
    <WriteDataDetailsProvider>
      <PanelQueryOverlay />
    </WriteDataDetailsProvider>
  </TemplateProvider>
)
