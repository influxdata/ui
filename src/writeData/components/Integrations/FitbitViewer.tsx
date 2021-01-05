// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page, Form, CTAButton, ButtonType} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
// import {FITBIT_CLIENT_ID, FITBIT_REDIRECT_URI} from 'src/shared/constants'

@ErrorHandling
class FitbitPage extends PureComponent {
  public render() {
    return (
      <Page titleTag={pageTitleSuffixer(['Fitbit', 'Load Data'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title="Fitbit" />
        </Page.Header>
        <Page.Contents fullWidth={false} scrollable={true}>
          <Form onSubmit={this.handleSubmit}>
            <h1> Whatcha wanna look at? </h1>
            <CTAButton text="Lookit" type={ButtonType.Submit} />
          </Form>
        </Page.Contents>
      </Page>
    )
  }

  private handleSubmit = () => {
    console.log('submittin')
  }
}

export default FitbitPage
