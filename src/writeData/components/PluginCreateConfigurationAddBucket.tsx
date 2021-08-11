// Libraries
import React, {FC} from 'react'

// Components
import {CreateBucketForm} from 'src/buckets/components/CreateBucketForm'

// Types
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

export const PluginCreateConfigurationAddBucket: FC<PluginCreateConfigurationStepProps> = props => {
  console.log('PluginCreateConfigurationAddBucket: props', props)
  const {currentStepIndex, onSetSubstepIndex} = props
  return (
    <CreateBucketForm
      onClose={() => {
        onSetSubstepIndex(currentStepIndex, 0)
      }}
    />
  )
}
