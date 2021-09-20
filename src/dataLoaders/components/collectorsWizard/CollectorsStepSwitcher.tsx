// Libraries
import React, {PureComponent} from 'react'

// Components
import SelectCollectorsStep from 'src/dataLoaders/components/collectorsWizard/select/SelectCollectorsStep'
import SelectCollectorsStep2 from 'src/dataLoaders/components/collectorsWizard/select/SelectCollectorsStep2'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import PluginConfigSwitcher from 'src/dataLoaders/components/collectorsWizard/configure/PluginConfigSwitcher'
import PluginCreateConfigurationWizard from 'src/dataLoaders/components/collectorsWizard/verify/PluginConfigSwitcher'

import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {CollectorsStep} from 'src/types/dataLoaders'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

interface Props {
  // stepProps: CollectorsStepProps
  stepProps: PluginCreateConfigurationStepProps
}

@ErrorHandling
class StepSwitcher extends PureComponent<Props> {
  public render() {
    const {stepProps} = this.props
    let selector
    let configure
    if (isFlagEnabled('telegrafUiRefresh')) {
      selector = <SelectCollectorsStep2 {...stepProps} />
      configure = <PluginCreateConfigurationWizard />
    } else {
      selector = <SelectCollectorsStep {...stepProps} />
      configure = <PluginConfigSwitcher />
    }

    switch (stepProps.currentStepIndex) {
      case CollectorsStep.Select:
        return selector
      case CollectorsStep.Configure:
        return configure
      case CollectorsStep.Verify:
        return <VerifyCollectorsStep {...stepProps} />
      default:
        return <div />
    }
  }
}

export default StepSwitcher
