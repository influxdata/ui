// Libraries
import React, {FC, useContext} from 'react'
import ReactGridLayout, {WidthProvider, Layout} from 'react-grid-layout'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'

// Components
import FlowPipe from 'src/flows/components/FlowPipe'
import PresentationPipe from 'src/flows/components/PresentationPipe'
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'
import {InfluxColors, InfluxDataLogo, Page} from '@influxdata/clockface'

import {LAYOUT_MARGIN, DASHBOARD_LAYOUT_ROW_HEIGHT} from 'src/shared/constants'

const Grid = WidthProvider(ReactGridLayout)

// This component only shows up in downloaded PNG/PDF files
const HiddenHeader: FC = () => {
  const {flow} = useContext(FlowContext)
  return (
    <div id="pipe-list-hidden-header" style={{display: 'none'}}>
      <div style={{paddingTop: '12px'}}>
        <InfluxDataLogo
          fill={InfluxColors.White}
          style={{width: '250px', height: '100px'}}
        />
      </div>
      <div style={{paddingBottom: '12px'}}>
        <Page.Title title={flow.name} />
      </div>
    </div>
  )
}

const PipeList: FC = () => {
  const {flow, updateMeta} = useContext(FlowContext)
  const {currentID} = useContext(FlowListContext)

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

    const layoutChange = grid => {
      flow.meta.allIDs.forEach(id => {
        const l = flow.meta.byID[id].layout
        const _l = grid.find(ly => ly.i === id)

        if (!_l) {
          return
        }

        if (
          !l ||
          l.x !== _l.x ||
          l.y !== _l.y ||
          l.h !== _l.h ||
          l.w !== _l.w
        ) {
          updateMeta(id, {
            layout: {
              x: _l.x,
              y: _l.y,
              w: _l.w,
              h: _l.h,
            },
          })
        }
      })
    }

    return (
      <div className="flow" id={currentID}>
        <HiddenHeader />
        <Grid
          cols={12}
          layout={layout}
          rowHeight={DASHBOARD_LAYOUT_ROW_HEIGHT}
          useCSSTransforms={false}
          containerPadding={[0, 0]}
          margin={[LAYOUT_MARGIN, LAYOUT_MARGIN]}
          onLayoutChange={layoutChange}
          draggableHandle=".cell--draggable"
          isDraggable
          isResizable
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
      </div>
    )
  }

  const _pipes = flow.data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return (
    <div className="flow" id={currentID}>
      <HiddenHeader />
      <InsertCellButton />
      {_pipes}
    </div>
  )
}

export default PipeList
