// Libraries
import React, {FC, useContext} from 'react'
import {PaginationContext} from 'src/visualization/context/pagination'

// Components
import {PaginationNav} from '@influxdata/clockface'

const PageControl: FC = () => {
  const {offset, size, total, totalPages, setPage} = useContext(
    PaginationContext
  )
  return (
    <div className="visualization--simple-table--paging">
      {total && size > 0 && (
        <PaginationNav.PaginationNav
          totalPages={totalPages}
          currentPage={Math.min(Math.floor(offset / size) + 1, totalPages)}
          pageRangeOffset={1}
          onChange={setPage}
        />
      )}
    </div>
  )
}

export default PageControl
