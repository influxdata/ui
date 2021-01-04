// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {FITBIT_CLIENT_SECRET} from 'src/shared/constants'

@ErrorHandling
class FitbitPage extends PureComponent {

  public render() {
    return (
      <Page titleTag={pageTitleSuffixer(["Fitbit", 'Load Data'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title="Fitbit" />
        </Page.Header>
        <Page.Contents fullWidth={false} scrollable={true}>
            <h1>Im a form {FITBIT_CLIENT_SECRET}</h1>
        </Page.Contents>
      </Page>
    )
  }
}

export default FitbitPage
