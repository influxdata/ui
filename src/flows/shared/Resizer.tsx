// Libraries
import React, {
  FC,
  useRef,
  useEffect,
  ReactNode,
  useState,
  useCallback,
} from 'react'
import classnames from 'classnames'

// Components
import ResizerHeader from 'src/flows/shared/ResizerHeader'
import {TechnoSpinner, IconFont} from '@influxdata/clockface'
import FriendlyQueryError from 'src/flows/shared/FriendlyQueryError'

// Types
import {Visibility} from 'src/types/flows'
import {RemoteDataState} from 'src/types'

// Styles
import 'src/flows/shared/Resizer.scss'

interface Props {
  children: ReactNode
  height: number
  onUpdateHeight: (height: number) => void
  visibility: Visibility
  onUpdateVisibility: (visible: Visibility) => void
  /** If true the resizer can be toggled between Hidden & Visible */
  toggleVisibilityEnabled: boolean
  /** If true the resizer cannot be resized, have its visibility toggled, and children will be hidden */
  resizingEnabled: boolean
  /** Icon to display in header when resizing is disabled */
  emptyIcon?: IconFont
  /** Text to display when resizing is disabled */
  emptyText: string
  /** Text to display when there is an error with the results */
  error?: string
  /** Text to display when the resizer is collapsed */
  hiddenText?: string
  /** When resizing is enabled the panel cannot be resized below this amount */
  minimumHeight?: number
  /** Renders this element beneath the visibility toggle in the header */
  additionalControls?: JSX.Element | JSX.Element[]
  /** Loading state */
  loading?: RemoteDataState
}

export const MINIMUM_RESIZER_HEIGHT = 360

const Resizer: FC<Props> = ({
  loading = RemoteDataState.NotStarted,
  children,
  emptyIcon,
  emptyText,
  error,
  hiddenText = 'Hidden',
  minimumHeight = MINIMUM_RESIZER_HEIGHT,
  height,
  visibility,
  onUpdateHeight,
  onUpdateVisibility,
  resizingEnabled,
  additionalControls,
  toggleVisibilityEnabled,
}) => {
  const [size, updateSize] = useState<number>(height)
  const [isDragging, updateDragging] = useState<boolean>(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  const resizerBodyClass = classnames('panel-resizer--body', {
    [`panel-resizer--body__${visibility}`]:
      resizingEnabled && visibility === 'visible',
  })

  const resizerContainerClass = classnames('panel-resizer', {
    'panel-resizer--error-state': error,
    'panel-resizer__loading': loading === RemoteDataState.Loading,
    [`panel-resizer__${visibility}`]: true,
  })

  let _emptyIcon = emptyIcon
  if (error) {
    _emptyIcon = IconFont.AlertTriangle
  } else {
    _emptyIcon = emptyIcon || IconFont.Play
  }

  const updateResultsStyle = useCallback((): void => {
    if (
      bodyRef.current &&
      resizingEnabled &&
      visibility === 'visible' &&
      !error
    ) {
      bodyRef.current.setAttribute('style', `height: ${size}px`)
    } else {
      bodyRef.current.setAttribute('style', '')
    }
  }, [size, resizingEnabled, visibility, error])

  // Ensure styles update when state & props update
  useEffect(() => {
    updateResultsStyle()
  }, [size, resizingEnabled, visibility, updateResultsStyle])

  // Handle changes in drag state
  useEffect(() => {
    if (isDragging === true) {
      dragHandleRef.current &&
        dragHandleRef.current.classList.add(
          'panel-resizer--drag-handle__dragging'
        )
    }

    if (isDragging === false) {
      dragHandleRef.current &&
        dragHandleRef.current.classList.remove(
          'panel-resizer--drag-handle__dragging'
        )
      onUpdateHeight(size)
    }
  }, [isDragging]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseMove = (e: MouseEvent): void => {
    if (!bodyRef.current) {
      return
    }

    const {pageY} = e
    const {top} = bodyRef.current.getBoundingClientRect()

    const updatedHeight = Math.round(Math.max(pageY - top, minimumHeight))

    updateSize(updatedHeight)
  }

  const handleMouseDown = (): void => {
    updateDragging(true)
    const body = document.getElementsByTagName('body')[0]
    body && body.classList.add('panel-resizer-dragging')

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseUp = (): void => {
    updateDragging(false)
    const body = document.getElementsByTagName('body')[0]
    body && body.classList.remove('panel-resizer-dragging')

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  let body = children

  if (error) {
    body = <FriendlyQueryError error={error} />
  } else {
    if (!resizingEnabled) {
      body = <div className="panel-resizer--empty">{emptyText}</div>
    }

    if (resizingEnabled && visibility === 'hidden') {
      body = <div className="panel-resizer--empty">{hiddenText}</div>
    }
  }

  const resizerDiameter =
    visibility === 'visible' && resizingEnabled ? Math.min(100, height) : 30

  return (
    <div className={resizerContainerClass}>
      <div className="panel-resizer--loading-mask">
        <TechnoSpinner diameterPixels={resizerDiameter} />
      </div>
      <ResizerHeader
        emptyIcon={_emptyIcon}
        visibility={visibility}
        onStartDrag={handleMouseDown}
        dragHandleRef={dragHandleRef}
        resizingEnabled={resizingEnabled && !error}
        additionalControls={additionalControls}
        onUpdateVisibility={onUpdateVisibility}
        toggleVisibilityEnabled={toggleVisibilityEnabled}
      />
      <div className={resizerBodyClass} ref={bodyRef}>
        {body}
      </div>
    </div>
  )
}

export default Resizer
