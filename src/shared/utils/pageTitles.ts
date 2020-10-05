import {getOrg} from 'src/organizations/selectors'
import {getStore} from 'src/store/configureStore'
import {CLOUD} from 'src/shared/constants'

export const pageTitleSuffixer = (pageTitles: string[]): string => {
  const state = getStore().getState()
  const org = getOrg(state)
  const environment = CLOUD ? 'InfluxDB Cloud' : 'InfluxDB'
  const titles =
    org && org.name
      ? [...pageTitles, getOrg(state).name, environment]
      : [...pageTitles, environment]

  return titles.join(' | ')
}
