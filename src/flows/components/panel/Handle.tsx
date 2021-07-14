// Libraries
import React, {FC, RefObject} from 'react'
import classnames from 'classnames'

interface Props {
  testID?: string
  dragRef: RefObject<HTMLDivElement>
  onStartDrag: () => void
  dragging: boolean
}

const Handle: FC<Props> = ({
  testID = 'notebook-resize-handle',
  dragging = false,
  onStartDrag = () => {},
  dragRef,
}) => {
  const handleMouseDown = (): void => {
    onStartDrag()
  }

  const DraggableResizerHandleClass = classnames(
    'cf-draggable-resizer--handle',
    {
      'cf-draggable-resizer--handle-dragging': dragging,
    }
  )

  return (
    <div
      className={DraggableResizerHandleClass}
      onMouseDown={handleMouseDown}
      title="Drag to resize"
      data-testid={testID}
      ref={dragRef}
    >
      <div className="cf-draggable-resizer--handle-pill1 cf-draggable-resizer--handle-pill1--horizontal"></div>
      <div
        className="cf-draggable-resizer--gradient1 cf-draggable-resizer--gradient1--horizontal"
        style={{
          background: `linear-gradient(to right, #ce58eb 0%, #00C9FF 100%)`,
        }}
      />
      <div className="cf-draggable-resizer--handle-pill2 cf-draggable-resizer--handle-pill2--horizontal"></div>
      <div
        className="cf-draggable-resizer--gradient2 cf-draggable-resizer--gradient2--horizontal"
        style={{
          background: `linear-gradient(to right, #ce58eb 0%, #00C9FF 100%)`,
        }}
      />
    </div>
  )
}

export default Handle
