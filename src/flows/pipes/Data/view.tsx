// Libraries
import React, {FC} from 'react'
// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'

// Components
import AggregateWindowSelector from 'src/flows/pipes/Data/AggregateWindowSelector'
import BucketSelector from 'src/flows/pipes/Data/BucketSelector'
import FieldsList from 'src/flows/pipes/Data/FieldsList'
import SearchBar from 'src/flows/pipes/Data/SearchBar'

// Styles
import 'src/flows/pipes/Query/style.scss'
import {SchemaProvider} from 'src/flows/context/schemaProvider'
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
