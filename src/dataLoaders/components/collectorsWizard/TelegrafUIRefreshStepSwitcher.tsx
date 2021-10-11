// Libraries
import React, {PureComponent} from 'react'

// Components
import TelegrafUIRefreshCollectors from 'src/dataLoaders/components/collectorsWizard/select/TelegrafUIRefreshCollectorsStep'
import {CreateBucket} from 'src/writeData/components/PluginCreateConfiguration/CreateBucket'
import {Customize} from 'src/writeData/components/PluginCreateConfiguration/Customize'

import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {CollectorsStep} from 'src/types/dataLoaders'
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

interface Props {
  stepProps: PluginConfigurationStepProps
}

@ErrorHandling
class StepSwitcher extends PureComponent<Props> {
  public render() {
    const {stepProps} = this.props

    switch (stepProps.currentStepIndex) {
      case CollectorsStep.Select:
        if (stepProps.substepIndex === 1) {
          return <CreateBucket {...stepProps} />
        }
        return <TelegrafUIRefreshCollectors {...stepProps} />
      case CollectorsStep.Configure:
        return <Customize {...stepProps} />
      case CollectorsStep.Verify:
        return <VerifyCollectorsStep {...stepProps} />
      default:
        return <div />
    }
  }
}

export default StepSwitcher
