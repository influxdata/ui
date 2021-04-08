// Libraries
import React, {FC, useContext} from 'react'
// Types
import {PipeProp} from 'src/types/flows'
import {Bucket} from 'src/types'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {SchemaProvider} from 'src/flows/pipes/MetricSelector/context'
import {PipeContext} from 'src/flows/context/pipe'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'
import FieldsList from 'src/flows/pipes/MetricSelector/FieldsList'
import FilterTags from 'src/flows/pipes/MetricSelector/FilterTags'
import SearchBar from 'src/flows/pipes/MetricSelector/SearchBar'

const DataSource: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const updateBucket = (bucket: Bucket) => {
    update({
      bucket,
    })
  }

  return (
    <BucketProvider>
      <SchemaProvider>
        <Context>
          <div className="data-source--controls">
            <div className="data-source--bucket">
              <BucketSelector
                selected={data.bucket}
                onSelect={updateBucket}
                style={{width: '250px', flex: '0 0 250px'}}
              />
            </div>
            <FilterTags />
          </div>
          <SearchBar />
          <FieldsList />
        </Context>
      </SchemaProvider>
    </BucketProvider>
  )
}

export default DataSource
