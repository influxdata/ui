// Libraries
import React, {PureComponent} from 'react'

// Components
import SelectCollectorsStep2 from 'src/dataLoaders/components/collectorsWizard/select/SelectCollectorsStep2'
import {PluginCreateConfigurationCustomize} from 'src/writeData/components/PluginCreateConfigurationCustomize'

import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {CollectorsStep} from 'src/types/dataLoaders'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

interface Props {
  stepProps: PluginCreateConfigurationStepProps
}

@ErrorHandling
class StepSwitcher extends PureComponent<Props> {
  public render() {
    const {stepProps} = this.props

    switch (stepProps.currentStepIndex) {
      case CollectorsStep.Select:
        return <SelectCollectorsStep2 {...stepProps} />
      case CollectorsStep.Configure:
        return <PluginCreateConfigurationCustomize {...stepProps} />
      case CollectorsStep.Verify:
        return <VerifyCollectorsStep {...stepProps} />
      default:
        return <div />
    }
  }
}

export default StepSwitcher
