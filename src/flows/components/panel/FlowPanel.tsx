// Libraries
import React, {
  FC,
  useContext,
  useCallback,
  useEffect,
  ReactNode,
  MouseEvent,
  useRef,
} from 'react'
import classnames from 'classnames'

// Components
import {ClickOutside} from '@influxdata/clockface'
import RemovePanelButton from 'src/flows/components/panel/RemovePanelButton'
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'
import PanelVisibilityToggle from 'src/flows/components/panel/PanelVisibilityToggle'
import MovePanelButton from 'src/flows/components/panel/MovePanelButton'
import FlowPanelTitle from 'src/flows/components/panel/FlowPanelTitle'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import Results from 'src/flows/components/panel/Results'
import {PIPE_DEFINITIONS} from 'src/flows'

// Types
import {PipeContextProps} from 'src/types/flows'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {RefContext} from 'src/flows/context/refs'

export interface Props extends PipeContextProps {
  id: string
  persistentControl?: ReactNode
}

export interface HeaderProps {
  id: string
  controls?: ReactNode
  persistentControl?: ReactNode
}

const FlowPanelHeader: FC<HeaderProps> = ({
  id,
  controls,
  persistentControl,
}) => {
  const {flow} = useContext(FlowContext)
  const removePipe = () => {
    flow.data.remove(id)
    flow.meta.remove(id)
  }
  const index = flow.data.indexOf(id)
  const canBeMovedUp = index > 0
  const canBeMovedDown = index < flow.data.allIDs.length - 1

  const moveUp = useCallback(() => {
    if (canBeMovedUp) {
      flow.data.move(id, index - 1)
    }
  }, [index, canBeMovedUp, flow.data])

  const moveDown = useCallback(() => {
    if (canBeMovedDown) {
      flow.data.move(id, index + 1)
    }
  }, [index, canBeMovedDown, flow.data])

  const title = PIPE_DEFINITIONS[flow.data.get(id).type] ? (
    <FlowPanelTitle id={id} />
  ) : (
    <div className="flow-panel--editable-title">Error</div>
  )

  const remove = useCallback(() => removePipe(), [removePipe, id])
  return (
    <div className="flow-panel--header">
      <div className="flow-panel--node-wrapper">
        <div className="flow-panel--node" />
      </div>
      {title}
      {!flow.readOnly && (
        <>
          <div className="flow-panel--hover-control">
            {controls}
            <FeatureFlag name="flow-move-cells">
              <MovePanelButton
                direction="up"
                onClick={moveUp}
                active={canBeMovedUp}
              />
              <MovePanelButton
                direction="down"
                onClick={moveDown}
                active={canBeMovedDown}
              />
            </FeatureFlag>
          </div>
          <div className="flow-panel--persistent-control">
            <PanelVisibilityToggle id={id} />
            <RemovePanelButton onRemove={remove} />
            {persistentControl}
          </div>
        </>
      )}
    </div>
  )
}

const FlowPanel: FC<Props> = ({id, children, controls, persistentControl}) => {
  const {flow} = useContext(FlowContext)
  const refs = useContext(RefContext)
  const panelRef = useRef<HTMLDivElement>(null)

  const isVisible = flow.meta.get(id).visible
  const isFocused = refs.get(id).focus

  const panelClassName = classnames('flow-panel', {
    [`flow-panel__visible`]: isVisible,
    [`flow-panel__hidden`]: !isVisible,
    'flow-panel__focus': isFocused,
  })

  useEffect(() => {
    refs.update(id, {panel: panelRef})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updatePanelFocus = useCallback(
    (focus: boolean): void => {
      refs.update(id, {focus})
    },
    [id, refs] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation()
    updatePanelFocus(true)
  }

  const handleClickOutside = (): void => {
    updatePanelFocus(false)
  }

  const showResults =
    PIPE_DEFINITIONS[flow.data.get(id).type] &&
    ['inputs', 'transform'].includes(
      PIPE_DEFINITIONS[flow.data.get(id).type].family
    )

  if (
    flow.readOnly &&
    !/^(visualization|markdown)$/.test(flow.data.get(id).type)
  ) {
    return null
  }

  return (
    <>
      <ClickOutside onClickOutside={handleClickOutside}>
        <div className={panelClassName} onClick={handleClick} ref={panelRef}>
          <FlowPanelHeader
            id={id}
            controls={controls}
            persistentControl={persistentControl}
          />
          {isVisible && <div className="flow-panel--body">{children}</div>}
          {showResults && (
            <div className="flow-panel--results">
              <Results />
            </div>
          )}
        </div>
      </ClickOutside>
      {!flow.readOnly && <InsertCellButton id={id} />}
    </>
  )
}

export default FlowPanel
