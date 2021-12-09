// Libraries
import React, {FC, useContext} from 'react'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {FlowContext} from 'src/flows/context/flow.current'

interface Props {
  id: string
}

const RemoveButton: FC<Props> = ({id}) => {
  const {flow, remove} = useContext(FlowContext)
  const _remove = () => {
    const {type} = flow.data.byID[id]
    event('notebook_delete_cell', {notebooksCellType: type})
    remove(id)
  }

  return (
    <SquareButton
      className="flows-delete-cell"
      testID="flows-delete-cell"
      icon={IconFont.Remove_New}
      onClick={_remove}
      titleText="Remove this cell"
    />
  )
}

export default RemoveButton
