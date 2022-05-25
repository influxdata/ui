// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import {CreateBucketForm} from 'src/buckets/components/createBucketForm/CreateBucketForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Constants
import {getBucketOverlayWidth} from 'src/buckets/constants'

const CreateBucketOverlay: FC = () => {
  const {onClose, params} = useContext(OverlayContext)
  const useSimplifiedBucketForm = params?.useSimplifiedBucketForm
  const callbackAfterBucketCreation = params?.callbackAfterBucketCreation

  return (
    <Overlay.Container maxWidth={getBucketOverlayWidth()}>
      <Overlay.Header title="Create Bucket" onDismiss={onClose} />
      <CreateBucketForm
        onClose={onClose}
        useSimplifiedBucketForm={useSimplifiedBucketForm}
        callbackAfterBucketCreation={callbackAfterBucketCreation}
      />
    </Overlay.Container>
  )
}

export default CreateBucketOverlay
