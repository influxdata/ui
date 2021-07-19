// Libraries
import React, {FC, useContext, useEffect, useRef, useCallback} from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import {DndProvider, useDrop, useDrag, DropTargetMonitor} from 'react-dnd'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// Components
import FlowPipe from 'src/flows/components/FlowPipe'
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'
import AddPanel from 'src/flows/components/AddPanel'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface PanelTargetProps {
  idx: number
  move: (drag: number, hover: number) => void
}

interface DropItem {
  index: number
  id: string
  type: string
}

const AddPanelTarget: FC<PanelTargetProps> = () => {
  const ref = useRef<HTMLDivElement>()
  const [{handlerId}, drop] = useDrop({
    accept: 'box',
    collect: (monitor: any) => ({
      handlerId: monitor.getHandlerId(),
    }),
  })
  const [{opacity}, drag, preview] = useDrag({
    type: 'box',
    item: {type: 'box'},
    collect: (monitor: any) => ({
      opacity: monitor.isDragging() ? '0' : '1',
    }),
  })

  preview(drop(ref))

  return (
    <div ref={ref} data-handler-id={handlerId} style={{opacity}}>
      <AddPanel handle={drag} />
    </div>
  )
}

const PanelTarget: FC<PanelTargetProps> = ({idx, move, children}) => {
  const ref = useRef<HTMLDivElement>()
  const [{handlerId}, drop] = useDrop({
    accept: 'box',
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DropItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }

      if (item.index === idx) {
        return
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Dragging downwards
      if (item.index < idx && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (item.index > idx && hoverClientY > hoverMiddleY) {
        return
      }

      move(item.index, idx)

      item.index = idx
    },
  })

  drop(ref)

  return (
    <div ref={ref} data-handler-id={handlerId}>
      {children}
    </div>
  )
}
const PipeList: FC = () => {
  const {flow, insertIndex, setInsertIndex} = useContext(FlowContext)
  const {queryAll} = useContext(FlowQueryContext)

  useEffect(() => {
    if (flow.readOnly) {
      queryAll()
    }
  }, [])

  const onmove = useCallback(
    (_drag: number, hover: number) => {
      setInsertIndex(hover)
    },
    [setInsertIndex]
  )

  const full = [...flow.data.allIDs]

  if (isFlagEnabled('flow-description')) {
    full.splice(insertIndex, 0, null)
  }

  if (!flow.data || !flow.data.allIDs.length) {
    return <EmptyPipeList />
  }

  const _pipes = full.map((id, idx) => {
    if (isFlagEnabled('flow-description') && idx === insertIndex) {
      return <AddPanelTarget key="add" idx={idx} move={onmove} />
    }

    return (
      <PanelTarget key={`panel[${id}]`} idx={idx} move={onmove}>
        <FlowPipe key={`pipe-${id}`} id={id} />
      </PanelTarget>
    )
  })

  const insertButton = !flow.readOnly && !isFlagEnabled('flow-description') && (
    <InsertCellButton id={null} />
  )

  const classer = [
    ['flow', true],
    ['flow-dnd', isFlagEnabled('flow-description')],
  ]
    .filter(c => c[1])
    .map(c => c[0])
    .join(' ')

  return (
    <div className={classer}>
      <DndProvider backend={HTML5Backend}>
        {insertButton}
        {_pipes}
      </DndProvider>
    </div>
  )
}

export default PipeList
