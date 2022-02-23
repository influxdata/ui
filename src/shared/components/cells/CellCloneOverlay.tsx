import React, {FC, useState, useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Context
import {OverlayContext} from 'src/overlays/components/OverlayController'
// Clockface
import {
  Button,
  Overlay,
  ComponentColor,
  InputLabel,
  SlideToggle,
  Form,
  ComponentStatus,
  TypeAheadDropDown,
  SelectableItem,
} from '@influxdata/clockface'

// Actions
import {createCellWithView, deleteCellAndView} from 'src/cells/actions/thunks'
import {getOverlayParams} from 'src/overlays/selectors'
import {
  getDashboardIDs,
  getNewDashboardViewNames,
} from 'src/dashboards/utils/getDashboardData'
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'

// Metrics
import {event} from 'src/cloud/utils/reporting'
import {Dashboard} from 'src/client'
import {notify} from 'src/shared/actions/notifications'
import {
  dashboardsGetFailed,
  cellCloneSuccess,
  cellCopyFailed,
} from 'src/shared/copy/notifications'

import {incrementCloneName} from 'src/utils/naming'

const CellCloneOverlay: FC = () => {
  const [otherDashboards, setOtherDashboards] = useState<Dashboard[]>([])
  const dispatch = useDispatch()
  const {id: orgID} = useSelector(getOrg)

  const currentDashboardID = useSelector(
    (state: AppState) => state.currentDashboard.id
  )

  const allViews =
    useSelector((state: AppState) => state.resources.views.byID) ?? {}

  useEffect(() => {
    getDashboardIDs(orgID)
      .then(retrievedBoards => {
        setOtherDashboards(
          retrievedBoards.filter(board => board.id !== currentDashboardID)
        )
      })
      .catch(err => {
        event('dashboards.cloneCell.getDashboardsFailed', {
          context: JSON.stringify(err),
        })
        dispatch(notify(dashboardsGetFailed(err)))
      })
  }, [])

  const {onClose} = useContext(OverlayContext)

  const {view, cell} = useSelector(getOverlayParams)

  const [destinationDashboardID, setDestinationDashboardID] = useState<string>(
    ''
  )
  const [removeFromCurrentBoard, setRemoveFromCurrentBoard] = useState<boolean>(
    false
  )

  const handleDeleteCell = (): void => {
    dispatch(deleteCellAndView(currentDashboardID, cell.id, view.id))
  }

  const copyCellToDashboard = async () => {
    let destinationViewNames
    const viewsForDashboard = Object.values(allViews)?.filter(
      view => view.dashboardID === destinationDashboardID
    )

    if (!viewsForDashboard?.length) {
      try {
        destinationViewNames = await getNewDashboardViewNames(
          destinationDashboardID
        )
      } catch (err) {
        dispatch(notify(cellCopyFailed(err.message)))
        return
      }
    } else {
      destinationViewNames = viewsForDashboard.map(v => v.name)
    }

    const newName = incrementCloneName(
      destinationViewNames ?? [view.name],
      view.name
    )

    await dispatch(
      createCellWithView(
        destinationDashboardID,
        {
          ...view,
          dashboardID: destinationDashboardID,
          name: newName,
        },
        {
          ...cell,
          dashboardID: destinationDashboardID,
          name: newName,
        },
        null,
        null,
        true
      )
    )
    dispatch(
      notify(
        cellCloneSuccess(
          destinationDashboardID,
          removeFromCurrentBoard ? 'moved' : 'copied',
          cell.name ?? null
        )
      )
    )
  }

  const selectedDashboard = otherDashboards.find(
    d => d.id === destinationDashboardID
  )

  const dashItems = otherDashboards as SelectableItem[]

  const onDashSelection = item => {
    setDestinationDashboardID(item?.id)
  }

  const typeAheadDropdown = (
    <TypeAheadDropDown
      items={dashItems}
      onSelect={onDashSelection}
      buttonTestId="clone-to-other-dashboard"
      menuTestID="copy-dashboard-cell--dropdown-menu"
      itemTestIdPrefix="other-dashboard"
      sortNames={true}
      selectedOption={selectedDashboard as SelectableItem}
      placeholderText="Choose a Destination Dashboard"
      defaultNameText="Name this Dashboard"
    />
  )

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Move or Copy Cell to Dashboard"
        onDismiss={onClose}
      />
      <Overlay.Body className="dashboard-clonecell--overlayopen">
        <Form.Element label="" className="dashboard-clonecell--dropdownopen">
          {typeAheadDropdown}
        </Form.Element>
        <Form.Element label="" className="dashboard-clonecell--removecurrent">
          <span className="dashboard-clonecell--movetype">Move type: </span>
          <InputLabel
            active={!removeFromCurrentBoard}
            className="refresh-form-time-label"
          >
            Copy
          </InputLabel>
          <SlideToggle
            active={removeFromCurrentBoard}
            onChange={() => setRemoveFromCurrentBoard(!removeFromCurrentBoard)}
            testID="clone-cell-type-toggle"
            className="dashboard-clonecell--typetoggle"
          />
          <InputLabel
            active={removeFromCurrentBoard}
            className="refresh-form-time-label"
          >
            Move
          </InputLabel>
        </Form.Element>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          onClick={() => {
            onClose()
          }}
          color={ComponentColor.Tertiary}
          text="Cancel"
          testID="copy-cell-cancel-button"
        />
        <Button
          onClick={() => {
            event('relocating cell', {
              operationType: removeFromCurrentBoard ? 'Move' : 'Copy',
            })

            copyCellToDashboard()
            if (removeFromCurrentBoard) {
              handleDeleteCell()
            }
            onClose()
          }}
          color={ComponentColor.Primary}
          text="Confirm"
          testID="confirm-clone-cell-button"
          status={
            !otherDashboards.length
              ? ComponentStatus.Disabled
              : ComponentStatus.Default
          }
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default CellCloneOverlay
