import {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {getOrg} from 'src/organizations/selectors'

const RouteToDashboardList: FC = () => {
  const history = useHistory()
  const org = useSelector(getOrg)

  history.push(`/orgs/${org.id}/dashboards-list`)
  return null
}

export default RouteToDashboardList
