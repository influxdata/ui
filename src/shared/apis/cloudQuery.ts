import {API_BASE_PATH} from 'src/shared/constants'
import {RemoteDataState, Variable} from 'src/types'
import {getStore} from 'src/store/configureStore'
import {getOrg} from 'src/organizations/selectors'
import {
  default as simpleQuery,
  status as simpleStatus,
} from 'src/shared/apis/simpleCache'

const URL = `${API_BASE_PATH}api/v2/query`

export function status(query: string, variables?: Variable[]): RemoteDataState {
  const store = getStore()
  const org = getOrg(store.getState())

  return simpleStatus(URL, org.id, query, variables)
}

export default (query: string, variables?: Variable[]) => {
  const store = getStore()
  const org = getOrg(store.getState())

  return simpleQuery(URL, org.id, query, variables)
}
