// Libraries
import React, {PureComponent} from 'react'
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

interface State {
  scrollLeft: number
  scrollTop: number
}

class RawFluxDataTable extends PureComponent<Props, State> {
  public state = {scrollLeft: 0, scrollTop: 0}

  public render() {
    const {width, height, disableVerticalScrolling, startRow} = this.props

    const {scrollTop, scrollLeft} = this.state

    const tableWidth = width
    const tableHeight = height

    const {parsedResults} = this.props
    const parsed = parseFromFluxResults(parsedResults)
    const data = parsed.tableData
    const maxColumnCount = parsed.max

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
          onScroll={this.onScrollbarsScroll}
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

  private onScrollbarsScroll = (e: FusionScrollEvent) => {
    const {scrollTop, scrollLeft} = e

    this.setState({scrollLeft, scrollTop})
  }
}

export default RawFluxDataTable
