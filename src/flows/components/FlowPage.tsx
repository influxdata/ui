import React from 'react'

// Components
import {Page} from '@influxdata/clockface'
import FlowHeader from 'src/flows/components/header'
import PipeList from 'src/flows/components/PipeList'
import MiniMap from 'src/flows/components/minimap/MiniMap'

const FlowPage = () => {
  return (
    <Page titleTag="Flows">
      <FlowHeader />
      <Page.Contents fullWidth={true} scrollable={false} className="flow-page">
        <div className="flow">
          <MiniMap />
          <PipeList />
        </div>
      </Page.Contents>
    </Page>
  )
}

export default FlowPage
