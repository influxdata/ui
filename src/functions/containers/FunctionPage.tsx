// Libraries
import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FunctionPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['New Function'])}>
      <Page.Header fullWidth={false} testID="function-page--header">
        <Page.Title title="New Function" />
      </Page.Header>
      <Page.Contents fullWidth={false} scrollable={true}></Page.Contents>
    </Page>
  )
}

export default FunctionPage
