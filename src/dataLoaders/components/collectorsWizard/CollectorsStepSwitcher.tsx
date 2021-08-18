// Libraries
import React, {PureComponent} from 'react'

// Components
import SelectCollectorsStep from 'src/dataLoaders/components/collectorsWizard/select/SelectCollectorsStep'
import SelectCollectorsStep2 from 'src/dataLoaders/components/collectorsWizard/select/SelectCollectorsStep2'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import PluginConfigSwitcher from 'src/dataLoaders/components/collectorsWizard/configure/PluginConfigSwitcher'
import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {CollectorsStep} from 'src/types/dataLoaders'
import {CollectorsStepProps} from 'src/dataLoaders/components/collectorsWizard/CollectorsWizard'

interface Props {
  stepProps: CollectorsStepProps
}

@ErrorHandling
class StepSwitcher extends PureComponent<Props> {
  public render() {
    const {stepProps} = this.props
    let selector
    if (isFlagEnabled('telegrafUiRefresh')) {
      selector = <SelectCollectorsStep2 {...stepProps} />
    } else {
      selector = <SelectCollectorsStep {...stepProps} />
    }

    switch (stepProps.currentStepIndex) {
      case CollectorsStep.Select:
        return selector
      case CollectorsStep.Configure:
        return <PluginConfigSwitcher />
      case CollectorsStep.Verify:
        return <VerifyCollectorsStep {...stepProps} />
      default:
        return <div />
    }
  }
}

export default StepSwitcher
