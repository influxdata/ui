// Libraries
import React, {FC, useContext, useCallback, ReactNode} from 'react'
import classnames from 'classnames'
import {ComponentColor, IconFont, SquareButton} from '@influxdata/clockface'

// Components
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
import {FlowQueryContext} from 'src/flows/context/flow.query'

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
  const {generateMap} = useContext(FlowQueryContext)
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

  // This function allows the developer to see the queries
  // that the panels are generating through a notebook. Each
  // panel should have a source query, any panel that needs
  // to display some data should have a visualization query
  const printMap = useCallback(() => {
    // Make a dictionary of all the panels that have queries being generated
    const stages = generateMap(true).reduce((acc, curr) => {
      curr.instances.forEach(i => {
        acc[i.id] = {
          source: curr.text,
          visualization: i.modifier,
        }
      })

      return acc
    }, {})

    /* eslint-disable no-console */
    // Grab all the ids in the order that they're presented
    flow.data.allIDs.forEach(i => {
      console.log(
        `\n\n%cPanel: %c ${i}`,
        'font-family: sans-serif; font-size: 16px; font-weight: bold; color: #000',
        i === id
          ? 'font-weight: bold; font-size: 16px; color: #666'
          : 'font-weight: normal; font-size: 16px; color: #888'
      )

      // throw up some red text if a panel isn't passing along the source query
      if (!stages[i]) {
        console.log(
          '%c *** No Queries Registered ***\n',
          'font-family: sans-serif; font-size: 16px; font-weight: bold; color: #F00'
        )
        return
      }

      console.log(
        `%c Source Query: \n%c ${stages[i].source}`,
        'font-family: sans-serif; font-weight: bold; font-size: 14px; color: #666',
        'font-family: monospace; color: #888'
      )
      console.log(
        `%c Visualization Query: \n%c ${stages[i].visualization}\n`,
        'font-family: sans-serif; font-weight: bold; font-size: 14px; color: #666',
        'font-family: monospace; color: #888'
      )
    })
    /* eslint-enable no-console */
  }, [id])

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
            <FeatureFlag name="flow-debug-queries">
              <SquareButton
                icon={IconFont.BookCode}
                onClick={printMap}
                color={ComponentColor.Default}
                titleText="Debug Notebook Queries"
              />
            </FeatureFlag>
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

  const isVisible = flow.meta.get(id).visible

  const panelClassName = classnames('flow-panel', {
    [`flow-panel__visible`]: isVisible,
    [`flow-panel__hidden`]: !isVisible,
    'flow-panel__focus': true,
  })

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
      <div className={panelClassName}>
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
      {!flow.readOnly && <InsertCellButton id={id} />}
    </>
  )
}

export default FlowPanel
