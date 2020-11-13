// Libraries
import React, {FC} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'
import ExportTaskButton from 'src/flows/pipes/ToBucket/ExportTaskButton'

const ToBucket: FC<PipeProp> = ({Context}) => (
  <BucketProvider>
    <Context persistentControl={<ExportTaskButton />}>
      <div className="data-source--controls">
        <BucketSelector />
      </div>
    </Context>
  </BucketProvider>
)

export default ToBucket
