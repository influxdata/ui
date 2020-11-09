import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  ComponentSize,
  IconFont,
  TechnoSpinner,
  Dropdown,
} from '@influxdata/clockface'
import {DashboardOverlayContext} from 'src/flows/context/dashboardOverlay'

import {getAllDashboards} from 'src/dashboards/selectors'

const DashboardDropdown: FC = () => {
  const {handleSetDashboard, selectedDashboard} = useContext(
    DashboardOverlayContext
  )

  const dashboards = useSelector(getAllDashboards)

  let buttonText = 'Loading dashboards...'

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (dashboards.length) {
    menuItems = (
      <>
        {dashboards.map(dashboard => (
          <Dropdown.Item
            key={dashboard.name}
            value={dashboard}
            onClick={dashboard => handleSetDashboard(dashboard)}
            selected={dashboard.name === selectedDashboard?.name}
            title={dashboard.name}
            wrapText={true}
          >
            {dashboard.name}
          </Dropdown.Item>
        ))}
      </>
    )
  }

  if (!selectedDashboard?.name) {
    buttonText = 'Choose a dashboard'
  } else if (selectedDashboard?.name) {
    buttonText = selectedDashboard.name
  }

  const button = (active, onClick) => (
    <Dropdown.Button onClick={onClick} active={active} icon={IconFont.Disks}>
      {buttonText}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return <Dropdown button={button} menu={menu} style={{width: '100%'}} />
}

export default DashboardDropdown
