import React, {FC, useContext} from 'react'
import {Form} from '@influxdata/clockface'

import BucketProvider from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'

import BucketSelector from 'src/flows/shared/BucketSelector'
import {Bucket} from 'src/types'

const BucketInterface: FC = () => {
  const {data, update} = useContext(PipeContext)
  const updateBucket = (bucket: Bucket) => {
    update({
      endpointData: {
        ...data.endpointData,
        bucket,
      },
    })
  }

  return (
    <BucketProvider>
      <Form.Element label="Output Bucket" required={true}>
        <BucketSelector
          selected={data.endpointData.bucket}
          onSelect={updateBucket}
        />
      </Form.Element>
    </BucketProvider>
  )
}

export default BucketInterface
