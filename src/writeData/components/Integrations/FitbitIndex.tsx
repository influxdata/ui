// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  Page,
  Form,
  Input,
  FormElement,
  CTAButton,
  InputType,
  ButtonType,
} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {ComponentStatus} from 'src/clockface'
// import {FITBIT_CLIENT_SECRET} from 'src/shared/constants'

type Status = 'pending' | 'saved' | 'authorized'
interface State {
  secret: string
  id: string
  status: Status
}

@ErrorHandling
class FitbitPage extends PureComponent<null, State> {
  constructor(props) {
    super(props)

    this.state = {
      secret: '',
      id: '',
      status: 'pending',
    }
  }

  public render() {
    const {secret, id, status} = this.state

    const inputStatus =
      status === 'pending' ? ComponentStatus.Default : ComponentStatus.Disabled
    const buttonText = status === 'pending' ? 'Submit' : 'Authorize Me'

    return (
      <Page titleTag={pageTitleSuffixer(['Fitbit', 'Load Data'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title="Fitbit" />
        </Page.Header>
        <Page.Contents fullWidth={false} scrollable={true}>
          <Form onSubmit={this.handleSubmit}>
            <h1>Enter Your Fitbit Client Information</h1>
            <h3>Hack for Easy Access</h3>
            <FormElement label="Client Secret">
              <Input
                value={secret}
                onChange={this.handleChangeSecret}
                type={InputType.Password}
                status={inputStatus}
              />
            </FormElement>
            <FormElement label="Client ID">
              <Input
                value={id}
                onChange={this.handleChangeId}
                type={InputType.Password}
                status={inputStatus}
              />
            </FormElement>
            <CTAButton text={buttonText} type={ButtonType.Submit} />
          </Form>
        </Page.Contents>
      </Page>
    )
  }

  private handleSubmit = () => {
    const {id} = this.state

    console.log(id)

    window.location.href = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${id}&redirect_uri=https%3A%2F%2Fkubernetes.docker.internal%3A8448%2Ffitbit-api-callback&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800`
  }

  private handleChangeSecret = e => {
    this.setState({secret: e.target.value})
  }

  private handleChangeId = e => {
    this.setState({id: e.target.value})
  }
}

export default FitbitPage
