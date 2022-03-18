// Libraries
import {Dispatch} from 'react'
import {normalize, NormalizedSchema} from 'normalizr'
import {get} from 'lodash'

// API
import {getFluxdocs} from 'src/client/fluxdocsdRoutes'

// Actions and Selectors
import {getFluxPackagesFailed} from 'src/shared/copy/notifications/categories/alerts'
import {notify} from 'src/shared/actions/notifications'
import {getStatus} from 'src/resources/selectors'

// Types
import {
  FluxFunction,
  FluxDocsEntities,
  GetState,
  NotificationAction,
  RemoteDataState,
  ResourceType,
} from 'src/types'
import {Action as NotifyAction} from 'src/shared/actions/notifications'
import {arrayOfFluxDocs} from 'src/schemas'

export const SET_FLUX_DOCS = 'SET_FLUX_DOCS'

export type Action = ReturnType<typeof setFluxDocs> | NotifyAction

// R is the type of the value of the "result" key in normalizr's normalization
type FluxDocSchema<R extends string | string[]> = NormalizedSchema<
  FluxDocsEntities,
  R
>

export const setFluxDocs = (
  status: RemoteDataState,
  schema?: FluxDocSchema<string[]>
) =>
  ({
    type: SET_FLUX_DOCS,
    status,
    schema,
  } as const)

export const getFluxDocs = () => async (
  dispatch: Dispatch<Action | NotificationAction>,
  getState: GetState
): Promise<void> => {
  try {
    const state = getState()
    if (
      getStatus(state, ResourceType.FluxDocs) === RemoteDataState.NotStarted
    ) {
      dispatch(setFluxDocs(RemoteDataState.Loading))
    }

    const resp = await getFluxdocs({})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const fluxDocs = normalize<FluxFunction, FluxDocsEntities, string[]>(
      resp.data,
      arrayOfFluxDocs
    )

    dispatch(setFluxDocs(RemoteDataState.Done, fluxDocs))
  } catch (error) {
    console.error(error)
    const message = get(error, 'response.data.message', '')
    dispatch(notify(getFluxPackagesFailed(message)))
  }
}
