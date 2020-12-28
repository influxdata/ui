// Libraries
import React, {FC, useMemo, useState, useCallback} from 'react'
import {timeFormatter} from '@influxdata/giraffe'
import classnames from 'classnames'
import {ColumnSizer, SizedColumnProps, AutoSizer} from 'react-virtualized'

// Components
import MultiGrid from 'src/visualization/types/Table/MultiGrid'
import TableCell from 'src/visualization/types/Table/TableCell'

// Utils
import {transformTableData} from 'src/visualization/types/Table/transform'
import {resolveTimeFormat} from 'src/visualization/utils/timeFormat'
import {
  COLUMN_MIN_WIDTH,
  ROW_HEIGHT,
  DEFAULT_FIX_FIRST_COLUMN,
  DEFAULT_VERTICAL_TIME_AXIS,
  DEFAULT_TIME_FIELD,
} from './constants'

// Types
import {
  TableViewProperties,
  TimeZone,
  Theme,
  FluxTable,
  SortOptions,
} from 'src/types'
import {CellRendererProps} from 'src/visualization/types/Table/TableCell'

interface Props {
  properties: TableViewProperties
  sort: SortOptions
  updateSort: (field: string) => void
  table: FluxTable
  timeZone: TimeZone
  theme: Theme
}

const Table: FC<Props> = ({
  properties,
  sort,
  updateSort,
  table,
  timeZone,
  theme,
}) => {
  const transformed = useMemo(
    () =>
      transformTableData(
        table.data,
        sort,
        properties.fieldOptions.map(o => ({
          ...o,
          dataType: table.dataTypes[o.internalName],
        })),
        properties.tableOptions,
        properties.timeFormat,
        properties.decimalPlaces
      ),
    [
      table.data,
      sort,
      properties.fieldOptions,
      properties.timeFormat,
      properties.decimalPlaces,
    ]
  )

  const [tableWidth, setTableWidth] = useState(0)

  const tableClassName = classnames('time-machine-table', {
    'time-machine-table__light-mode': theme === 'light',
  })
  const formatter = timeFormatter({
    timeZone: timeZone === 'Local' ? undefined : timeZone,
    format: resolveTimeFormat(properties.timeFormat),
  })
  const colCount = transformed?.transformedData[0]?.length || 0
  const rowCount =
    colCount === 0 ? 0 : transformed?.transformedData?.length || 0

  const needsFixing = useMemo(() => {
    if (
      transformed.resolvedFieldOptions.length !== 1 &&
      transformed.resolvedFieldOptions.reduce((acc, f) => {
        if (f.visible) {
          acc += 1
        }
        return acc
      }, 0) !== 1
    ) {
      if (properties?.tableOptions?.fixFirstColumn === undefined) {
        return DEFAULT_FIX_FIRST_COLUMN
      }

      return properties.tableOptions.fixFirstColumn
    }

    return false
  }, [properties.tableOptions, transformed])
  const isVertical =
    properties.tableOptions.verticalTimeAxis || DEFAULT_VERTICAL_TIME_AXIS
  const timeVisible =
    transformed.resolvedFieldOptions.find(
      f => f.internalName === DEFAULT_TIME_FIELD.internalName
    )[0]?.visible || false

  const calculate = useCallback(
    width => column => {
      if (needsFixing && column.index === 0) {
        return (
          transformed.columnWidths[
            transformed.transformedData[0][column.index]
          ] || 0
        )
      }

      if (colCount <= 1) {
        return width
      }

      const diff = tableWidth / (colCount - (needsFixing ? 1 : 0))

      return (
        (transformed.columnWidths[
          transformed.transformedData[0][column.index]
        ] || 0) + diff
      )
    },
    [needsFixing, transformed, tableWidth, colCount]
  )

  if (!table) {
    return null
  }

  return (
    <div
      className={tableClassName}
      ref={gridContainer => setTableWidth(gridContainer.clientWidth)}
      onMouseLeave={this.handleMouseLeave}
    >
      {rowCount > 0 && (
        <AutoSizer>
          {({width, height}) => {
            return (
              <ColumnSizer
                columnCount={colCount - (needsFixing ? 1 : 0)}
                columnMinWidth={COLUMN_MIN_WIDTH}
                width={width}
              >
                {({
                  adjustedWidth,
                  columnWidth,
                  registerChild,
                }: SizedColumnProps) => {
                  return (
                    <MultiGrid
                      height={height}
                      ref={registerChild}
                      rowCount={rowCount}
                      width={adjustedWidth}
                      rowHeight={ROW_HEIGHT}
                      scrollToRow={scrollToRow}
                      columnCount={colCount}
                      scrollToColumn={scrollToColumn}
                      fixedColumnCount={needsFixing && colCount > 1 ? 1 : 0}
                      cellRenderer={(props: CellRendererProps) => {
                        const {scrollToRow} = this.scrollToColRow
                        const hoverIndex =
                          scrollToRow >= 0 ? scrollToRow : this.hoveredRowIndex

                        return (
                          <TableCell
                            {...props}
                            sortOptions={transformed.sortOptions}
                            onHover={this.handleHover}
                            isTimeVisible={timeVisible}
                            data={
                              transformed.transformedData[props.rowIndex][
                                props.columnIndex
                              ]
                            }
                            dataType={
                              table.dataTypes[
                                transformed.transformedData[0][
                                  props.columnIndex
                                ]
                              ] || 'n/a'
                            }
                            hoveredRowIndex={hoverIndex}
                            properties={properties}
                            resolvedFieldOptions={
                              transformed.resolvedFieldOptions
                            }
                            hoveredColumnIndex={this.hoveredColumnIndex}
                            isFirstColumnFixed={needsFixing}
                            isVerticalTimeAxis={isVertical}
                            onClickFieldName={updateSort}
                            timeFormatter={formatter}
                          />
                        )
                      }}
                      classNameBottomRightGrid="table-graph--scroll-window"
                      columnWidth={calculate(columnWidth)}
                    />
                  )
                }}
              </ColumnSizer>
            )
          }}
        </AutoSizer>
      )}
    </div>
  )
}
export default Table
