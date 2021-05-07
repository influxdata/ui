// Libraries
import React, {FC, useContext} from 'react'
import classnames from 'classnames'
import {ComponentColor, IconFont, SquareButton} from '@influxdata/clockface'

// Components
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'
import FlowPanelTitle from 'src/flows/components/panel/FlowPanelTitle'
import Results from 'src/flows/components/panel/Results'
import {PIPE_DEFINITIONS} from 'src/flows'

// Types
import {PipeContextProps} from 'src/types/flows'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {Context as SidebarContext} from 'src/flows/context/sidebar'
import {FlowQueryContext} from 'src/flows/context/flow.query'

export interface Props extends PipeContextProps {
  id: string
}

export interface HeaderProps {
  id: string
}

const FlowPanel: FC<Props> = ({id, children, controls}) => {
  const {flow} = useContext(FlowContext)
  const {generateMap} = useContext(FlowQueryContext)
  const {id: focused, show, hide} = useContext(SidebarContext)

  const isVisible = flow.meta.get(id).visible

  const panelClassName = classnames('flow-panel', {
    [`flow-panel__visible`]: isVisible,
    [`flow-panel__hidden`]: !isVisible,
    'flow-panel__focus': focused === id,
  })

  const showResults =
    PIPE_DEFINITIONS[flow.data.get(id).type] &&
    ['inputs', 'transform'].includes(
      PIPE_DEFINITIONS[flow.data.get(id).type].family
    )

  const toggleSidebar = () => {
    if (id !== focused) {
      show(id, controls)
    } else {
      hide()
    }
  }

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
          <FeatureFlag name="flow-debug-queries">
            <SquareButton
              icon={IconFont.BookCode}
              onClick={printMap}
              color={ComponentColor.Default}
              titleText="Debug Notebook Queries"
            />
          </FeatureFlag>
          <SquareButton
            icon={IconFont.CogThick}
            onClick={toggleSidebar}
            color={
              id === focused ? ComponentColor.Secondary : ComponentColor.Default
            }
            titleText="Configure"
            className="flows-config-panel-button"
          />
        </div>
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
