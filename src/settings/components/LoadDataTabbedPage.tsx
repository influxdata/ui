// Libraries
import React, {FC, ReactNode} from 'react'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoadDataNavigation from 'src/settings/components/LoadDataNavigation'
import {ComponentSize, Orientation, Page, Tabs} from '@influxdata/clockface'

interface Props {
  activeTab: string
  children?: ReactNode
}

const LoadDataTabbedPage: FC<Props> = ({activeTab, children}) => {
  return (
    <Page.Contents
      fullWidth={true}
      scrollable={shouldPageBeScrollable(activeTab)}
      scrollbarSize={ComponentSize.Large}
      autoHideScrollbar={true}
    >
      <Tabs.Container
        orientation={Orientation.Horizontal}
        stretchToFitHeight={true}
      >
        <LoadDataNavigation activeTab={activeTab} />
        <ErrorBoundary>
          <Tabs.TabContents>{children}</Tabs.TabContents>
        </ErrorBoundary>
      </Tabs.Container>
    </Page.Contents>
  )
}

// this function returns whether the page should be allowed to scroll or not based on the featureFlag enabled and the current tab the user is on.
const shouldPageBeScrollable = (activeTab: string): boolean => {
  if (activeTab === 'buckets') {
    return false
  }
  if (activeTab === 'tokens') {
    return false
  }
  if (activeTab === 'sources') {
    return false
  }

  return true
}

export default LoadDataTabbedPage
