// Libraries
import React, {FC, useRef, RefObject, useState} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'
import classnames from 'classnames'

// Utils
import {event} from 'src/cloud/utils/reporting'

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
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Selectors
import {getAllVariables} from 'src/variables/selectors'

// Types
import {Cell, View, AppState} from 'src/types'

interface OwnProps {
  cell: Cell
  view: View
  onRefresh: () => void
  variables: string
  isPaused: boolean
  togglePauseCell: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps<{orgID: string}>

const CellContext: FC<Props> = ({
  view,
  history,
  location,
  cell,
  onCloneCell,
  onDeleteCell,
  onRefresh,
  isPaused,
  togglePauseCell,
  onShowOverlay,
  onDismissOverlay,
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

  const popoverContents = (onHide): JSX.Element => {
    if (view.properties.type === 'markdown') {
      return (
        <div className="cell--context-menu">
          <CellContextItem
            label="Edit Note"
            onClick={handleEditNote}
            icon={IconFont.Text_New}
            onHide={onHide}
            testID="cell-context--note"
          />
          <CellContextItem
            label="Clone"
            onClick={handleCloneCell}
            icon={IconFont.Duplicate_New}
            onHide={onHide}
            testID="cell-context--clone"
          />
          <FeatureFlag name="cloneToOtherBoards">
            <CellContextItem
              label="Move"
              onClick={() =>
                onShowOverlay(
                  'cell-copy-overlay',
                  {
                    view,
                    cell,
                  },
                  onDismissOverlay
                )
              }
              icon={IconFont.Export_New}
              onHide={onHide}
              testID="cell-context--copy"
            />
          </FeatureFlag>
          <CellContextDangerItem
            label="Delete"
            onClick={handleDeleteCell}
            icon={IconFont.Trash_New}
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
          icon={IconFont.Text_New}
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
        <CellContextDangerItem
          label="Delete"
          onClick={handleDeleteCell}
          icon={IconFont.Trash_New}
          onHide={onHide}
          testID="cell-context--delete"
        />
        <CellContextItem
          label="Refresh"
          onClick={onRefresh}
          icon={IconFont.Refresh_New}
          onHide={onHide}
          testID="cell-context--refresh"
        />
        <CellContextItem
          label={isPaused ? 'Resume' : 'Pause'}
          onClick={togglePauseCell}
          icon={isPaused ? IconFont.Play : IconFont.Pause}
          onHide={onHide}
          testID="cell-context--pause"
        />
        <FeatureFlag name="cloneToOtherBoards">
          <CellContextItem
            label="Move"
            onClick={() =>
              onShowOverlay(
                'cell-copy-overlay',
                {
                  view,
                  cell,
                },
                onDismissOverlay
              )
            }
            icon={IconFont.Export_New}
            onHide={onHide}
            testID="cell-context--copy"
          />
        </FeatureFlag>
      </div>
    )
  }

  return (
    <>
      {isPaused && (
        <button
          className={buttonClass}
          onClick={togglePauseCell}
          data-testid="cell-context--pause-resume"
        >
          <Icon glyph={IconFont.Pause} />
        </button>
      )}
      <button
        className={buttonClass}
        ref={triggerRef}
        data-testid="cell-context--toggle"
      >
        <Icon glyph={IconFont.CogSolid_New} />
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
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
}

const connector = connect(mstp, mdtp)

export default withRouter(connector(CellContext))
