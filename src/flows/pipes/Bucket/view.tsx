// Libraries
import React, {FC} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'

// Components
import BucketSelector from 'src/flows/pipes/Bucket/BucketSelector'
import ExportTaskButton from 'src/flows/components/panel/ExportTaskButton'
// Styles
import 'src/flows/pipes/Query/style.scss'

const BucketSource: FC<PipeProp> = ({Context}) => (
  <BucketProvider>
    <Context persistentControl={<ExportTaskButton />}>
      <div className="data-source--controls">
        <BucketSelector />
      </div>
    </Context>
  </BucketProvider>
)

export default BucketSource
