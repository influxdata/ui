// Libraries
import React, {FC, useContext} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import {BucketProvider} from 'src/shared/contexts/buckets'
import {QueryBuilderProvider} from 'src/flows/pipes/QueryBuilder/context'
import {PipeContext} from 'src/flows/context/pipe'

// Components
import AddButton from 'src/flows/pipes/QueryBuilder/AddButton'
import BucketSelector from 'src/flows/pipes/QueryBuilder/BucketSelector'
import CardList from 'src/flows/pipes/QueryBuilder/CardList'

const QueryBuilder: FC<PipeProp> = ({Context}) => {
  const {scope} = useContext(PipeContext)

  return (
    <BucketProvider scope={scope}>
      <QueryBuilderProvider>
        <Context resizes>
          <div className="query-builder" data-testid="query-builder">
            <div className="query-builder--cards">
              <DapperScrollbars noScrollY={true}>
                <div className="builder-card--list">
                  <BucketSelector />
                  <CardList />
                  <AddButton />
                </div>
              </DapperScrollbars>
            </div>
          </div>
        </Context>
      </QueryBuilderProvider>
    </BucketProvider>
  )
}

export default QueryBuilder
