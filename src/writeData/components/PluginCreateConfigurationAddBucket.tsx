// Libraries
import React, {FC} from 'react'
import {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {CreateBucketForm} from 'src/buckets/components/CreateBucketForm'

// Actions
import {setBucketInfo} from 'src/dataLoaders/actions/steps'
import {setOverlayParams} from 'src/overlays/actions/overlays'

// Types
import {AppState, Bucket} from 'src/types'
import {PluginCreateConfigurationStepProps} from 'src/writeData/components/PluginCreateConfigurationWizard'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & PluginCreateConfigurationStepProps

const nullParams = {}

const PluginCreateConfigurationAddBucketComponent: FC<Props> = props => {
  const {
    currentStepIndex,
    onSetBucketInfo,
    onSetSubstepIndex,
    overlayParams,
    setBucketOverlayParams,
  } = props

  useEffect(() => {
    setBucketOverlayParams({
      onUpdateBucket: (bucket: Bucket) => {
        const {orgID, id, name} = bucket
        onSetBucketInfo(orgID, name, id)
      },
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent the "Create Bucket" form from rendering twice
  //   which in turn prevents the form from attempting validation
  //   before the user has had a chance to even interact with it
  if (typeof overlayParams?.onUpdateBucket !== 'function') {
    return null
  }

  return (
    <CreateBucketForm
      onClose={() => {
        onSetSubstepIndex(currentStepIndex, 0)
        setBucketOverlayParams(nullParams)
      }}
    />
  )
}

const mstp = (state: AppState) => {
  const overlayParams = getOverlayParams(state)
  return {
    overlayParams,
  }
}

const mdtp = {
  onSetBucketInfo: setBucketInfo,
  setBucketOverlayParams: setOverlayParams,
}

const connector = connect(mstp, mdtp)

export const PluginCreateConfigurationAddBucket = connector(
  PluginCreateConfigurationAddBucketComponent
)
