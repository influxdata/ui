// Libraries
import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FunctionRunsPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Function Runs'])}>
      <Page.Header fullWidth={false} testID="functions-runs-page--header">
        <Page.Title title="Function Runs" />
      </Page.Header>
      <Page.Contents fullWidth={false} scrollable={true}></Page.Contents>
    </Page>
  )
}

export default FunctionRunsPage
