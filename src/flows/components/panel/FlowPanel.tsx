// Libraries
import React, {FC, useContext, useState, useRef, useEffect} from 'react'
import classnames from 'classnames'
import {ComponentColor, IconFont, SquareButton} from '@influxdata/clockface'

// Components
import RemovePanelButton from 'src/flows/components/panel/RemovePanelButton'
import Handle from 'src/flows/components/panel/Handle'
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'
import PanelVisibilityToggle from 'src/flows/components/panel/PanelVisibilityToggle'
import FlowPanelTitle from 'src/flows/components/panel/FlowPanelTitle'
import {MenuButton} from 'src/flows/components/Sidebar'

// Constants
import {PIPE_DEFINITIONS} from 'src/flows'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Types
import {PipeContextProps} from 'src/types/flows'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {SidebarContext} from 'src/flows/context/sidebar'
import {FlowQueryContext} from 'src/flows/context/flow.query'

import 'src/flows/shared/Resizer.scss'

export interface Props extends PipeContextProps {
  id: string
}

export const DEFAULT_RESIZER_HEIGHT = 360
export const MINIMUM_RESIZER_HEIGHT = 220

const FlowPanel: FC<Props> = ({
  id,
  controls,
  persistentControls,
  resizes,
  children,
}) => {
  const {flow} = useContext(FlowContext)
  const {printMap} = useContext(FlowQueryContext)
  const {id: focused} = useContext(SidebarContext)

  const isVisible = flow.meta.get(id).visible

  const panelClassName = classnames('flow-panel', {
    [`flow-panel__${isVisible ? 'visible' : 'hidden'}`]: true,
    'flow-panel__focus': focused === id,
  })

  const [size, updateSize] = useState<number>(
    flow.meta.get(id).height || DEFAULT_RESIZER_HEIGHT
  )
  const [isDragging, setIsDragging] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDragging === true) {
      handleRef.current &&
        handleRef.current.classList.add('panel-resizer--drag-handle__dragging')
    }

    if (isDragging === false) {
      handleRef.current &&
        handleRef.current.classList.remove(
          'panel-resizer--drag-handle__dragging'
        )
      flow.meta.update(id, {height: size})
    }
  }, [isDragging]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseMove = (e: MouseEvent): void => {
    if (!bodyRef.current) {
      return
    }

    const {pageY} = e
    const {top} = bodyRef.current.getBoundingClientRect()

    const updatedHeight = Math.round(
      Math.max(pageY - top, MINIMUM_RESIZER_HEIGHT)
    )

    updateSize(updatedHeight)
  }

  const handleMouseDown = (): void => {
    setIsDragging(true)
    const body = document.getElementsByTagName('body')[0]
    body && body.classList.add('panel-resizer-dragging')

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseUp = (): void => {
    setIsDragging(false)
    const body = document.getElementsByTagName('body')[0]
    body && body.classList.remove('panel-resizer-dragging')

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    if (size === flow.meta.get(id).height) {
      return
    }

    if (size === DEFAULT_RESIZER_HEIGHT) {
      return
    }

    flow.meta.update(id, {
      height: size,
    })
  }, [flow, size])

  const title = PIPE_DEFINITIONS[flow.data.get(id).type] ? (
    <FlowPanelTitle id={id} />
  ) : (
    <div className="flow-panel--editable-title">Error</div>
  )

  if (
    flow.readOnly &&
    !/^(visualization|markdown)$/.test(flow.data.get(id).type)
  ) {
    return null
  }

  return (
    <>
      <div className={panelClassName}>
        <div className="flow-panel--header">
          <div className="flow-panel--node-wrapper">
            <div className="flow-panel--node" />
          </div>
          {title}
          {!flow.readOnly && (
            <>
              <div className="flow-panel--hover-control">{controls}</div>
              <div className="flow-panel--persistent-control">
                {persistentControls}
                <FeatureFlag name="flow-debug-queries">
                  <SquareButton
                    icon={IconFont.BookCode}
                    onClick={() => printMap(id, true)}
                    color={ComponentColor.Default}
                    titleText="Debug Notebook Queries"
                    className="flows-config-panel-button"
                  />
                </FeatureFlag>
                <MenuButton id={id} />
                <FeatureFlag name="flow-sidebar" equals={false}>
                  <PanelVisibilityToggle id={id} />
                  <RemovePanelButton id={id} />
                </FeatureFlag>
              </div>
            </>
          )}
        </div>
        {isVisible && (
          <div
            className="flow-panel--body"
            ref={bodyRef}
            style={resizes ? {height: `${size}px`} : {}}
          >
            {children}
          </div>
        )}
        {isVisible && resizes && (
          <Handle
            dragRef={handleRef}
            onStartDrag={handleMouseDown}
            dragging={isDragging}
          />
        )}
      </div>
      {!flow.readOnly && <InsertCellButton id={id} />}
    </>
  )
}

export default FlowPanel
