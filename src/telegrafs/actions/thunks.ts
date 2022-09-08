// Libraries
import {normalize} from 'normalizr'
import {Dispatch} from 'react'

// Schemas
import {telegrafSchema, arrayOfTelegrafs} from 'src/schemas/telegrafs'

// Actions
import {notify} from 'src/shared/actions/notifications'
import {
  Action,
  setTelegrafs,
  addTelegraf,
  editTelegraf,
  removeTelegraf,
} from 'src/telegrafs/actions/creators'

// Constants
import {
  addTelegrafLabelFailed,
  cloneTelegrafSuccess,
  getTelegrafConfigFailed,
  removeTelegrafLabelFailed,
  telegrafCreateFailed,
  telegrafDeleteFailed,
  telegrafGetFailed,
  telegrafUpdateFailed,
} from 'src/shared/copy/notifications'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getStatus} from 'src/resources/selectors'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'

// Types
import {
  AppThunk,
  RemoteDataState,
  GetState,
  Telegraf,
  Label,
  TelegrafEntities,
  ResourceType,
} from 'src/types'
import {
  deleteTelegraf as apiDeleteTelegraf,
  deleteTelegrafsLabel,
  getTelegraf as apiGetTelegraf,
  getTelegrafs as apiGetTelegrafs,
  postTelegraf,
  postTelegrafsLabel,
  putTelegraf,
} from 'src/client'

export const getTelegrafs =
  () => async (dispatch: Dispatch<Action>, getState: GetState) => {
    try {
      const state = getState()
      if (
        getStatus(state, ResourceType.Telegrafs) === RemoteDataState.NotStarted
      ) {
        dispatch(setTelegrafs(RemoteDataState.Loading))
      }
      const org = getOrg(state)

      const response = await apiGetTelegrafs({query: {orgID: org.id}})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const telegrafs = response.data.configurations

      const normTelegrafs = normalize<Telegraf, TelegrafEntities, string[]>(
        telegrafs,
        arrayOfTelegrafs
      )

      dispatch(setTelegrafs(RemoteDataState.Done, normTelegrafs))
    } catch (error) {
      console.error(error)
      dispatch(setTelegrafs(RemoteDataState.Error))
      dispatch(notify(telegrafGetFailed()))
    }
  }

export const createTelegraf =
  (telegraf: Telegraf) => async (dispatch: Dispatch<Action>) => {
    try {
      // New telegraf config has no labels
      const response = await postTelegraf({data: telegraf})

      if (response.status !== 201) {
        throw new Error(response.data.message)
      }

      const createdTelegraf = response.data
      const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
        createdTelegraf,
        telegrafSchema
      )

      dispatch(addTelegraf(normTelegraf))
    } catch (error) {
      console.error(error)
      dispatch(notify(telegrafCreateFailed()))
    }
  }

const cloneTelegrafLabels =
  (sourceTelegraf: Telegraf, destinationTelegraf: Telegraf) =>
  async (dispatch: Dispatch<Action>) => {
    try {
      const pendingLabels = sourceTelegraf.labels.map(labelID =>
        postTelegrafsLabel({
          telegrafID: destinationTelegraf.id,
          data: {labelID},
        })
      )

      const mappedLabels = await Promise.all(pendingLabels)

      if (
        mappedLabels.length &&
        mappedLabels.some(label => label.status !== 201)
      ) {
        throw new Error(
          'An error occurred cloning the labels for this telegraf config'
        )
      }
      dispatch(notify(cloneTelegrafSuccess()))
    } catch {
      dispatch(notify(addTelegrafLabelFailed()))
    }
  }

export const cloneTelegraf =
  (telegraf: Telegraf) => async (dispatch: Dispatch<Action>) => {
    let clonedTelegraf

    // Step 1: create a new telegraf
    try {
      const response = await postTelegraf({data: telegraf})

      if (response.status !== 201) {
        throw new Error(response.data.message)
      }

      clonedTelegraf = response.data
    } catch (error) {
      console.error(error)
      dispatch(notify(telegrafCreateFailed()))
    }

    // Step 2: clone the labels
    cloneTelegrafLabels(telegraf, clonedTelegraf)(dispatch)

    // Step 3: refresh the cloned telegraf in the UI to show the labels
    refreshTelegraf(clonedTelegraf)(dispatch)
  }

