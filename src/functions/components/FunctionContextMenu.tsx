// Libraries
import React, {FC} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {Context} from 'src/clockface'
import {ButtonShape, ComponentColor, IconFont} from '@influxdata/clockface'

interface Props {
  id: string
  name: string
}

const FunctionContextMenu: FC<Props> = ({id, name}) => {
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleDelete = () => {
    console.log('delete', id)
  }

  const handleRouteToRuns = () => {
    history.push(`/orgs/${orgID}/functions/${id}/runs`)
  }

  return (
    <Context>
      <Context.Menu icon={IconFont.CogThick}>
        <Context.Item
          label="View Function Runs"
          action={handleRouteToRuns}
          testID={`context-function-runs ${name}`}
        />
      </Context.Menu>
      <Context.Menu
        icon={IconFont.Trash}
        color={ComponentColor.Danger}
        shape={ButtonShape.Default}
        testID={`context-delete-menu ${name}`}
      >
        <Context.Item
          label="Delete Function"
          action={handleDelete}
          testID={`context-delete-function ${name}`}
        />
      </Context.Menu>
    </Context>
  )
}

export default FunctionContextMenu
