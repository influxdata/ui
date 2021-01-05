// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page, Form, CTAButton, ButtonType} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {FITBIT_CLIENT_ID} from 'src/shared/constants'

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
            <h1>
              Would you like to allow us to access your fitbit information?
            </h1>
            <CTAButton text="Authorize" type={ButtonType.Submit} />
          </Form>
        </Page.Contents>
      </Page>
    )
  }

  private handleSubmit = () => {
    window.location.href = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${FITBIT_CLIENT_ID}&redirect_uri=https%3A%2F%2Fkubernetes.docker.internal%3A8080%2Ffitbit-api-callback&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800`
  }
}

export default FitbitPage
