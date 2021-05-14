import {Dispatch} from 'redux'
import {getAPIBasepath} from 'src/utils/basepath'
import {VersionInfo} from 'src/types'
import {Action, setVersionInfo} from 'src/shared/actions/app'

export const fetchVersionInfo = () => async (
  dispatch: Dispatch<Action>
): Promise<VersionInfo> => {
  try {
    const url = `${getAPIBasepath()}/health`
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
