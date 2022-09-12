import React, {FC, useState, useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Context
import {OverlayContext} from 'src/overlays/components/OverlayController'
// Clockface
import {
  Button,
  ButtonShape,
  Overlay,
  ComponentColor,
  Form,
  ComponentStatus,
  TypeAheadDropDown,
  SelectableItem,
  SelectGroup,
} from '@influxdata/clockface'

// Actions
import {createCellWithView, deleteCellAndView} from 'src/cells/actions/thunks'
import {getOverlayParams} from 'src/overlays/selectors'
import {getDashboardIDs} from 'src/dashboards/utils/getDashboardData'
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
} from 'src/shared/copy/notifications'

import {setCloneName} from 'src/utils/naming'

const CellCloneOverlay: FC = () => {
  const [otherDashboards, setOtherDashboards] = useState<Dashboard[]>([])
  const dispatch = useDispatch()
  const {id: orgID} = useSelector(getOrg)

  const currentDashboardID = useSelector(
    (state: AppState) => state.currentDashboard.id
  )

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

  const [destinationDashboardID, setDestinationDashboardID] =
    useState<string>('')
  const [removeFromCurrentBoard, setRemoveFromCurrentBoard] =
    useState<boolean>(false)

  const handleDeleteCell = (): void => {
    dispatch(deleteCellAndView(currentDashboardID, cell.id, view.id))
  }

  const copyCellToDashboard = async () => {
    const newName = setCloneName(view.name)

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

  const selectGroupOptions = [
    {
      id: 'cell-clone-move-cell',
      title: 'Move',
      removeFromCurrentBoard: removeFromCurrentBoard,
    },
    {
      id: 'cell-clone-copy-cell',
      title: 'Copy',
      removeFromCurrentBoard: !removeFromCurrentBoard,
    },
  ].map(option => (
    <SelectGroup.Option
      key={option.id}
      id={option.id}
      active={option.removeFromCurrentBoard}
      value={option.removeFromCurrentBoard}
      onClick={() => setRemoveFromCurrentBoard(prevState => !prevState)}
      testID={option.id}
    >
      {option.title}
    </SelectGroup.Option>
  ))

  const typeAheadDropdown = (
    <TypeAheadDropDown
      items={dashItems}
      onSelect={onDashSelection}
      itemTestIdPrefix="other-dashboard"
      sortNames={true}
      selectedOption={selectedDashboard as SelectableItem}
      placeholderText="Choose Dashboard"
      defaultNameText="Name this Dashboard"
      className="dashboard-clonecell--dropdownopen"
    />
  )

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Move or Copy Cell to Dashboard"
        onDismiss={onClose}
      />
      <Overlay.Body className="dashboard-clonecell--overlayopen">
        <Form.Element label="">
          <SelectGroup shape={ButtonShape.StretchToFit}>
            {selectGroupOptions}
          </SelectGroup>
        </Form.Element>
        <Form.Element
          label="Dashboard"
          helpText={`Where do you want to ${
            removeFromCurrentBoard ? 'move' : 'copy'
          } your cell to?`}
        >
          {typeAheadDropdown}
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
