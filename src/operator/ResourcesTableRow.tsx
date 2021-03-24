import React, {FC, useContext} from 'react'
import {Table} from '@influxdata/clockface'
import {Resource} from 'src/types/operator'
import {get} from 'lodash'
import {OperatorContext} from 'src/operator/context/operator'

// Constants
import {accountColumnInfo, organizationColumnInfo} from 'src/operator/constants'

interface Props {
  resource: Resource
}

const ResourcesTableRow: FC<Props> = ({resource}) => {
  const {activeTab} = useContext(OperatorContext)
  const infos =
    activeTab === 'accounts' ? accountColumnInfo : organizationColumnInfo

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
