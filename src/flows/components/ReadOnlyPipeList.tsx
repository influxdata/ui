// Libraries
import React, {FC, useContext, useMemo, createElement} from 'react'
import ReactGridLayout, {WidthProvider, Layout} from 'react-grid-layout'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {SidebarContext} from 'src/flows/context/sidebar'
import {PipeProvider} from 'src/flows/context/pipe'
import Pipe from 'src/flows/components/Pipe'

// Components
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import PresentationPipe from 'src/flows/components/PresentationPipe'

import {
  Props,
  DEFAULT_RESIZER_HEIGHT,
} from 'src/flows/components/panel/FlowPanel'
import {FlowPipeProps} from 'src/flows/components/FlowPipe'
import {PipeContextProps} from 'src/types/flows'
import {LAYOUT_MARGIN, DASHBOARD_LAYOUT_ROW_HEIGHT} from 'src/shared/constants'
const Grid = WidthProvider(ReactGridLayout)

const FlowPanel: FC<Props> = ({id, children, resizes}) => {
  const {flow} = useContext(FlowContext)
  const {id: focused} = useContext(SidebarContext)

  const isVisible = flow.meta.byID[id].visible

  const panelClassName = [
    ['flow-panel', true],
    ['flow-panel__readonly', true],
    [`flow-panel__${isVisible ? 'visible' : 'hidden'}`, true],
    ['flow-panel__focus', focused === id],
  ]
    .filter(c => !!c[1])
    .map(c => c[0])
    .join(' ')

  return (
    <div className={panelClassName} style={{marginBottom: '4px'}}>
      <div className="flow-panel--header">
        <div className="flow-panel--title">{flow.meta.byID[id].title}</div>
      </div>
      {isVisible && (
        <div
          className="flow-panel--body"
          style={
            resizes
              ? {height: flow.meta.byID[id]?.height ?? DEFAULT_RESIZER_HEIGHT}
              : {}
          }
        >
          {children}
        </div>
      )}
      <div className="flow-panel--footer">
        <div></div>
      </div>
    </div>
  )
}

const FlowPipe: FC<FlowPipeProps> = ({id}) => {
  const panel: FC<PipeContextProps> = useMemo(
    () => props => {
      const _props = {
        ...props,
        id,
      }

      return createElement(FlowPanel, _props)
    },
    [id]
  )

  return (
    <PipeProvider id={id}>
      <Pipe Context={panel} readOnly />
    </PipeProvider>
  )
}

const ReadOnlyPipeList: FC = () => {
  const {flow} = useContext(FlowContext)

  if (!flow.data || !flow.data.allIDs.length) {
    return <EmptyPipeList />
  }

  if (flow.readOnly) {
    const layout = flow.data.allIDs
      .filter(
        id =>
          /^(visualization|markdown)$/.test(flow.data.byID[id]?.type) &&
          flow.meta.byID[id].visible
      )
      .map(
        id =>
          ({
            i: id,
            ...(flow.meta.byID[id].layout || {
              y: 0,
              x: 0,
              w: 12,
              h: 3,
            }),
          } as Layout)
      )

    return (
      <Grid
        cols={12}
        layout={layout}
        rowHeight={DASHBOARD_LAYOUT_ROW_HEIGHT}
        useCSSTransforms={false}
        containerPadding={[0, 0]}
        margin={[LAYOUT_MARGIN, LAYOUT_MARGIN]}
        isDraggable={false}
        isResizable={false}
        draggableHandle=".cell--draggable"
      >
        {flow.data.allIDs
          .filter(
            id =>
              /^(visualization|markdown)$/.test(flow.data.byID[id]?.type) &&
              flow.meta.byID[id].visible
          )
          .map(id => (
            <div
              key={id}
              className="cell"
              data-testid={`cell ${flow.meta.byID[id].title}`}
            >
              <PresentationPipe id={id} />
            </div>
          ))}
      </Grid>
    )
  }
  const _pipes = flow.data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return <div className="flow">{_pipes}</div>
}

export default ReadOnlyPipeList
