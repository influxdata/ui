// Libraries
import React, {FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {Overlay, OverlayFooter} from '@influxdata/clockface'
import LineProtocol from 'src/buckets/components/lineProtocol/configure/LineProtocol'

// Types
import LineProtocolFooterButtons from './LineProtocolFooterButtons'

const LineProtocolWizard: FC = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()

  const handleDismiss = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={800}>
        <Overlay.Header
          title="Add Data Using Line Protocol"
          onDismiss={handleDismiss}
        />
        <LineProtocol />
        <OverlayFooter>
          <LineProtocolFooterButtons />
        </OverlayFooter>
      </Overlay.Container>
    </Overlay>
  )
}

export default LineProtocolWizard
