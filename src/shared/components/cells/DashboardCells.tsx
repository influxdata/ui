// Libraries
import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import ReactGridLayout, {WidthProvider, Layout} from 'react-grid-layout'

import {
  Page,
  SpinnerContainer,
  TechnoSpinner,
  RemoteDataState,
} from '@influxdata/clockface'

// Components
const Grid = WidthProvider(ReactGridLayout)
import CellComponent from 'src/shared/components/cells/Cell'
import GradientBorder from 'src/shared/components/cells/GradientBorder'
import ScrollDetector from 'src/perf/components/ScrollDetector'
import DashboardEmpty from 'src/dashboards/components/dashboard_empty/DashboardEmpty'

// Actions
import {updateCells} from 'src/cells/actions/thunks'

// Selectors
import {getCells} from 'src/cells/selectors'

// Constants
import {LAYOUT_MARGIN, DASHBOARD_LAYOUT_ROW_HEIGHT} from 'src/shared/constants'

// Types
import {AppState, Cell} from 'src/types'

import {ErrorHandling} from 'src/shared/decorators/errors'

interface OwnProps {
  manualRefresh: number
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

@ErrorHandling
class DashboardCellsUnconnected extends Component<Props> {
  public render() {
    const {cells, status} = this.props

    return (
      <SpinnerContainer loading={status} spinnerComponent={<TechnoSpinner />}>
        <Page.Contents fullWidth={true} scrollable={true} className="dashboard">
          {!cells.length ? (
            <DashboardEmpty />
          ) : (
            <>
              <ScrollDetector component="dashboard" />
              <Grid
                cols={12}
                layout={this.cells}
                rowHeight={DASHBOARD_LAYOUT_ROW_HEIGHT}
                useCSSTransforms={false}
                containerPadding={[0, 0]}
                margin={[LAYOUT_MARGIN, LAYOUT_MARGIN]}
                onLayoutChange={this.handleLayoutChange}
                draggableHandle=".cell--draggable"
                isDraggable
                isResizable
              >
                {this.renderCells()}
              </Grid>
            </>
          )}
          {/* This element is used as a portal container for note tooltips in cell headers */}
          <div className="cell-header-note-tooltip-container" />
        </Page.Contents>
      </SpinnerContainer>
    )
  }

  private renderCells = () => {
    const renderedCells = new Array(this.props.cells.length)
    for (let i = 0; i < this.props.cells.length; i++) {
      const cell = this.props.cells[i]

      renderedCells[i] = (
        <div
          key={cell.id}
          className="cell"
          data-testid={`cell ${this.props.views[cell.id]?.name}`}
        >
          <CellComponent cell={cell} manualRefresh={this.props.manualRefresh} />
          <GradientBorder />
        </div>
      )
    }
    return renderedCells
  }

  private get cells(): Layout[] {
    const layoutCells = []
    for (let i = 0; i < this.props.cells.length; i++) {
      const cell = this.props.cells[i] as any

      if (cell.status !== RemoteDataState.Done) {
        continue
      }

      cell.i = cell.id

      const view = this.props.views[cell.id]
      if (view?.properties?.type === 'gauge') {
        cell.minW = 2.5
        cell.minH = 2.5
        cell.maxW = 20
      }
      if (view?.properties?.type === 'simple-table') {
        cell.minW = 5
        cell.minH = 5
      }

      layoutCells.push(cell)
    }
    return layoutCells
  }

  private handleLayoutChange = grid => {
    const {cells} = this.props

    let cellLayoutChanged = false

    const newCells = cells.map(cell => {
      const newCellLayout = grid.find(layoutCell => layoutCell.i === cell.id)
      if (
        cell.x !== newCellLayout.x ||
        cell.y !== newCellLayout.y ||
        cell.h !== newCellLayout.h ||
        cell.w !== newCellLayout.w
      ) {
        cellLayoutChanged = true

        cell.x = newCellLayout.x
        cell.y = newCellLayout.y
        cell.h = newCellLayout.h
        cell.w = newCellLayout.w
      }

      return cell
    })

    if (cellLayoutChanged) {
      this.handlePositionChange(newCells)
    }
  }
  private handlePositionChange = (cells: Cell[]) => {
    const {dashboardId, updateCells} = this.props
    updateCells(dashboardId, cells)
  }
}
const mstp = (state: AppState) => {
  const dashboardId = state.currentDashboard.id

  return {
    dashboardId,
    cells: getCells(state, dashboardId),
    views: state.resources.views.byID,
    status: state.resources.cells.status,
  }
}
const mdtp = {
  updateCells: updateCells,
}

const connector = connect(mstp, mdtp)

export const DashboardCells = connector(DashboardCellsUnconnected)
