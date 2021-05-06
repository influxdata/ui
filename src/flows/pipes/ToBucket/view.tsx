// Libraries
import React, {FC} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'

const ToBucket: FC<PipeProp> = ({Context}) => (
  <BucketProvider>
    <Context>
      <div className="data-source--controls">
        <BucketSelector />
      </div>
    </Context>
  </BucketProvider>
)

export default ToBucket
