// Libraries
import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FunctionListPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Functions'])}>
      <Page.Header fullWidth={false} testID="functions-list-page--header">
        <Page.Title title="Functions List" />
      </Page.Header>
      <Page.Contents fullWidth={false} scrollable={true}></Page.Contents>
    </Page>
  )
}

export default FunctionListPage
