// Libraries
import React, {FC, useRef, RefObject, useState} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'
import classnames from 'classnames'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {
  resetQueryCacheByQuery,
  getFromQueryCacheByQuery,
  togglePauseQuery,
} from 'src/shared/apis/queryCache'

// Components
import {
  Popover,
  Appearance,
  Icon,
  IconFont,
  PopoverInteraction,
} from '@influxdata/clockface'
import CellContextItem from 'src/shared/components/cells/CellContextItem'
import CellContextDangerItem from 'src/shared/components/cells/CellContextDangerItem'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Actions
import {deleteCellAndView, createCellWithView} from 'src/cells/actions/thunks'

// Selectors
import {getAllVariables} from 'src/variables/selectors'

// Types
import {
  Cell,
  View,
  ViewProperties,
  MarkdownViewProperties,
  AppState,
} from 'src/types'

interface OwnProps {
  cell: Cell
  view: View
  onCSVDownload: () => void
  onRefresh: () => void
  variables: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps<{orgID: string}>

const CellContext: FC<Props> = ({
  view,
  history,
  location,
  cell,
  variables,
  onCloneCell,
  onDeleteCell,
  onCSVDownload,
  onRefresh,
}) => {
  const [popoverVisible, setPopoverVisibility] = useState<boolean>(false)
  const editNoteText = !!get(view, 'properties.note') ? 'Edit Note' : 'Add Note'
  const triggerRef: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(
    null
  )
  const buttonClass = classnames('cell--context', {
    'cell--context__active': popoverVisible,
  })

  const handleCloneCell = () => {
    onCloneCell(cell.dashboardID, view, cell)
  }

  const handleDeleteCell = (): void => {
    const viewID = view.id
    const {dashboardID, id} = cell

    onDeleteCell(dashboardID, id, viewID)
  }

  const handleEditNote = () => {
    if (view.id) {
      history.push(`${location.pathname}/notes/${view.id}/edit`)
    } else {
      history.push(`${location.pathname}/notes/new`)
    }
  }

  const handleEditCell = (): void => {
    history.push(`${location.pathname}/cells/${cell.id}/edit`)
    event('editCell button Click')
  }

  const refreshCell = (): void => {
    const viewWithQueries = view as View<
      Exclude<ViewProperties, MarkdownViewProperties>
    >
    if (
      Array.isArray(viewWithQueries.properties?.queries) &&
      viewWithQueries.properties.queries.length
    ) {
      for (const query of viewWithQueries.properties.queries) {
        resetQueryCacheByQuery(query.text)
      }
    }
    onRefresh()
  }

  const togglePauseCell = (): void => {
    const viewWithQueries = view as View<
      Exclude<ViewProperties, MarkdownViewProperties>
    >
    if (
      Array.isArray(viewWithQueries.properties?.queries) &&
      viewWithQueries.properties.queries.length
    ) {
      for (const query of viewWithQueries.properties.queries) {
        const returnedQuery = getFromQueryCacheByQuery(query.text, variables)
        if (returnedQuery) {
          const toggled = togglePauseQuery(returnedQuery)
          console.log(toggled)
        }
      }
    }
  }

  const popoverContents = (onHide): JSX.Element => {
    if (view.properties.type === 'markdown') {
      return (
        <div className="cell--context-menu">
          <CellContextItem
            label="Edit Note"
            onClick={handleEditNote}
            icon={IconFont.TextBlock}
            onHide={onHide}
            testID="cell-context--note"
          />
          <CellContextDangerItem
            label="Delete"
            onClick={handleDeleteCell}
            icon={IconFont.Trash}
            onHide={onHide}
            testID="cell-context--delete"
          />
        </div>
      )
    }

    return (
      <div className="cell--context-menu">
        <CellContextItem
          label="Configure"
          onClick={handleEditCell}
          icon={IconFont.Pencil}
          onHide={onHide}
          testID="cell-context--configure"
        />
        <CellContextItem
          label={editNoteText}
          onClick={handleEditNote}
          icon={IconFont.TextBlock}
          onHide={onHide}
          testID="cell-context--note"
        />
        <CellContextItem
          label="Clone"
          onClick={handleCloneCell}
          icon={IconFont.Duplicate}
          onHide={onHide}
          testID="cell-context--clone"
        />
        <FeatureFlag name="downloadCellCSV">
          <CellContextItem
            label="Download CSV"
            onClick={onCSVDownload}
            icon={IconFont.Download}
            onHide={onHide}
            testID="cell-context--download"
          />
        </FeatureFlag>
        <CellContextDangerItem
          label="Delete"
          onClick={handleDeleteCell}
          icon={IconFont.Trash}
          onHide={onHide}
          testID="cell-context--delete"
        />
        <FeatureFlag name="refreshSingleCell">
          <CellContextItem
            label="Refresh"
            onClick={refreshCell}
            icon={IconFont.Refresh}
            onHide={onHide}
            testID="cell-context--refresh"
          />
        </FeatureFlag>
        <FeatureFlag name="pauseCell">
          <CellContextItem
            label="Pause"
            onClick={() => {
              console.log('pause')
              togglePauseCell()
            }}
            icon={IconFont.Pause}
            onHide={onHide}
            testID="cell-context--pause"
          />
        </FeatureFlag>
      </div>
    )
  }

  return (
    <>
      <button
        className={buttonClass}
        ref={triggerRef}
        data-testid="cell-context--toggle"
      >
        <Icon glyph={IconFont.CogThick} />
      </button>
      <Popover
        appearance={Appearance.Outline}
        enableDefaultStyles={false}
        showEvent={PopoverInteraction.Click}
        hideEvent={PopoverInteraction.Click}
        triggerRef={triggerRef}
        contents={popoverContents}
        onShow={() => {
          setPopoverVisibility(true)
        }}
        onHide={() => {
          setPopoverVisibility(false)
        }}
      />
    </>
  )
}

const mstp = (state: AppState) => ({
  variables: getAllVariables(state),
})
const mdtp = {
  onDeleteCell: deleteCellAndView,
  onCloneCell: createCellWithView,
}

const connector = connect(mstp, mdtp)

export default withRouter(connector(CellContext))
