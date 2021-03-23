import React, {
  FC,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'
import {SubsetTable} from 'src/visualization/types/SimpleTable'
import {FluxResult} from 'src/types/flows'
import {PaginationContext} from 'src/visualization/context/pagination'
import InnerTable from 'src/visualization/types/SimpleTable/InnerTable'

const HEADER_HEIGHT = 51
const ROW_HEIGHT = 25

const measurePage = (
  result: FluxResult['parsed'],
  offset: number,
  height: number
): number => {
  if (height === 0) {
    return 0
  }

  let runningHeight = 14
  let rowIdx = offset
  let currentTable
  let lastSignature
  let signature

  while (rowIdx <= result.table.length) {
    if (result.table.columns.table.data[rowIdx] !== currentTable) {
      signature = Object.values(result.table.columns)
        .map(
          c =>
            `${c.name}::${c.fluxDataType}::${result.fluxGroupKeyUnion.includes(
              c.name
            )}`
        )
        .join('|')

      if (signature !== lastSignature) {
        runningHeight += HEADER_HEIGHT

        if (currentTable !== undefined) {
          runningHeight += 10
        }

        if (runningHeight >= height) {
          break
        }

        lastSignature = signature
      }

      currentTable = result.table.columns.table.data[rowIdx]

      continue
    }

    runningHeight += ROW_HEIGHT

    if (runningHeight >= height) {
      break
    }

    rowIdx++
  }

  return rowIdx - offset
}

const subsetResult = (
  result: FluxResult['parsed'],
  offset: number,
  page: number
): SubsetTable[] => {
  // only look at data within the page
  const subset = Object.values(result.table.columns)
    .map(c => ({
      ...c,
      group: result.fluxGroupKeyUnion.includes(c.name),
      data: c.data.slice(offset, offset + page),
    }))
    .reduce((arr, curr) => {
      arr[curr.name] = curr
      return arr
    }, {})

  const tables: SubsetTable[] = []
  let lastTable

  // group by table id (series)
  for (let ni = 0; ni < page; ni++) {
    if (
      `y${subset['result'].data[ni]}:t${subset['table'].data[ni]}` === lastTable
    ) {
      continue
    }

    lastTable = `y${subset['result'].data[ni]}:t${subset['table'].data[ni]}`

    if (tables.length) {
      tables[tables.length - 1].end = ni
    }

    tables.push({
      idx: subset['table'].data[ni],
      yield: subset['result'].data[ni],
      cols: [],
      signature: '',
      start: ni,
      end: -1,
    })
  }

  if (tables.length) {
    tables[tables.length - 1].end = page
  }

  // reorder the column names, filter empty columns, join repeating tables under one header
  const cleanedTables = tables
    .reduce((acc, curr) => {
      curr.cols = [
        subset['table'],
        subset['_measurement'],
        subset['_field'],
        subset['_value'],
      ]
        .filter(c => !!c)
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
        .map(c => ({...c, data: c.data.slice(curr.start, curr.end)}))
        .filter(c => !!c.data.filter(_c => _c !== undefined).length)
        .reduce((acc, curr) => {
          acc[curr.name] = curr
          return acc
        }, {})

      curr.signature = Object.values(curr.cols)
        .map(c => `${c.name}::${c.fluxDataType}::${c.group}`)
        .join('|')
      acc.push(curr)
      return acc
    }, [])
    .reduce((acc, curr) => {
      const last: SubsetTable = acc[acc.length - 1]

      if (
        !last ||
        curr.yield !== last.yield ||
        curr.signature !== last.signature
      ) {
        acc.push(curr)
        return acc
      }

      Object.values(last.cols).forEach(col => {
        last.cols[col.name] = {
          ...col,
          data: [...col.data, ...curr.cols[col.name].data],
        }
      })

      last.end = curr.end

      return acc
    }, [])

  return cleanedTables
}

interface Props {
  result: FluxResult['parsed']
}

const PagedTable: FC<Props> = ({result}) => {
  const {offset, setSize} = useContext(PaginationContext)
  const [height, setHeight] = useState(0)
  const ref = useRef()

  // this makes sure that the table is always filling it's parent container
  useEffect(() => {
    if (!ref || !ref.current) {
      return
    }

    let timeout
    const resizer = new ResizeObserver(entries => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        requestAnimationFrame(() => {
          setHeight(entries[0].contentRect.height)
        })
      }, 200)
    })

    resizer.observe(ref.current)

    const curr = (ref?.current || {}) as any

    const rect = curr?.getBoundingClientRect()

    if (rect && rect.height !== height) {
      setHeight(rect.height)
    }

    return () => {
      resizer.disconnect()
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [ref?.current])

  const page = useMemo(() => {
    return measurePage(result, offset, height)
  }, [result, offset, height])
  const tables = useMemo(() => {
    return subsetResult(result, offset, page)
  }, [result, offset, page])

  useEffect(() => {
    setSize(page)
  }, [page])

  const inner = tables.map((t, tIdx) => (
    <InnerTable table={t} key={`table${tIdx}`} />
  ))

  return (
    <div className="visualization--simple-table--results" ref={ref}>
      <DapperScrollbars noScrollY>{inner}</DapperScrollbars>
    </div>
  )
}

export default PagedTable
