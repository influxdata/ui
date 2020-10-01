// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Context} from 'src/clockface'
import {ButtonShape, ComponentColor, IconFont} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'

interface Props {
  id: string
  name: string
}

const FlowContextMenu: FC<Props> = ({id, name}) => {
  const {remove} = useContext(FlowListContext)

  const handleDelete = () => {
    remove(id)
  }

  return (
    <Context.Menu
      icon={IconFont.Trash}
      color={ComponentColor.Danger}
      shape={ButtonShape.Default}
      text="Delete Flow"
      testID={`context-delete-menu ${name}`}
    >
      <Context.Item
        label="Confirm"
        action={handleDelete}
        testID={`context-delete-flow ${name}`}
      />
    </Context.Menu>
  )
}

export default FlowContextMenu
