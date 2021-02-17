import React, {FC, useContext, useEffect, useState} from 'react'
import {ComponentSize, TechnoSpinner, Dropdown} from '@influxdata/clockface'
import {
  Context,
  CREATE_CELL,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'
import {ComponentStatus} from 'src/clockface'
import {getDashboard, CellsWithViewProperties} from 'src/client'
import {viewsFromCells} from 'src/schemas/dashboards'
import {View} from 'src/types'

const getViewsForDashboard = async (dashboardID: string) => {
  try {
    const resp = await getDashboard({
      dashboardID,
      query: {include: 'properties'},
    })
    if (!resp) {
      return
    }

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }
    const cellViews: CellsWithViewProperties = resp.data.cells || []
    const viewsData = [
      {
        name: 'Create New',
        id: CREATE_CELL,
      } as View,
      ...(await viewsFromCells(cellViews, resp.data.id)),
    ]
    return viewsData
  } catch (error) {
    console.error('error; ', error)
    return []
  }
}

const CellsDropdown: FC = () => {
  const {handleSetCell, selectedDashboard, selectedCell} = useContext(Context)

  const [cells, setCells] = useState([])

  useEffect(() => {
    if (selectedDashboard) {
      getViewsForDashboard(selectedDashboard.id).then(res => {
        setCells(res)
      })
    }
  }, [selectedDashboard])

  let buttonText = 'Loading cells...'

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (cells.length) {
    menuItems = (
      <>
        {cells.map((cell, i) => (
          <Dropdown.Item
            key={`${cell.name}${i}`}
            value={cell}
            onClick={cell => handleSetCell(cell)}
            selected={cell.name === selectedCell?.name}
            title={cell.name}
            wrapText={true}
          >
            {cell.name}
          </Dropdown.Item>
        ))}
      </>
    )
  }

  if (!selectedCell?.name) {
    buttonText = 'Choose a cell'
  } else if (selectedCell?.name) {
    buttonText = selectedCell.name
  }

  const button = (active, onClick) => (
    <Dropdown.Button
      size={ComponentSize.Medium}
      onClick={onClick}
      active={active}
      status={
        selectedDashboard ? ComponentStatus.Default : ComponentStatus.Disabled
      }
    >
      {buttonText}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return <Dropdown button={button} menu={menu} style={{width: '100%'}} />
}

export default CellsDropdown
