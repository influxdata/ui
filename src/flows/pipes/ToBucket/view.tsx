// Libraries
import React, {FC, useContext} from 'react'

// Types
import {PipeProp} from 'src/types/flows'
import {Bucket} from 'src/types'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'
import ExportTaskButton from 'src/flows/pipes/ToBucket/ExportTaskButton'

const ToBucket: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const updateBucket = (bucket: Bucket) => {
    update({
      bucket,
    })
  }
  return (
    <BucketProvider>
      <Context persistentControl={<ExportTaskButton />}>
        <div className="data-source--controls">
          <BucketSelector
            selected={data.bucket}
            onSelect={updateBucket}
            style={{width: '250px', flex: '0 0 250px'}}
          />
        </div>
      </Context>
    </BucketProvider>
  )
}

export default ToBucket
