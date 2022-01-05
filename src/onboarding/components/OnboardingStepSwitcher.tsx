// Libraries
import React, {PureComponent} from 'react'

// Components
import InitStep from 'src/onboarding/components/InitStep'
import AdminStep from 'src/onboarding/components/AdminStep'
import CompletionStep from 'src/onboarding/components/CompletionStep'
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {OnboardingRequest} from 'src/client'
import {OnboardingStepProps} from 'src/onboarding/containers/OnboardingWizard'

interface Props {
  onboardingStepProps: OnboardingStepProps
  setupParams: OnboardingRequest
  currentStepIndex: number
  onSetupAdmin: any
  orgID: string
  bucketID: string
}

@ErrorHandling
class OnboardingStepSwitcher extends PureComponent<Props> {
  public render() {
    const {
      currentStepIndex,
      orgID,
      bucketID,
      onboardingStepProps,
      onSetupAdmin,
    } = this.props

    switch (currentStepIndex) {
      case 0:
        return <InitStep {...onboardingStepProps} />
      case 1:
        return (
          <AdminStep {...onboardingStepProps} onSetupAdmin={onSetupAdmin} />
        )
      case 2:
        return (
          <CompletionStep
            {...onboardingStepProps}
            orgID={orgID}
            bucketID={bucketID}
          />
        )
      default:
        return <div />
    }
  }
}

export default OnboardingStepSwitcher
