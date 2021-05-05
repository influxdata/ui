// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Context} from 'src/clockface'
import {ButtonShape, ComponentColor, IconFont} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PROJECT_NAME} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  id: string
  name: string
}

const FlowContextMenu: FC<Props> = ({id, name}) => {
  const {remove, clone} = useContext(FlowListContext)

  const handleDelete = () => {
    event('delete_notebook')
    remove(id)
  }

  const handleClone = () => {
    event('clone_notebook')
    clone(id)
  }

  return (
    <Context>
      <Context.Menu
        icon={IconFont.Duplicate}
        color={ComponentColor.Secondary}
        shape={ButtonShape.Default}
        text="Clone"
        testID={`context-clone-menu ${name}`}
      >
        <Context.Item
          label="Clone"
          action={handleClone}
          testID={`context-clone-flow ${name}`}
        />
      </Context.Menu>
      <Context.Menu
        icon={IconFont.Trash}
        color={ComponentColor.Danger}
        shape={ButtonShape.Default}
        text={`Delete ${PROJECT_NAME}`}
        testID={`context-delete-menu ${name}`}
      >
        <Context.Item
          label="Confirm"
          action={handleDelete}
          testID={`context-delete-flow ${name}`}
        />
      </Context.Menu>
    </Context>
  )
}

export default FlowContextMenu
