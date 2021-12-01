// Libraries
import React, {FC} from 'react'
import classnames from 'classnames'
import {Draggable} from 'react-beautiful-dnd'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import TypeAheadVariableDropdown from 'src/variables/components/TypeAheadVariableDropdown'
import VariableDropdownReactSelect from "src/variables/components/VariableDropdownReactSelect"

interface Props {
  id: string
  index: number
  name: string
}

const DraggableDropdown: FC<Props> = ({id, index, name}) => {

  const DropdownComponent = isFlagEnabled('reactSelectVariableDropdown')
      ? VariableDropdownReactSelect
      : TypeAheadVariableDropdown

  return (
    <Draggable index={index} draggableId={id}>
      {(provided, snapshot) => (
        <div
          className={classnames('variable-dropdown', {
            'variable-dropdown__dragging': snapshot.isDragging,
          })}
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
