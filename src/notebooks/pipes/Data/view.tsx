// Libraries
import React, {FC} from 'react'
// Types
import {PipeProp} from 'src/notebooks'

// Contexts
import BucketProvider from 'src/notebooks/context/buckets'

// Components
import AggregateWindowSelector from 'src/notebooks/pipes/Data/AggregateWindowSelector'
import BucketSelector from 'src/notebooks/pipes/Data/BucketSelector'
import FieldsList from 'src/notebooks/pipes/Data/FieldsList'
import SearchBar from 'src/notebooks/pipes/Data/SearchBar'

// Styles
import 'src/notebooks/pipes/Query/style.scss'
import {SchemaProvider} from 'src/notebooks/context/schemaProvider'
import FilterTags from './FilterTags'

const DataSource: FC<PipeProp> = ({Context}) => (
  <BucketProvider>
    <SchemaProvider>
      <Context>
        <div className="data-source--controls">
          <BucketSelector />
          <FilterTags />
          <AggregateWindowSelector />
        </div>
        <SearchBar />
        <FieldsList />
      </Context>
    </SchemaProvider>
  </BucketProvider>
)

export default DataSource
