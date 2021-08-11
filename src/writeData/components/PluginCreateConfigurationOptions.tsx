// Libraries
import React, {ChangeEvent, FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  Form,
  Input,
  InputType,
  Overlay,
} from '@influxdata/clockface'
import BucketDropdown from 'src/dataLoaders/components/BucketsDropdown'

// Actions
import {setBucketInfo} from 'src/dataLoaders/actions/steps'
import {setTelegrafConfigName} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getDataLoaders} from 'src/dataLoaders/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const CREATE_A_BUCKET_ID = 'CREATE A BUCKET'

const PluginCreateConfigurationOptionsComponent: FC<Props> = props => {
  const {
    bucket,
    buckets,
    currentStepIndex,
    onExit,
    onIncrementCurrentStepIndex,
    onSetBucketInfo,
    onSetSubstepIndex,
    onSetTelegrafConfigName,
    telegrafConfigName,
  } = props

  console.log('~~~ buckets:', buckets)
  let selectedBucket = buckets.find(b => b.name === bucket)

  if (!selectedBucket) {
    selectedBucket = buckets[buckets.length - 1]
    const {orgID, id, name} = selectedBucket
    onSetBucketInfo(orgID, name, id)
  }

  const selectedBucketID = selectedBucket.id

  const handleNameInput = (event: ChangeEvent<HTMLInputElement>) => {
    onSetTelegrafConfigName(event.target.value)
  }

  const handleSelectBucket = (bucket: Bucket) => {
    console.log('handleSelectBucket: bucket', bucket)
    const {orgID, id, name} = bucket

    if (id === CREATE_A_BUCKET_ID) {
      onSetSubstepIndex(currentStepIndex, 1)
    } else {
      onSetBucketInfo(orgID, name, id)
    }
  }

  return (
    <>
      <Form.Element label="Agent Name">
        <Input
          type={InputType.Text}
          value={telegrafConfigName}
          name="name"
          onChange={handleNameInput}
          titleText="Agent Name"
          size={ComponentSize.Medium}
          autoFocus={true}
        />
      </Form.Element>
      <Form.Element label="Output Bucket">
        <BucketDropdown
          selectedBucketID={selectedBucketID}
          buckets={[
            {id: CREATE_A_BUCKET_ID, name: '+ Create A Bucket'} as Bucket,
            ...buckets,
          ]}
          onSelectBucket={handleSelectBucket}
        />
      </Form.Element>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Default}
          onClick={onExit}
          tabIndex={1}
          testID="plugin-create-configuration-cancel"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Primary}
          onClick={onIncrementCurrentStepIndex}
          tabIndex={0}
          testID="plugin-create-configuration-continue-configuring"
          text="Continue Configuring"
        />
      </Overlay.Footer>
    </>
  )
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      steps: {bucket},
    },
  } = state

  const {telegrafConfigName} = getDataLoaders(state)

  const buckets = getAll<Bucket>(state, ResourceType.Buckets)

  const nonSystemBuckets = buckets.filter(
    bucket => !isSystemBucket(bucket.name)
  )

  console.log('~~~ state', state)
  return {
    bucket,
    buckets: nonSystemBuckets,
    telegrafConfigName,
  }
}

const mdtp = {
  onSetBucketInfo: setBucketInfo,
  onSetTelegrafConfigName: setTelegrafConfigName,
}

const connector = connect(mstp, mdtp)

export const PluginCreateConfigurationOptions = connector(
  PluginCreateConfigurationOptionsComponent
)
