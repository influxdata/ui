// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {Button, EmptyState} from '@influxdata/clockface'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Types
import {IconFont, ComponentSize, ComponentColor} from '@influxdata/clockface'
import {AppState} from 'src/types'

const DashboardEmpty: FC = () => {
  const history = useHistory()
  const orgID = useSelector(getOrg).id
  const dashboard = useSelector((state: AppState) => state.currentDashboard.id)

  const handleAdd = () => {
    history.push(`/orgs/${orgID}/dashboards/${dashboard}/cells/new`)
  }
  return (
    <div className="dashboard-empty">
      <EmptyState size={ComponentSize.Large}>
        <div className="dashboard-empty--graphic">
          <div className="dashboard-empty--graphic-content" />
        </div>
        <EmptyState.Text>
          This Dashboard doesn't have any <b>Cells</b>, why not add one?
        </EmptyState.Text>
        <Button
          text="Add Cell"
          size={ComponentSize.Medium}
          icon={IconFont.AddCell_New}
          color={ComponentColor.Primary}
          onClick={handleAdd}
          testID="add-cell--button"
        />
      </EmptyState>
    </div>
  )
}

export default DashboardEmpty
