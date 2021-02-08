// Libraries
import React, {FC} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {QueryBuilderProvider} from 'src/flows/pipes/QueryBuilder/context'

// Components
import AddButton from 'src/flows/pipes/QueryBuilder/AddButton'
import AggregationSelector from 'src/flows/pipes/QueryBuilder/AggregationSelector'
import BucketSelector from 'src/flows/pipes/QueryBuilder/BucketSelector'
import CardList from 'src/flows/pipes/QueryBuilder/CardList'

const QueryBuilder: FC<PipeProp> = ({Context}) => {
  return (
    <BucketProvider>
      <QueryBuilderProvider>
        <Context>
          <div className="query-builder" data-testid="query-builder">
            <div className="query-builder--cards">
              <DapperScrollbars noScrollY={true}>
                <div className="builder-card--list">
                  <BucketSelector />
                  <CardList />
                  <AddButton />
                </div>
              </DapperScrollbars>
              <AggregationSelector />
            </div>
          </div>
        </Context>
      </QueryBuilderProvider>
    </BucketProvider>
  )
}

export default QueryBuilder
