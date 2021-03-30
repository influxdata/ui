// Libraries
import React, {FC, useContext} from 'react'
import {PaginationNav} from '@influxdata/clockface'
import {PaginationContext} from 'src/visualization/context/pagination'
import {event} from 'src/cloud/utils/reporting'

// Components
import {
  Button,
  ComponentStatus,
  IconFont,
  ComponentSize,
} from '@influxdata/clockface'

const PageControl: FC = () => {
  const {offset, size, total, setPage } = useContext(PaginationContext)

  return (
    <div className="visualization--simple-table--paging">
      <span className="visualization--simple-table--paging-label">{`Showing most recent 100 results per series`}</span>
        <PaginationNav.PaginationNav
            totalPages={ Math.ceil(total / size) }
            currentPage={ Math.floor(offset / size) }
            onChange={ setPage }
        />
    </div>
  )
}

export default PageControl
