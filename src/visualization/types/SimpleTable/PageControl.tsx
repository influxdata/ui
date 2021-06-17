// Libraries
import React, {FC, useContext} from 'react'
import {PaginationContext} from 'src/visualization/context/pagination'

// Components
import {PaginationNav} from '@influxdata/clockface'

const PageControl: FC = () => {
  const {offset, size, total, setPage} = useContext(PaginationContext)

  return (
    <div className="visualization--simple-table--paging">
      {total && size && (
        <PaginationNav.PaginationNav
          totalPages={Math.ceil(total / size)}
          currentPage={Math.floor(offset / size) + 1}
          pageRangeOffset={1}
          onChange={setPage}
        />
      )}
    </div>
  )
}

export default PageControl