export const updateTelegraf =
  (telegraf: Telegraf) => async (dispatch: Dispatch<Action>) => {
    try {
      const response = await putTelegraf({
        telegrafID: telegraf.id,
        data: telegraf,
      })

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const t = response.data
      const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
        t,
        telegrafSchema
      )

      dispatch(editTelegraf(normTelegraf))
      event(
        'telegraf.config.edit.success',
        {id: telegraf.id},
        {name: normalizeEventName(telegraf.name)}
      )
    } catch (error) {
      event(
        'telegraf.config.edit.failure',
        {id: telegraf.id},
        {name: normalizeEventName(telegraf.name)}
      )
      console.error(error)
      dispatch(notify(telegrafUpdateFailed(telegraf.name)))
    }
  }

export const deleteTelegraf =
  (id: string, name: string) => async (dispatch: Dispatch<Action>) => {
    try {
      const response = await apiDeleteTelegraf({telegrafID: id})

      if (response.status !== 204) {
        throw new Error(response.data.message)
      }

      dispatch(removeTelegraf(id))
      event(
        'telegraf.config.delete.success',
        {id},
        {name: normalizeEventName(name)}
      )
    } catch (error) {
      event(
        'telegraf.config.delete.failure',
        {id},
        {name: normalizeEventName(name)}
      )
      console.error(error)
      dispatch(notify(telegrafDeleteFailed(name)))
    }
  }

export const addTelegrafLabelAsync =
  (telegrafID: string, label: Label): AppThunk<Promise<void>> =>
  async (dispatch): Promise<void> => {
    try {
      const response = await postTelegrafsLabel({
        telegrafID,
        data: {labelID: label.id},
      })

      if (response.status !== 201) {
        throw new Error(response.data.message)
      }

      const res = await apiGetTelegraf({
        telegrafID,
        headers: {Accept: 'application/json'},
      })

      if (res.status !== 200) {
        throw new Error(res.data.message)
      }

      const telegraf = res.data
      const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
        telegraf,
        telegrafSchema
      )

      dispatch(editTelegraf(normTelegraf))
    } catch (error) {
      console.error(error)
      dispatch(notify(addTelegrafLabelFailed()))
    }
  }

export const removeTelegrafLabelAsync =
  (telegrafID: string, label: Label): AppThunk<Promise<void>> =>
  async (dispatch): Promise<void> => {
    try {
      const response = await deleteTelegrafsLabel({
        telegrafID,
        labelID: label.id,
      })

      if (response.status !== 204) {
        throw new Error(response.data.message)
      }

      const res = await apiGetTelegraf({
        telegrafID,
        headers: {Accept: 'application/json'},
      })

      if (res.status !== 200) {
        throw new Error(res.data.message)
      }

      const telegraf = res.data
      const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
        telegraf,
        telegrafSchema
      )

      dispatch(editTelegraf(normTelegraf))
    } catch (error) {
      console.error(error)
      dispatch(notify(removeTelegrafLabelFailed()))
    }
  }

export const getTelegraf = (telegrafConfigID: string) => async () => {
  try {
    const res = await apiGetTelegraf({
      telegrafID: telegrafConfigID,
      headers: {Accept: 'application/json'},
    })

    if (res.status !== 200) {
      throw new Error(res.data.message)
    }

    const config = res.data
    return config.name
  } catch (error) {
    console.error(error)
    throw error
  }
}

// adds a telegraf with its latest properties to the state's resources
export const refreshTelegraf =
  (telegraf: Telegraf) => async (dispatch: Dispatch<Action>) => {
    try {
      const response = await apiGetTelegraf({
        telegrafID: telegraf.id,
        headers: {Accept: 'application/json'},
      })

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const refreshedTelegraf = response.data
      const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
        refreshedTelegraf,
        telegrafSchema
      )
      dispatch(addTelegraf(normTelegraf))
    } catch (error) {
      console.error(error)
      dispatch(notify(getTelegrafConfigFailed()))
    }
  }
