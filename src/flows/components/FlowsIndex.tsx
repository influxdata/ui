// Libraries
import React from 'react'

// Components
import {Page, PageHeader} from '@influxdata/clockface'
import FlowCreateButton from 'src/flows/components/FlowCreateButton'
import FlowListProvider from 'src/flows/context/flow.list'
import FlowCards from 'src/flows/components/FlowCards'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FlowsIndex = () => {
  return (
    <FlowListProvider>
      <Page titleTag={pageTitleSuffixer(['Flows'])} testID="flows-index">
        <PageHeader fullWidth={false}>
          <Page.Title title="Flows" />
        </PageHeader>
        <Page.ControlBar fullWidth={false}>
          <Page.ControlBarLeft></Page.ControlBarLeft>
          <Page.ControlBarRight>
            <FlowCreateButton />
          </Page.ControlBarRight>
        </Page.ControlBar>
        <Page.Contents fullWidth={false}>
          <FlowCards />
        </Page.Contents>
      </Page>
    </FlowListProvider>
  )
}

export default FlowsIndex
