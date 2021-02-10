// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

class FunctionEditPage extends PureComponent {
  public render(): JSX.Element {
    return (
      <>
        <Page titleTag={pageTitleSuffixer(['Edit Function'])}>
          <Page.Header fullWidth={false} testID="functions-edit-page--header">
            <Page.Title title="Edit Function" />
          </Page.Header>
          <Page.Contents fullWidth={false} scrollable={true}></Page.Contents>
        </Page>
      </>
    )
  }
}

export default FunctionEditPage
