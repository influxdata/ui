import {Dispatch} from 'redux'
import {getAPIBasepath} from 'src/utils/basepath'
import {VersionInfo} from 'src/types'
import {Action, setVersionInfo} from 'src/shared/actions/app'

export const fetchVersionInfo =
  () =>
  async (dispatch: Dispatch<Action>): Promise<VersionInfo> => {
    try {
      const url = `${getAPIBasepath()}/health`
      // Have to use fetch here since the oats client doesn't work with the servers option in the oss swagger
      // Ex: https://github.com/influxdata/openapi/blob/35d734671d05ba9337dd6fbd8bb5c6085482011b/contracts/oss.yml#L5887
      // The "/health" endpoint is actually not prefixed by "api/v2", but the oats client has the prefix
      const response = await fetch(url)
      const info = await response.json()

      dispatch(
        setVersionInfo({
          version: info.version,
          commit: info.commit,
        })
      )

      return info
    } catch (err) {
      console.error(err)
      dispatch(
        setVersionInfo({
          version: 'n/a',
          commit: 'n/a',
        })
      )
    }
  }
