import React, {useEffect, useState} from 'react'

import {Cell as GenCell} from 'src/client'
import {parseASTIM} from '../../buckets/utils/astim'

import {Table} from '@influxdata/clockface'

type CellHealthProps = {
  cell: GenCell
}

const CellHealth = (props: CellHealthProps) => {
  const [bucketNames, setBucketNames] = useState([] as string[])

  useEffect(() => {
    const cellViewUrl = props.cell.links.view

    const resp = fetch(cellViewUrl)

    resp
      .then(result => result.json())
      .then(cellView => {
        const {queries} = cellView.properties

        queries?.forEach(query => {
          const {bucketNames: names} = parseASTIM(query.text)
          setBucketNames(prevState => [...prevState, ...names])
        })
      })
  }, [])

  return (
    <>
      <Table.Cell>{props.cell.name}</Table.Cell>
      <Table.Cell>
        {bucketNames.toString() || 'No buckets for this cell.'}
      </Table.Cell>
      <Table.Cell style={{color: 'green'}}>
        <>ok</>
      </Table.Cell>
    </>
  )
}

export default CellHealth
