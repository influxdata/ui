// Libraries
import React, {FC, useMemo, useState} from 'react'
import RawFluxDataGrid from 'src/timeMachine/components/RawFluxDataGrid'
import {FromFluxResult} from '@influxdata/giraffe'

// Utils
import {parseFromFluxResults} from 'src/timeMachine/utils/rawFluxDataTable'
import {DapperScrollbars, FusionScrollEvent} from '@influxdata/clockface'

interface Props {
  parsedResults: FromFluxResult
  width: number
  height: number
  disableVerticalScrolling?: boolean
  startRow?: number
}

const RawFluxDataTable: FC<Props> = ({
  width,
  height,
  parsedResults,
  disableVerticalScrolling,
  startRow,
}) => {
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const onScrollbarsScroll = (e: FusionScrollEvent) => {
    const {scrollTop: sTop, scrollLeft: sLeft} = e
    setScrollLeft(sLeft)
    setScrollTop(sTop)
  }

  const {tableData, max} = useMemo(() => parseFromFluxResults(parsedResults), [
    parsedResults,
  ])

  return (
    <div className="raw-flux-data-table" data-testid="raw-data-table">
      <DapperScrollbars
        style={{
          overflowY: 'hidden',
          width,
          height,
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
          width={width}
          height={height}
          maxColumnCount={max}
          data={tableData}
          startRow={startRow}
        />
      </DapperScrollbars>
    </div>
  )
}

export default RawFluxDataTable
