import {Dispatch} from 'redux'
import {getFlags as getFlagsRequest} from 'src/client'
import {FlagMap} from 'src/shared/actions/flags'
import {RemoteDataState} from 'src/types'
import {Actions, setFlags, setPublicFlags} from 'src/shared/actions/flags'
import {CLOUD} from 'src/shared/constants'

let getCloudPublicFlags = null

if (CLOUD) {
  getCloudPublicFlags = require('src/client/cloudPrivRoutes').getFlags
}

export const getFlags =
  () =>
  async (dispatch: Dispatch<Actions>): Promise<FlagMap> => {
    try {
      dispatch(setFlags(RemoteDataState.Loading))
      const resp = await getFlagsRequest({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      dispatch(setFlags(RemoteDataState.Done, resp.data))

      return resp.data
    } catch (error) {
      console.error(error)
      dispatch(setFlags(RemoteDataState.Error, null))
    }
  }

export const getPublicFlags = () => async (dispatch: Dispatch<Actions>) => {
  if (!CLOUD) {
    return
  }
  const resp = await getCloudPublicFlags({})

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  dispatch(setPublicFlags(resp.data))
}
