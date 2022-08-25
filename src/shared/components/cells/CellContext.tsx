// Libraries
import React, {FC, memo, useRef, RefObject, useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
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

// Actions
import {deleteCellAndView, createCellWithView} from 'src/cells/actions/thunks'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Types
import {Cell, View} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  cell: Cell
  view: View
  onRefresh: () => void
  isPaused: boolean
  togglePauseCell: () => void
}

const CellContext: FC<Props> = ({
  view,
  cell,
  onRefresh,
  isPaused,
  togglePauseCell,
}) => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const [popoverVisible, setPopoverVisibility] = useState<boolean>(false)
  const editNoteText = !!get(view, 'properties.note') ? 'Edit Note' : 'Add Note'
  const triggerRef: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(
    null
  )
  const buttonClass = classnames('cell--context', {
    'cell--context__active': popoverVisible,
  })

  const handleCloneCell = () => {
    dispatch(createCellWithView(cell.dashboardID, view, cell))
  }

  const handleDeleteCell = (): void => {
    const viewID = view.id
    const {dashboardID, id} = cell

    dispatch(deleteCellAndView(dashboardID, id, viewID))
  }

  const handleEditNote = () => {
    if (view.id) {
      history.push(`${location.pathname}/notes/${view.id}/edit`)
    } else {
      history.push(`${location.pathname}/notes/new`)
    }
  }

  const handleEditCell = (): void => {
    event('editCell button Click')
    if (isFlagEnabled('createWithDE')) {
      history.push(
        `/orgs/${org.id}/data-explorer/from/dashboard/${cell.dashboardID}/cell/${cell.id}`
      )
      return
    }
    history.push(`${location.pathname}/cells/${cell.id}/edit`)
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
          <CellContextItem
            label="Move"
            onClick={() =>
              dispatch(
                showOverlay(
                  'cell-copy-overlay',
                  {
                    view,
                    cell,
                  },
                  () => dispatch(dismissOverlay())
                )
              )
            }
            icon={IconFont.Export_New}
            onHide={onHide}
            testID="cell-context--copy"
          />
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
          icon={IconFont.Duplicate_New}
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
        <CellContextItem
          label="Move"
          onClick={() =>
            dispatch(
              showOverlay(
                'cell-copy-overlay',
                {
                  view,
                  cell,
                },
                () => dispatch(dismissOverlay())
              )
            )
          }
          icon={IconFont.Export_New}
          onHide={onHide}
          testID="cell-context--copy"
        />
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

export default memo(CellContext)
