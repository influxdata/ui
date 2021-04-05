// Libraries
import React, {FC} from 'react'
// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {SchemaProvider} from 'src/flows/pipes/MetricSelector/context'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'
import FieldsList from 'src/flows/pipes/MetricSelector/FieldsList'
import FilterTags from 'src/flows/pipes/MetricSelector/FilterTags'
import SearchBar from 'src/flows/pipes/MetricSelector/SearchBar'

const DataSource: FC<PipeProp> = ({Context}) => (
  <BucketProvider>
    <SchemaProvider>
      <Context>
        <div className="data-source--controls">
          <div className="data-source--bucket">
            <BucketSelector />
          </div>
          <FilterTags />
        </div>
        <SearchBar />
        <FieldsList />
      </Context>
    </SchemaProvider>
  </BucketProvider>
)

export default DataSource
