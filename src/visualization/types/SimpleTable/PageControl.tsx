// Libraries
import React, {FC, useContext} from 'react'
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
  const {offset, size, total, previous, next} = useContext(PaginationContext)

  const _previous = () => {
    event('Previous Page Clicked')

    previous()
  }

  const _next = () => {
    event('Next Page Clicked')

    next()
  }

  const prevButtonStatus =
    offset === 0 ? ComponentStatus.Disabled : ComponentStatus.Default

  const nextButtonStatus =
    offset >= total - size ? ComponentStatus.Disabled : ComponentStatus.Default

  return (
    <div className="visualization--simple-table--paging">
      <span className="visualization--simple-table--paging-label">{`Showing most recent 100 results per series ${offset} - ${offset +
        size}`}</span>
      <Button
        className="visualization--simple-table--paging-button"
        text="Previous"
        status={prevButtonStatus}
        icon={IconFont.CaretLeft}
        onClick={_previous}
        size={ComponentSize.ExtraSmall}
      />
      <Button
        className="visualization--simple-table--paging-button"
        text="Next"
        status={nextButtonStatus}
        icon={IconFont.CaretRight}
        onClick={_next}
        size={ComponentSize.ExtraSmall}
      />
    </div>
  )
}

export default PageControl
