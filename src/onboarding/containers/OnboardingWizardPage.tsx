// Libraries
import React, {ReactElement, PureComponent} from 'react'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// APIs
import {client} from 'src/utils/api'

// Components
import {
  Button,
  EmptyState,
  AppWrapper,
  TechnoSpinner,
  SpinnerContainer,
} from '@influxdata/clockface'
import {WizardFullScreen} from 'src/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import OnboardingWizard from 'src/onboarding/containers/OnboardingWizard'
import Notifications from 'src/shared/components/notifications/Notifications'

// Types
import {ComponentColor, ComponentSize} from '@influxdata/clockface'
import {RemoteDataState, AppState} from 'src/types'
import {Links} from 'src/types/links'

interface State {
  loading: RemoteDataState
  isSetupComplete: boolean
}

interface PassedProps {
  children: ReactElement<any>
}

interface ConnectedStateProps {
  links: Links
}

type Props = PassedProps &
  RouteComponentProps<{stepID: string}> &
  ConnectedStateProps

@ErrorHandling
export class OnboardingWizardPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loading: RemoteDataState.NotStarted,
      isSetupComplete: false,
    }
  }

  public async componentDidMount() {
    this.setState({loading: RemoteDataState.Loading})
    try {
      const {allowed} = await client.setup.status()
      if (!allowed) {
        this.setState({isSetupComplete: true})
      }
      this.setState({loading: RemoteDataState.Done})
    } catch (error) {
      console.error(error)
      this.setState({loading: RemoteDataState.Error})
    }
  }

  public render() {
    const {match} = this.props
    const {isSetupComplete} = this.state

    if (isSetupComplete) {
      return (
        <SpinnerContainer
          loading={this.state.loading}
          spinnerComponent={<TechnoSpinner />}
        >
          <WizardFullScreen>
            <div className="wizard-contents">
              <div className="wizard-step--container">
                <EmptyState size={ComponentSize.Large}>
                  <EmptyState.Text>
                    <b>Initial User</b> is already set up, nothing to see here
                    folks!
                  </EmptyState.Text>
                  <Button
                    text="Return to Home Page"
                    onClick={this.redirectToHome}
                    color={ComponentColor.Primary}
                  />
                </EmptyState>
              </div>
            </div>
          </WizardFullScreen>
        </SpinnerContainer>
      )
    }

    return (
      <AppWrapper>
        <SpinnerContainer
          loading={this.state.loading}
          spinnerComponent={<TechnoSpinner />}
        >
          <Notifications />
          <OnboardingWizard
            onDecrementCurrentStepIndex={this.handleDecrementStepIndex}
            onIncrementCurrentStepIndex={this.handleIncrementStepIndex}
            onSetCurrentStepIndex={this.setStepIndex}
            currentStepIndex={+match.params.stepID}
            onCompleteSetup={this.handleCompleteSetup}
          />
        </SpinnerContainer>
      </AppWrapper>
    )
  }

  public handleCompleteSetup = () => {
    this.setState({isSetupComplete: true})
  }

  private redirectToHome = () => {
    this.props.history.push('/')
  }

  private handleDecrementStepIndex = () => {
    const {
      match: {
        params: {stepID},
      },
    } = this.props

    this.setStepIndex(+stepID - 1)
  }

  private handleIncrementStepIndex = () => {
    const {
      match: {
        params: {stepID},
      },
    } = this.props

    this.setStepIndex(+stepID + 1)
  }

  private setStepIndex = (index: number) => {
    const {history} = this.props

    history.replace(`/onboarding/${index}`)
  }
}

const mstp = ({links}: AppState) => ({links})

export default connect<ConnectedStateProps, null, PassedProps>(
  mstp,
  null
)(withRouter(OnboardingWizardPage))
