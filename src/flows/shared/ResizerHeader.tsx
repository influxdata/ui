// Libraries
import React, {FC, RefObject, useContext} from 'react'
import classnames from 'classnames'

// Components
import {Icon, IconFont} from '@influxdata/clockface'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {QueryContext} from 'src/flows/context/query'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {Visibility} from 'src/types/flows'

interface Props {
  visibility: Visibility
  onUpdateVisibility: (visibility: Visibility) => void
  onStartDrag: () => void
  resizingEnabled: boolean
  dragHandleRef: RefObject<HTMLDivElement>
  /** Icon to display when resizing is disabled */
  emptyIcon?: IconFont
  /** If true a button to toggle visibility will be rendered */
  toggleVisibilityEnabled: boolean
  /** Renders this element beneath the visibility toggle */
  additionalControls?: JSX.Element | JSX.Element[]
}

const ResizerHeader: FC<Props> = ({
  emptyIcon,
  visibility,
  onStartDrag,
  dragHandleRef,
  resizingEnabled,
  additionalControls,
  onUpdateVisibility,
  toggleVisibilityEnabled,
}) => {
  const {readOnly} = useContext(PipeContext)
  const {queryAll} = useContext(QueryContext)
  const glyph = visibility === 'visible' ? IconFont.EyeOpen : IconFont.EyeClosed
  const className = classnames('panel-resizer--header', {
    'panel-resizer--header__multiple-controls':
      toggleVisibilityEnabled || additionalControls,
    [`panel-resizer--header__${visibility}`]: resizingEnabled && visibility,
  })

  const handleSubmit = () => {
    event('Query All button clicked from inside Pipe')
    queryAll()
  }

  if (!resizingEnabled) {
    return (
      <div className={className} onClick={handleSubmit}>
        <Icon glyph={emptyIcon} className="panel-resizer--vis-toggle" />
      </div>
    )
  }

  const handleToggleVisibility = (): void => {
    if (visibility === 'visible') {
      onUpdateVisibility('hidden')
    } else {
      onUpdateVisibility('visible')
    }
  }

  let visibilityToggle = <div />

  if (toggleVisibilityEnabled) {
    visibilityToggle = (
      <div onClick={handleToggleVisibility}>
        <Icon className="panel-resizer--vis-toggle" glyph={glyph} />
      </div>
    )
  }

  if (readOnly) {
    return null
  }

  return (
    <div className={className}>
      {visibilityToggle}
      {additionalControls}
      <div
        className="panel-resizer--drag-handle"
        onMouseDown={onStartDrag}
        ref={dragHandleRef}
        title="Drag to resize results table"
      >
        <div className="panel-resizer--drag-icon" />
        <div className="panel-resizer--drag-icon" />
        <div className="panel-resizer--drag-icon" />
      </div>
    </div>
  )
}

export default ResizerHeader
