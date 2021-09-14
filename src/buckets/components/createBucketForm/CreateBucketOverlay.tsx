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
  const {onClose} = useContext(OverlayContext)
  return (
    <Overlay.Container maxWidth={getBucketOverlayWidth()}>
      <Overlay.Header title="Create Bucket" onDismiss={onClose} />
      <CreateBucketForm onClose={onClose} />
    </Overlay.Container>
  )
}

export default CreateBucketOverlay
