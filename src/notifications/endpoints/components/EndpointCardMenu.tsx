// Libraries
import React, {FC} from 'react'

// Components
import {Context} from 'src/clockface'
import {ComponentColor, IconFont} from '@influxdata/clockface'

interface Props {
  onDelete: () => void
  onClone: () => void
  onView: () => void
}

const EndpointCardContext: FC<Props> = ({onDelete, onView}) => {
  return (
    <Context>
      <Context.Menu icon={IconFont.EyeOpen} testID="context-history-menu">
        <Context.Item
          label="View History"
          action={onView}
          testID="context-history-task"
        />
      </Context.Menu>
      <Context.Menu
        icon={IconFont.Trash_New}
        color={ComponentColor.Danger}
        testID="context-delete-menu"
      >
        <Context.Item
          label="Delete"
          action={onDelete}
          testID="context-delete-task"
        />
      </Context.Menu>
    </Context>
  )
}

export default EndpointCardContext
