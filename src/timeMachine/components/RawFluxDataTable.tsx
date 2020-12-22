// Libraries
import React, {FunctionComponent, useState} from 'react'
import RawFluxDataGrid from 'src/timeMachine/components/RawFluxDataGrid'
import {FromFluxResult} from '@influxdata/giraffe'

// Utils
import {
  parseFromFluxResults,
} from 'src/timeMachine/utils/rawFluxDataTable'
import {DapperScrollbars, FusionScrollEvent} from '@influxdata/clockface'

interface Props {
  parsedResults: FromFluxResult
  width: number
  height: number
  disableVerticalScrolling?: boolean
  startRow?: number
}

const RawFluxDataTable: FunctionComponent<Props> = ({
  width,
  height,
  parsedResults,
  disableVerticalScrolling,
  startRow
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const onScrollbarsScroll = (e: FusionScrollEvent) => {
    const {scrollTop: sTop, scrollLeft: sLeft} = e
    setScrollLeft(sLeft)
    setScrollTop(sTop)
  }

  const tableWidth = width
  const tableHeight = height

  let data
  let maxColumnCount
  const parsed = parseFromFluxResults(parsedResults)
  data = parsed.tableData
  maxColumnCount = parsed.max

  return (
    <div className="raw-flux-data-table" data-testid="raw-data-table">
      <DapperScrollbars
        style={{
          overflowY: 'hidden',
          width: tableWidth,
          height: tableHeight,
        }}
        autoHide={false}
        scrollTop={scrollTop}
        scrollLeft={scrollLeft}
        testID="rawdata-table--scrollbar"
        onScroll={onScrollbarsScroll}
        noScrollY={disableVerticalScrolling}
      >
        <RawFluxDataGrid
          scrollTop={scrollTop}
          scrollLeft={scrollLeft}
          width={tableWidth}
          height={tableHeight}
          maxColumnCount={maxColumnCount}
          data={data}
          startRow={startRow}
        />
      </DapperScrollbars>
    </div>
  )


}

export default RawFluxDataTable
