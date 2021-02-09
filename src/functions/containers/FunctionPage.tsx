// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

class FunctionPage extends PureComponent {
  public render(): JSX.Element {
    return (
      <>
        <Page titleTag={pageTitleSuffixer(['New Function'])}>
          <Page.Contents fullWidth={false} scrollable={true}></Page.Contents>
        </Page>
      </>
    )
  }
}

export default FunctionPage
