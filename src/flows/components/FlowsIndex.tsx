// Libraries
import React from 'react'

// Components
import {Page, PageHeader, Button, IconFont} from '@influxdata/clockface'
import FlowCreateButton from 'src/flows/components/FlowCreateButton'
import FlowListProvider from 'src/flows/context/flow.list'
import FlowCards from 'src/flows/components/FlowCards'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {PROJECT_NAME_PLURAL} from 'src/flows'

const FlowsIndex = () => {
  const handleFeedbackClick = (): void => {
    window.open(
      'https://w2.influxdata.com/feedback-notebooks-early-access/',
      '_blank'
    )
  }

  return (
    <FlowListProvider>
      <Page
        titleTag={pageTitleSuffixer([PROJECT_NAME_PLURAL])}
        testID="flows-index"
      >
        <PageHeader fullWidth={false}>
          <Page.Title title={PROJECT_NAME_PLURAL} />
        </PageHeader>
        <Page.ControlBar fullWidth={false}>
          <Page.ControlBarLeft>
            <Button
              onClick={handleFeedbackClick}
              text="Tell us your thoughts"
              icon={IconFont.Chat}
            />
            <p className="flows-early-access-feedback">{`You've been given early access to ${PROJECT_NAME_PLURAL}, your feedback is a gift`}</p>
          </Page.ControlBarLeft>
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
