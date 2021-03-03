// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Context} from 'src/clockface'
import {ButtonShape, ComponentColor, IconFont} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {FunctionListContext} from 'src/functions/context/function.list'

interface Props {
  id: string
  name: string
}

const FunctionContextMenu: FC<Props> = ({id: functionID, name}) => {
  const {remove} = useContext(FunctionListContext)

  const {id: orgID} = useSelector(getOrg)

  const history = useHistory()

  const handleDelete = () => {
    remove(functionID)
  }

  const handleRouteToRuns = () => {
    history.push(`/orgs/${orgID}/functions/${functionID}/runs`)
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
