// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

class FunctionsPage extends PureComponent {
  public render(): JSX.Element {
    return (
      <>
        <Page titleTag={pageTitleSuffixer(['Functions'])}>
          <Page.Header fullWidth={false} testID="functions-page--header">
            <Page.Title title="Functions" />
          </Page.Header>
          <Page.Contents fullWidth={false} scrollable={true}></Page.Contents>
        </Page>
      </>
    )
  }
}

export default FunctionsPage
