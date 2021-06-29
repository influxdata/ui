import React, {FC} from 'react'
import {Table} from '@influxdata/clockface'

// Types
import {OperatorAccount, CellInfo, OperatorOrg, OperatorUser} from 'src/types'
interface Props {
  resource: OperatorAccount | OperatorOrg | OperatorUser
  infos: CellInfo[]
}

const resolvePath = (object, path, defaultValue) =>
  path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object)

const ResourcesTableRow: FC<Props> = ({resource, infos}) => {
  const returnValue = (path, defaultValue, renderValue) => {
    const value = resolvePath(resource, path, defaultValue)
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
