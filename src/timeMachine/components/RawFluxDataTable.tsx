// Libraries
import React, {PureComponent} from 'react'
import memoizeOne from 'memoize-one'
import RawFluxDataGrid from 'src/timeMachine/components/RawFluxDataGrid'

// Utils
import {
  parseFiles,
  parseFilesWithObjects,
} from 'src/timeMachine/utils/rawFluxDataTable'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {DapperScrollbars, FusionScrollEvent} from '@influxdata/clockface'

interface Props {
  files: string[]
  width: number
  height: number
  disableVerticalScrolling?: boolean
}

interface State {
  scrollLeft: number
  scrollTop: number
}

class RawFluxDataTable extends PureComponent<Props, State> {
  public state = {scrollLeft: 0, scrollTop: 0}

  private parseFiles = memoizeOne(parseFiles)
  private parseFilesWithObjects = memoizeOne(parseFilesWithObjects)

  public render() {
    const {width, height, files, disableVerticalScrolling} = this.props

    const {scrollTop, scrollLeft} = this.state
    const {data, maxColumnCount} = isFlagEnabled('parseObjectsInCSV')
      ? this.parseFilesWithObjects(files)
      : this.parseFiles(files)

    const tableWidth = width
    const tableHeight = height

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
            key={files[0]}
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
