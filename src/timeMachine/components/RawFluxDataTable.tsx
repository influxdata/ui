// Libraries
import React, {PureComponent} from 'react'
import memoizeOne from 'memoize-one'
import RawFluxDataGrid from 'src/timeMachine/components/RawFluxDataGrid'
import {FromFluxResult} from '@influxdata/giraffe'

// Utils
import {
  parseFiles,
  parseFilesWithObjects,
  parseFilesWithFromFlux,
  parseFromFluxResults,
} from 'src/timeMachine/utils/rawFluxDataTable'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {DapperScrollbars, FusionScrollEvent} from '@influxdata/clockface'

interface Props {
  files?: string[]
  parsedResults?: FromFluxResult
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

  private parseFilesWithFromFlux = memoizeOne(parseFilesWithFromFlux)
  private parseFiles = memoizeOne(parseFiles)
  private parseFilesWithObjects = memoizeOne(parseFilesWithObjects)

  public render() {
    const {
      width,
      height,
      files,
      disableVerticalScrolling,
      startRow,
    } = this.props

    const {scrollTop, scrollLeft} = this.state

    const tableWidth = width
    const tableHeight = height

    const {parsedResults} = this.props
    let data
    let maxColumnCount
    let parseFunction = this.parseFiles
    if (parsedResults) {
      const parsed = parseFromFluxResults(parsedResults)
      data = parsed.tableData
      maxColumnCount = parsed.max
    } else {
      if (isFlagEnabled('parseObjectsInCSV')) {
        parseFunction = this.parseFilesWithObjects
      }
      if (isFlagEnabled('rawCsvFromfluxParser')) {
        parseFunction = this.parseFilesWithFromFlux
      }
      const parsed = parseFunction(files)
      data = parsed.data
      maxColumnCount = parsed.maxColumnCount
    }

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
