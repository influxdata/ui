// Libraries
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import classnames from 'classnames'
import {
  Button,
  ComponentColor,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'

// Components
import Handle from 'src/flows/components/panel/Handle'
import FlowPanelTitle from 'src/flows/components/panel/FlowPanelTitle'
import {MenuButton} from 'src/flows/components/Sidebar'

// Constants
import {PIPE_DEFINITIONS} from 'src/flows'
import {FeatureFlag, isFlagEnabled} from 'src/shared/utils/featureFlag'

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
  const {flow, updateMeta} = useContext(FlowContext)
  const {printMap, queryDependents, getPanelQueries} =
    useContext(FlowQueryContext)
  const {id: focused} = useContext(SidebarContext)

  const isVisible = flow.meta.byID[id]?.visible

  const panelClassName = classnames('flow-panel', {
    [`flow-panel__${isVisible ? 'visible' : 'hidden'}`]: true,
    'flow-panel__focus': focused === id,
    'small-insert': isFlagEnabled('smallInsert'),
  })

  const [size, updateSize] = useState<number>(
    flow.meta.byID[id]?.height || DEFAULT_RESIZER_HEIGHT
  )
  const [isDragging, setIsDragging] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDragging === 2) {
      handleRef.current &&
        handleRef.current.classList.add('panel-resizer--drag-handle__dragging')
    }

    if (isDragging === 1) {
      handleRef.current &&
        handleRef.current.classList.remove(
          'panel-resizer--drag-handle__dragging'
        )

      if (flow.meta.byID[id].height !== size) {
        updateMeta(id, {
          height: size,
        })
      }
    }
  }, [isDragging, id]) // eslint-disable-line react-hooks/exhaustive-deps

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
    setIsDragging(2)
    const body = document.getElementsByTagName('body')[0]
    body && body.classList.add('panel-resizer-dragging')

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseUp = (): void => {
    setIsDragging(1)
    const body = document.getElementsByTagName('body')[0]
    body && body.classList.remove('panel-resizer-dragging')

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    if (size === flow.meta.byID[id]?.height) {
      return
    }

    if (size === DEFAULT_RESIZER_HEIGHT) {
      return
    }

    updateMeta(id, {
      height: size,
    })
  }, [flow, size])

  const title = PIPE_DEFINITIONS[flow.data.byID[id]?.type] ? (
    <FlowPanelTitle id={id} />
  ) : (
    <div className="flow-panel--editable-title">Error</div>
  )

  const showPreviewButton = useMemo(
    () => !!getPanelQueries(id)?.visual,
    [getPanelQueries, id]
  )

  if (
    flow.readOnly &&
    !/^(visualization|markdown)$/.test(flow.data.byID[id]?.type)
  ) {
    return null
  }

  return (
    <div className={panelClassName} id={id}>
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
                  onClick={() => printMap(id)}
                  color={ComponentColor.Default}
                  titleText="Debug Notebook Queries"
                  className="flows-config-panel-button"
                />
              </FeatureFlag>
              {isVisible && showPreviewButton && (
                <Button
                  onClick={() => queryDependents(id)}
                  icon={IconFont.Play}
                  text="Run"
                />
              )}
              <MenuButton id={id} />
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
      <div className="flow-panel--footer">
        <div></div>
        {isVisible && resizes && (
          <Handle
            dragRef={handleRef}
            onStartDrag={handleMouseDown}
            dragging={isDragging === 2}
          />
        )}
      </div>
    </div>
  )
}

export default FlowPanel
