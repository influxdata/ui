// Libraries
import React, {useContext, FC, memo} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import {CopyToClipboardContext} from 'src/flows/context/panel'
import ClientCodeCopyPage from 'src/writeData/components/ClientCodeCopyPage'
import {FlowQueryContext, Stage} from 'src/flows/context/flow.query'
import {CLIENT_DEFINITIONS} from 'src/writeData'
import {Provider as TemplateProvider} from 'src/shared/components/CodeSnippet'

interface OwnProps {
  panelId: string
}
type Props = OwnProps & RouteComponentProps<{orgID: string}>

const PanelQueryOverlay: FC<Props> = ({panelId}) => {
  // FIXME: Remove this to use a dropdown or similar so we can select the contentID/language
  const contentID = 'python'

  const {generateMap} = useContext(FlowQueryContext)
  const {visible, setVisibility} = useContext(CopyToClipboardContext)

  const getPanelQuery = (panelId: string): string => {
    const stage = generateMap().find((stage: Stage) => {
      return !!stage.instances.find(instance => instance.id == panelId)
    })

    return stage?.text ?? ''
  }

  return (
    <Overlay visible={visible}>
      <Overlay.Container>
        <Overlay.Header
          title={`Export to ${CLIENT_DEFINITIONS[contentID].name} Client Library`}
          onDismiss={() => setVisibility(!visible)}
        />
        <Overlay.Body>
          <TemplateProvider>
            <ClientCodeCopyPage
              contentID={contentID}
              query={getPanelQuery(panelId)}
            />
          </TemplateProvider>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default withRouter(memo(PanelQueryOverlay))
