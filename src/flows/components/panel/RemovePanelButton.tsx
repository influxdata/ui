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
  const {flow} = useContext(FlowContext)
  const remove = () => {
    const {type} = flow.data.get(id)
    event('notebook_delete_cell', {notebooksCellType: type})

    flow.data.remove(id)
    flow.meta.remove(id)
  }

  return (
    <SquareButton
      className="flows-delete-cell"
      testID="flows-delete-cell"
      icon={IconFont.Remove}
      onClick={remove}
      titleText="Remove this cell"
    />
  )
}

export default RemoveButton
