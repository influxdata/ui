// Libraries
import React, {FC, CSSProperties} from 'react'
import classnames from 'classnames'
import {Draggable} from 'react-beautiful-dnd'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import VariableDropdown from 'src/variables/components/VariableDropdown'
import TypeAheadVariableDropdown from 'src/variables/components/TypeAheadVariableDropdown'

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

  const DropdownComponent = isFlagEnabled('typeAheadVariableDropdown')
    ? TypeAheadVariableDropdown
    : VariableDropdown

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
          <DropdownComponent variableID={id} />
        </div>
      )}
    </Draggable>
  )
}

export default DraggableDropdown
