// Libraries
import React, {FC, useContext} from 'react'

// Types
import {PipeProp} from 'src/types/flows'
import {Bucket} from 'src/types'

// Contexts
import {BucketProvider} from 'src/shared/contexts/buckets'
import {SchemaProvider} from 'src/flows/pipes/MetricSelector/context'
import {PipeContext} from 'src/flows/context/pipe'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'
import FieldsList from 'src/flows/pipes/MetricSelector/FieldsList'
import FilterTags from 'src/flows/pipes/MetricSelector/FilterTags'
import SearchBar from 'src/flows/pipes/MetricSelector/SearchBar'
import {PIPE_DEFINITIONS} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

const DataSource: FC<PipeProp> = ({Context}) => {
  const {data, update, scope} = useContext(PipeContext)

  const updateBucket = (bucket: Bucket) => {
    if (bucket?.id === data.bucket?.id) {
      return
    }
    event('Updated Bucket', {context: 'metric selector'})
    update({
      bucket,
      ...PIPE_DEFINITIONS['metricSelector'].initial,
    })
  }

  return (
    <BucketProvider scope={scope}>
      <SchemaProvider>
        <Context resizes>
          <div className="data-source">
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
          </div>
        </Context>
      </SchemaProvider>
    </BucketProvider>
  )
}

export default DataSource
