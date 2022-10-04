// Libraries
import React, {useContext, FC} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import ClientCodeCopyPage from 'src/writeData/components/ClientCodeCopyPage'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'

// Utils
import {ClientCodeQueryHelper} from 'src/writeData/components/ClientCodeQueryHelper'
import {WriteDataDetailsProvider} from 'src/writeData/components/WriteDataDetailsContext'
import {Provider as TemplateProvider} from 'src/shared/components/CodeSnippet'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PopupContext} from 'src/flows/context/popup'
import {event} from 'src/cloud/utils/reporting'

const PanelQueryOverlay: FC = () => {
  const {
    data: {contentID, panelID},
    closeFn,
  } = useContext(PopupContext)
  const {getPanelQueries, simplify} = useContext(FlowQueryContext)

  const query = simplify(getPanelQueries(panelID).source)

  const reportCopyClick = () => {
    event('Export to Client Library (Notebooks) - Copy to Clipboard Clicked')
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container>
        <Overlay.Header
          title={`Export to ${CLIENT_DEFINITIONS[contentID].name} Client Library`}
          onDismiss={closeFn}
        />
        <Overlay.Body className="flow--client-overlay">
          <ClientCodeQueryHelper contentID={contentID} clientQuery={query} />
          <ClientCodeCopyPage contentID={contentID} onCopy={reportCopyClick} />
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
