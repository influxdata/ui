// Libraries
import React, {FC} from 'react'

// Types
import {PluginCreateConfigurationStep} from 'src/types/dataLoaders'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Components
import {PluginCreateConfigurationOptions} from 'src/writeData/components/PluginCreateConfigurationOptions'
import {PluginCreateConfigurationAddBucket} from 'src/writeData/components/PluginCreateConfigurationAddBucket'
import {PluginCreateConfigurationCustomize} from 'src/writeData/components/PluginCreateConfigurationCustomize'
import VerifyCollectorsStep from 'src/dataLoaders/components/collectorsWizard/verify/VerifyCollectorsStep'

interface Props {
  stepProps: PluginCreateConfigurationStepProps
}

const StepSwitcher: FC<Props> = props => {
  const {stepProps} = props

  switch (stepProps.currentStepIndex) {
    case PluginCreateConfigurationStep.Configure:
      if (stepProps.substepIndex === 1) {
        return <PluginCreateConfigurationAddBucket {...stepProps} />
      } else {
        return <PluginCreateConfigurationOptions {...stepProps} />
      }
    case PluginCreateConfigurationStep.Customize:
      return <PluginCreateConfigurationCustomize {...stepProps} />
    case PluginCreateConfigurationStep.Verify:
      return <VerifyCollectorsStep {...stepProps} />
    default:
      return <div />
  }
}

export default StepSwitcher
