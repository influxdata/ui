// Libraries
import React, {FC, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoadDataNavigation from 'src/settings/components/LoadDataNavigation'
import {ComponentSize, Orientation, Page, Tabs} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface ComponentProps {
  activeTab: string
  children?: ReactNode
}

type StateProps = ConnectedProps<typeof connector>

type Props = ComponentProps & StateProps

const LoadDataTabbedPage: FC<Props> = ({activeTab, orgID, children}) => {
  return (
    <Page.Contents
      fullWidth={false}
      scrollable={shouldPageBeScrollable(activeTab)}
      scrollbarSize={ComponentSize.Large}
      autoHideScrollbar={true}
    >
      <Tabs.Container
        orientation={Orientation.Horizontal}
        stretchToFitHeight={true}
      >
        <LoadDataNavigation activeTab={activeTab} orgID={orgID} />
        <ErrorBoundary>
          <Tabs.TabContents>{children}</Tabs.TabContents>
        </ErrorBoundary>
      </Tabs.Container>
    </Page.Contents>
  )
}

// this function returns whether the page should be allowed to scroll or not based on the featureFlag enabled and the current tab the user is on.
const shouldPageBeScrollable = (activeTab: string): boolean => {
  if (activeTab === 'buckets' && isFlagEnabled('fetchAllBuckets')) {
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

const mstp = (state: AppState) => {
  const org = getOrg(state)

  return {orgID: org.id}
}

const connector = connect(mstp)

export default connector(LoadDataTabbedPage)
