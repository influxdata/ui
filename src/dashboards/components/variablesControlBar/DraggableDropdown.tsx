// Libraries
import React, {FC, CSSProperties} from 'react'
import classnames from 'classnames'
import {Draggable} from 'react-beautiful-dnd'

// Components
import VariableDropdown from 'src/variables/components/VariableDropdown'

interface Props {
  id: string
  index: number
  name: string
}

const DraggableDropdown: FC<Props> = ({id, index, name}) => {
  const getClassName = (isDragging: boolean): CSSProperties =>
    classnames('variable-dropdown', {
      'variable-dropdown__dragging': isDragging,
    })

  return (
    <Draggable index={index} draggableId={id}>
      {(provided, snapshot) => (
        <div
          className={getClassName(snapshot.isDragging)}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div
            className="variable-dropdown--drag"
            {...provided.dragHandleProps}
          >
            <span className="hamburger" />
          </div>
          <div className="variable-dropdown--label">
            <span>{name}</span>
          </div>
          <VariableDropdown variableID={id} />
        </div>
      )}
    </Draggable>
  )
}

export default DraggableDropdown
