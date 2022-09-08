// Libraries
import {Dispatch} from 'react'
import {get} from 'lodash'

// API
import {FluxdocsArray, getFluxdocs} from 'src/client/fluxdocsdRoutes'

// Actions
import {getFluxPackagesFailed} from 'src/shared/copy/notifications/categories/alerts'
import {notify} from 'src/shared/actions/notifications'

// Types
import {NotificationAction} from 'src/types'

export const GET_FLUX_DOCS = 'GET_FLUX_DOCS'

export type Action = ReturnType<typeof setFluxFunc>

export const setFluxFunc = (data: FluxdocsArray) => ({
  type: GET_FLUX_DOCS,
  payload: {
    data,
  },
})

export const getFluxPackages =
  () => async (dispatch: Dispatch<Action | NotificationAction>) => {
    try {
      const resp = await getFluxdocs({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      dispatch(setFluxFunc(resp.data))
    } catch (error) {
      console.error(error)
      const message = get(error, 'response.data.message', '')
      dispatch(notify(getFluxPackagesFailed(message)))
    }
  }
