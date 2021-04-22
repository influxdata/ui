import {Dispatch} from 'redux'
import {getFlags as getFlagsRequest} from 'src/client'
import {FlagMap} from 'src/shared/reducers/flags'
import {getAPIBasepath} from 'src/utils/basepath'
import {RemoteDataState} from 'src/types'
import {Actions, setFlags, setPublicFlags} from 'src/shared/actions/flags'

export const getFlags = () => async (
  dispatch: Dispatch<Actions>
): Promise<FlagMap> => {
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
  const url = `${getAPIBasepath()}/api/v2private/flags`
  const response = await fetch(url)
  const flags = await response.json()

  if (flags?.status && flags?.status !== 200) {
    throw new Error(flags.message)
  }

  dispatch(setPublicFlags(flags))
}
