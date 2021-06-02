import React, {FC, CSSProperties} from 'react'

import {Row, Fields} from 'src/types'

interface Props {
  row: Row
  style: CSSProperties
  fields: Fields
}

const URL_REGEXP = /((http|https)?:\/\/[^\s]+)/g

// NOTE: rip this out if you spend time any here as per:
// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript/1500501#1500501
function asLink(str) {
  const isURL = `${str}`.includes('http://') || `${str}`.includes('https://')
  if (isURL === false) {
    return str
  }

  const regex = RegExp(URL_REGEXP.source, URL_REGEXP.flags),
    out = []
  let idx = 0,
    link,
    m

  do {
    m = regex.exec(str)

    if (m) {
      if (m.index - idx > 0) {
        out.push(str.slice(idx, m.index))
      }

      link = str.slice(m.index, m.index + m[1].length)
      out.push(
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          data-testid="table-row--link"
        >
          {link}
        </a>
      )

      idx = m.index + m[1].length
    }
  } while (m)

  return out
}

const TableRow: FC<Props> = ({row, style, fields}) => {
  return (
    <div style={style}>
      <div className="event-row">
        {fields.map(({component: Component, columnWidth, rowKey}) => {
          const style = {flexBasis: `${columnWidth}px`}

          let content

          if (row[rowKey] === undefined) {
            content = null
          } else if (Component) {
            content = <Component key={rowKey} row={row} />
          } else {
            content = asLink(row[rowKey])
          }

          return (
            <div key={rowKey} className="event-row--field" style={style}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TableRow
