// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import {CreateBucketForm} from 'src/buckets/components/CreateBucketForm/CreateBucketForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Constants
import {BUCKET_OVERLAY_WIDTH} from 'src/buckets/constants'

const CreateBucketOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  return (
    <Overlay.Container maxWidth={BUCKET_OVERLAY_WIDTH}>
      <Overlay.Header title="Create Bucket" onDismiss={onClose} />
      <Overlay.Body>
        <CreateBucketForm onClose={onClose} />
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default CreateBucketOverlay
