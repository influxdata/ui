// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import {DragDropContext, Droppable} from 'react-beautiful-dnd'
import classnames from 'classnames'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import DraggableDropdown from 'src/dashboards/components/variablesControlBar/DraggableDropdown'

// Actions
import {moveVariable} from 'src/variables/actions/thunks'

// Types
import {Variable} from 'src/types'

interface Props {
  variables: Variable[]
}

const VariablesControlBarList: FC<Props> = ({variables}) => {
  const dispatch = useDispatch()

  const handleDragEnd = async result => {
    const {destination, source} = result

    // Don't do anything if dropdown is dropped outside droppable area
    if (!destination) {
      return
    }

    // Don't do anything if dropdown is dropped in it's initial location
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    await dispatch(moveVariable(source.index, destination.index))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="variables-dropdowns" direction="horizontal">
        {(provided, snapshot) => (
          <div
            className={classnames('variables-control-bar--grid', {
              'variables-control-bar--grid__dragging-over':
                snapshot.isDraggingOver,
            })}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {variables.map((v, i) => (
              <ErrorBoundary key={v.id}>
                <DraggableDropdown id={v.id} index={i} name={v.name} />
              </ErrorBoundary>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default VariablesControlBarList
