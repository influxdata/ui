// Libraries
import React, {ChangeEvent, FC, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {ComponentSize, Form, Input, InputType} from '@influxdata/clockface'
import BucketDropdown from 'src/dataLoaders/components/BucketsDropdown'

// Actions
import {setBucketInfo} from 'src/dataLoaders/actions/steps'
import {
  setTelegrafConfigDescription,
  setTelegrafConfigName,
} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState, Bucket} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getAllBuckets} from 'src/resources/selectors'
import {getDataLoaders} from 'src/dataLoaders/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginCreateConfigurationStepProps & ReduxProps

const CREATE_A_BUCKET_ID = 'create-a-bucket'

const createBucketOption = {
  id: CREATE_A_BUCKET_ID,
  name: '+ Create A Bucket',
}

const PluginCreateConfigurationOptionsComponent: FC<Props> = props => {
  const {
    bucketID,
    buckets,
    currentStepIndex,
    onSetSubstepIndex,
    setBucketInfo,
    setIsValidConfiguration,
    setTelegrafConfigName,
    telegrafConfigName,
  } = props
  const [isExistingBucket, setIsExistingBucket] = useState<boolean>(true)
  const [sortedBuckets, setSortedBuckets] = useState<Array<Bucket>>([
    createBucketOption as Bucket,
    ...buckets,
  ])
  const [selectedBucket, setSelectedBucket] = useState<Bucket>(null)

  useEffect(() => {
    /* Sort only when:
     * - not on the first render because buckets start as sorted on mount
     * - not an existing bucket selected by the user
     * - a new bucket is successfully created by an API call
     */
    if (isExistingBucket === false) {
      const nonSystemBuckets = buckets.filter(
        bucket => !isSystemBucket(bucket.name)
      )
      setSortedBuckets([
        createBucketOption as Bucket,
        ...nonSystemBuckets.sort((firstBucket, secondBucket) => {
          if (
            firstBucket.name.toLocaleLowerCase() >
            secondBucket.name.toLocaleLowerCase()
          ) {
            return 1
          }
          if (
            firstBucket.name.toLocaleLowerCase() <
            secondBucket.name.toLocaleLowerCase()
          ) {
            return -1
          }
          return 0
        }),
      ])
    }
    setIsExistingBucket(false) // get ready for an API call

    // Always set the selected bucket whenever the bucketID changes
    setSelectedBucket(buckets.find(bucket => bucket.id === bucketID))
  }, [bucketID]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedBucket) {
      setIsValidConfiguration(false)
    } else {
      setIsValidConfiguration(true)
    }
  })

  const handleNameInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTelegrafConfigName(event.target.value)
  }

  const handleSelectBucket = (bucket: Bucket) => {
    const {orgID, name, id} = bucket

    setIsValidConfiguration(true)
    if (id === CREATE_A_BUCKET_ID) {
      onSetSubstepIndex(currentStepIndex, 1)
    } else {
      setBucketInfo(orgID, name, id)
      setIsExistingBucket(true) // user selected an existing bucket, so prevent sorting
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
          testID="plugin-create-configuration-options-input--name"
        />
      </Form.Element>
      <Form.Element label="Output Bucket">
        <BucketDropdown
          selectedBucketID={selectedBucket?.id}
          buckets={sortedBuckets}
          emptyOriginal={!selectedBucket}
          onSelectBucket={handleSelectBucket}
          testID="plugin-create-configuration-options--select-bucket"
        />
      </Form.Element>
    </>
  )
}

const mstp = (state: AppState) => {
  const {
    dataLoading: {
      steps: {bucketID},
    },
  } = state

  const {telegrafConfigName} = getDataLoaders(state)

  const buckets = getAllBuckets(state)

  return {
    bucketID,
    buckets,
    telegrafConfigName,
  }
}

const mdtp = {
  setBucketInfo,
  setTelegrafConfigDescription,
  setTelegrafConfigName,
}

const connector = connect(mstp, mdtp)

export const PluginCreateConfigurationOptions = connector(
  PluginCreateConfigurationOptionsComponent
)
