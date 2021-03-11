import React, {FC} from 'react'
import {Table, ComponentSize} from '@influxdata/clockface'

import {FluxResult} from 'src/types/flows'
import {VisualizationProps} from 'src/visualization'
import {SimpleTableViewProperties} from 'src/visualization/types/SimpleTable'

const HEADER_HEIGHT = 51
const ROW_HEIGHT = 25

interface Props extends VisualizationProps {
  properties: SimpleTableViewProperties,
  result: FluxResult['parsed']
}

const SimpleTable: FC<Props> = ({properties, result}) => {
    if (properties.hasOwnProperty('height') && !properties.height) {
        return (
            <div className="visualization--simple-table">
            </div>
        )
    }

    let page, subset

    //this indicates that we want to do some paging
    if (properties.hasOwnProperty('height')) {
        const offset = properties.offset || 0
        let runningHeight = 60 // this is to account for the space around the table
        let rowIdx = offset
        let currentTable

        while (rowIdx <= result.table.length) {
          if (result.table.columns.table.data[rowIdx] !== currentTable) {
            runningHeight += HEADER_HEIGHT

            if (currentTable !== undefined) {
              runningHeight += 10
            }

            if (runningHeight > properties.height) {
              break
            }

            currentTable = result.table.columns.table.data[rowIdx]
            continue
          }

          runningHeight += ROW_HEIGHT

          if (runningHeight > properties.height) {
            break
          }

          rowIdx++
        }

        page = rowIdx - offset

        // updatePageSize(page)

        subset = Object.values(result.table.columns)
        .map(c => ({
            ...c,
            group: result.fluxGroupKeyUnion.includes(c.name),
            data: c.data.slice(offset, offset + page),
        }))
        .reduce((arr, curr) => {
            arr[curr.name] = curr
            return arr
        }, {})
    } else {
        page = result.table.length
        subset = Object.values(result.table.columns)
        .map(c => ({
            ...c,
            group: result.fluxGroupKeyUnion.includes(c.name),
        }))
        .reduce((arr, curr) => {
            arr[curr.name] = curr
            return arr
        }, {})
    }

    const tables = []
    let lastTable

    for (let ni = 0; ni < page; ni++) {
      if (subset['table'].data[ni] === lastTable) {
        continue
      }

      lastTable = subset['table'].data[ni]

      if (tables.length) {
        tables[tables.length - 1].end = ni
      }

      tables.push({
        idx: lastTable,
        start: ni,
      })
    }

    if (tables.length) {
      tables[tables.length - 1].end = page
    }

    const inner = tables.map((t, tIdx) => {
      const cols = [
        subset['table'],
        subset['_measurement'],
        subset['_field'],
        subset['_value'],
      ]
        .concat(
          Object.values(subset)
            .filter((c: any) => {
              return ![
                '_start',
                '_stop',
                'result',
                'table',
                '_measurement',
                '_field',
                '_value',
              ].includes(c.name)
            })
            .sort((a: any, b: any) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
        )
        .map(c => ({...c, data: c.data.slice(t.start, t.end)}))
        .filter(c => !!c.data.filter(_c => _c !== undefined).length)

      const headers = cols.map(c => (
        <Table.HeaderCell key={`t${tIdx}:h${c.name}`}>
          {c.name}
          <label>{c.group ? 'group' : 'no group'}</label>
          <label>{c.fluxDataType}</label>
        </Table.HeaderCell>
      ))
      const rows = Array(t.end - t.start)
        .fill(null)
        .map((_, idx) => {
          const cells = cols.map(c => (
            <Table.Cell key={`t${tIdx}:h${c.name}:r${idx}`}>
              {c.data[idx]}
            </Table.Cell>
          ))

          return <Table.Row key={`t${tIdx}:r${idx}`}>{cells}</Table.Row>
        })

      return (
        <Table
          key={`t${tIdx}`}
          fontSize={ComponentSize.Small}
          striped
          highlight
        >
          <Table.Header>
            <Table.Row>{headers}</Table.Row>
          </Table.Header>
          <Table.Body>{rows}</Table.Body>
        </Table>
      )
    })

    return (
        <div className="visualization--simple-table">
            {inner}
        </div>
    )
}

export default SimpleTable
