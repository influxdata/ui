import React, {FC} from 'react'
import {Table} from '@influxdata/clockface'
import {get} from 'lodash'

// Types
import {CellInfo, Resource} from 'src/types/operator'
interface Props {
  resource: Resource
  infos: CellInfo[]
}

const ResourcesTableRow: FC<Props> = ({resource, infos}) => {
  const returnValue = (path, defaultValue, renderValue) => {
    const value = get(resource, path, defaultValue)
    return renderValue ? renderValue(value) : value
  }

  return (
    <Table.Row>
      {infos.map(({name, path, defaultValue, renderValue}) => (
        <Table.Cell key={name} testID={name}>
          {returnValue(path, defaultValue, renderValue)}
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

export default ResourcesTableRow
