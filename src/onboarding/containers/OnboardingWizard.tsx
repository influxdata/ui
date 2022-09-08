// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {
  WizardFullScreen,
  WizardProgressHeader,
  ProgressBar,
} from 'src/clockface'
import OnboardingStepSwitcher from 'src/onboarding/components/OnboardingStepSwitcher'

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'
import {setSetupParams, setStepStatus, setupAdmin} from 'src/onboarding/actions'

// Constants
import {StepStatus} from 'src/clockface/constants/wizard'

// Types
import {OnboardingRequest} from 'src/client'
import {AppState} from 'src/types'

export interface OnboardingStepProps {
  currentStepIndex: number
  onSetCurrentStepIndex: (stepNumber: number) => void
  onIncrementCurrentStepIndex: () => void
  onDecrementCurrentStepIndex: () => void
  onSetStepStatus: (index: number, status: StepStatus) => void
  stepStatuses: StepStatus[]
  stepTitles: string[]
  stepTestIds: string[]
  setupParams: OnboardingRequest
  handleSetSetupParams: (setupParams: OnboardingRequest) => void
  notify: typeof notifyAction
  onCompleteSetup: () => void
  onExit: () => void
}

interface OwnProps {
  startStep?: number
  stepStatuses?: StepStatus[]
  onCompleteSetup: () => void
  currentStepIndex: number
  onIncrementCurrentStepIndex: () => void
  onDecrementCurrentStepIndex: () => void
  onSetCurrentStepIndex: (stepNumber: number) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps

@ErrorHandling
class OnboardingWizard extends PureComponent<Props> {
  public stepTitles = ['Welcome', 'Initial User Setup', 'Complete']
  public stepTestIds = [
    'nav-step--welcome',
    'nav-step--setup',
    'nav-step--complete',
  ]

  public stepSkippable = [true, false, false]

  constructor(props: Props) {
    super(props)
  }

  public render() {
    const {currentStepIndex, orgID, bucketID, setupParams, onSetupAdmin} =
      this.props

    return (
      <WizardFullScreen>
        {this.progressHeader}
        <div className="wizard-contents">
          <div className="wizard-step--container">
            <OnboardingStepSwitcher
              currentStepIndex={currentStepIndex}
              onboardingStepProps={this.onboardingStepProps}
              setupParams={setupParams}
              onSetupAdmin={onSetupAdmin}
              orgID={orgID}
              bucketID={bucketID}
            />
          </div>
        </div>
      </WizardFullScreen>
    )
  }

  private get progressHeader(): JSX.Element {
    const {stepStatuses, currentStepIndex, onSetCurrentStepIndex} = this.props

    if (currentStepIndex === 0) {
      return <div className="wizard--progress-header hidden" />
    }

    return (
      <WizardProgressHeader>
        <ProgressBar
          currentStepIndex={currentStepIndex}
          handleSetCurrentStep={onSetCurrentStepIndex}
          stepStatuses={stepStatuses}
          stepTitles={this.stepTitles}
          stepTestIds={this.stepTestIds}
          stepSkippable={this.stepSkippable}
        />
      </WizardProgressHeader>
    )
  }

  private handleExit = () => {
    const {history, onCompleteSetup} = this.props
    onCompleteSetup()
    history.push('/')
  }

  private get onboardingStepProps(): OnboardingStepProps {
    const {
      stepStatuses,
      notify,
      onCompleteSetup,
      setupParams,
      currentStepIndex,
      onSetStepStatus,
      onSetSetupParams,
      onSetCurrentStepIndex,
      onDecrementCurrentStepIndex,
      onIncrementCurrentStepIndex,
    } = this.props

    return {
      stepStatuses,
      stepTitles: this.stepTitles,
      stepTestIds: this.stepTestIds,
      currentStepIndex,
      onSetCurrentStepIndex,
      onIncrementCurrentStepIndex,
      onDecrementCurrentStepIndex,
      onSetStepStatus,
      setupParams,
      handleSetSetupParams: onSetSetupParams,
      notify,
      onCompleteSetup,
      onExit: this.handleExit,
    }
  }
}

const mstp = ({
  onboarding: {stepStatuses, setupParams, orgID, bucketID},
}: AppState) => ({
  stepStatuses,
  setupParams,
  orgID,
  bucketID,
})

const mdtp = {
  notify: notifyAction,
  onSetSetupParams: setSetupParams,
  onSetStepStatus: setStepStatus,
  onSetupAdmin: setupAdmin,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(OnboardingWizard))
