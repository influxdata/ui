// Libraries
import {normalize} from 'normalizr'
import {Dispatch} from 'react'

// API
import {client} from 'src/utils/api'

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
  telegrafGetFailed,
  telegrafCreateFailed,
  telegrafUpdateFailed,
  telegrafDeleteFailed,
  addTelegrafLabelFailed,
  removeTelegrafLabelFailed,
} from 'src/shared/copy/notifications'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getLabels, getStatus} from 'src/resources/selectors'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'

// Types
import {ILabel} from '@influxdata/influx'
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
  getTelegrafs as apiGetTelegrafs,
  postTelegraf,
  postTelegrafsLabel,
} from 'src/client'

export const getTelegrafs = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
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

export const createTelegraf = (telegraf: Telegraf) => async (
  dispatch: Dispatch<Action>
) => {
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

export const updateTelegraf = (telegraf: Telegraf) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    const labels = getLabels(state, telegraf.labels)
    const t = await client.telegrafConfigs.update(telegraf.id, {
      ...telegraf,
      labels,
    })

    const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
      t,
      telegrafSchema
    )

    dispatch(editTelegraf(normTelegraf))
    event(`telegraf.config.${normalizeEventName(telegraf.name)}.edit.success`, {
      id: telegraf.id,
    })
  } catch (error) {
    event(`telegraf.config.${normalizeEventName(telegraf.name)}.edit.failure`, {
      id: telegraf.id,
    })
    console.error(error)
    dispatch(notify(telegrafUpdateFailed(telegraf.name)))
  }
}

export const deleteTelegraf = (id: string, name: string) => async (
  dispatch: Dispatch<Action>
) => {
  try {
    const response = await apiDeleteTelegraf({telegrafID: id})

    if (response.status !== 204) {
      throw new Error(response.data.message)
    }

    dispatch(removeTelegraf(id))
    event(`telegraf.config.${normalizeEventName(name)}.delete.success`, {id})
  } catch (error) {
    event(`telegraf.config.${normalizeEventName(name)}.delete.failure`, {id})
    console.error(error)
    dispatch(notify(telegrafDeleteFailed(name)))
  }
}

export const addTelegrafLabelsAsync = (
  telegrafID: string,
  labels: Label[]
): AppThunk<Promise<void>> => async (dispatch): Promise<void> => {
  try {
    if (labels.length === 0) {
      throw new Error('No label is found')
    }
    const labelID = labels[0].id
    const response = await postTelegrafsLabel({telegrafID, data: {labelID}})

    if (response.status !== 201) {
      throw new Error(response.data.message)
    }

    // TODO: fix OpenAPI GET /telegrafs/{telegrafID}
    // getTelegraf from `src/client` returns a string instead of an object
    const telegraf = await client.telegrafConfigs.get(telegrafID)
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

export const removeTelegrafLabelsAsync = (
  telegrafID: string,
  labels: Label[]
): AppThunk<Promise<void>> => async (dispatch): Promise<void> => {
  try {
    await client.telegrafConfigs.removeLabels(telegrafID, labels as ILabel[])
    // TODO: fix OpenAPI GET /telegrafs/{telegrafID}
    // getTelegraf from `src/client` returns a string instead of an object
    const telegraf = await client.telegrafConfigs.get(telegrafID)
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
    // TODO: fix OpenAPI GET /telegrafs/{telegrafID}
    // getTelegraf from `src/client` returns a string instead of an object
    const config = await client.telegrafConfigs.get(telegrafConfigID)
    return config.name
  } catch (error) {
    console.error(error)
    throw error
  }
}