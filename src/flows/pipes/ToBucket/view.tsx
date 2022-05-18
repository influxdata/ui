// Libraries
import React, {FC, useContext} from 'react'

// Types
import {Bucket} from 'src/types'

// Contexts
import {BucketProvider} from 'src/shared/contexts/buckets'
import {PipeContext} from 'src/flows/context/pipe'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ToBucket: FC = () => {
  const {data, update, scope} = useContext(PipeContext)
  const updateBucket = (bucket: Bucket) => {
    event('Updated Bucket', {context: 'to bucket'})
    update({bucket})
  }

  return (
    <BucketProvider scope={scope}>
      <div className="data-source--controls">
        <BucketSelector
          selected={data.bucket}
          onSelect={updateBucket}
          style={{width: '250px', flex: '0 0 250px'}}
        />
      </div>
    </BucketProvider>
  )
}

export default ({Context}) => (
  <Context>
    <ToBucket />
  </Context>
)
