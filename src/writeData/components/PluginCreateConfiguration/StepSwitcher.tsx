// Libraries
import React, {FC} from 'react'

// Types
import {PluginConfigurationStep} from 'src/types/dataLoaders'
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Components
import {Configure} from 'src/writeData/components/PluginCreateConfiguration/Configure'
import {CreateBucket} from 'src/writeData/components/PluginCreateConfiguration/CreateBucket'
import {Customize} from 'src/writeData/components/PluginCreateConfiguration/Customize'
import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'

interface Props {
  stepProps: PluginConfigurationStepProps
}

const StepSwitcher: FC<Props> = props => {
  const {stepProps} = props

  switch (stepProps.currentStepIndex) {
    case PluginConfigurationStep.Configure:
      if (stepProps.substepIndex === 1) {
        return <CreateBucket {...stepProps} />
      }
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
