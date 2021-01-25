// Libraries
import React, {FC} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {SchemaProvider} from 'src/flows/context/schemaProvider'

// Components
import AddButton from 'src/flows/pipes/QueryBuilder/AddButton'

const QueryBuilder: FC<PipeProp> = ({Context}) => {
    return (
  <BucketProvider>
    <SchemaProvider>
      <Context>
      <div className="query-builder" data-testid="query-builder">
        <div className="query-builder--cards">
          <DapperScrollbars noScrollY={true}>
            <div className="builder-card--list">
              <BuilderCard testID="bucket-selector">
                <BuilderCard.Header title="From" />
                <BucketsSelector />
              </BuilderCard>
              {tagFiltersLength &&
                range(tagFiltersLength).map(i => (
                  <TagSelector key={i} index={i} />
                ))}
                <AddButton />
            </div>
          </DapperScrollbars>
          <AggregationSelector />
        </div>
      </div>
      </Context>
    </SchemaProvider>
  </BucketProvider>
)
}

export default QueryBuilder
