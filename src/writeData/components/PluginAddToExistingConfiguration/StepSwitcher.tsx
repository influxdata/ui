// Libraries
import React, {FC} from 'react'

// Types
import {PluginConfigurationStep} from 'src/types/dataLoaders'
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Components
import {Configure} from 'src/writeData/components/PluginAddToExistingConfiguration/Configure'
import {Customize} from 'src/writeData/components/PluginAddToExistingConfiguration/Customize'
import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'

interface Props {
  stepProps: PluginConfigurationStepProps
}

const StepSwitcher: FC<Props> = props => {
  const {stepProps} = props

  switch (stepProps.currentStepIndex) {
    case PluginConfigurationStep.Configure:
      return <Configure {...stepProps} />
    case PluginConfigurationStep.Customize:
      return <Customize {...stepProps} />
    case PluginConfigurationStep.Verify:
      return <VerifyCollectorsStep {...stepProps} />
    default:
      return <div />
  }
}

export default StepSwitcher
