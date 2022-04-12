import {FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'

const RouteToDashboardList: FC = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()
  history.push(`/orgs/${orgID}/dashboards-list`)
  return null
}

export default RouteToDashboardList
