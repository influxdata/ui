import {AppState, NotificationEndpoint} from 'src/types'

export const getEndpointIDs = (state: AppState): {[x: string]: boolean} => {
  return state.resources.endpoints.allIDs.reduce(
    (acc, id) => ({...acc, [id]: true}),
    {}
  )
}

export const sortEndpointsByName = (
  endpoints: NotificationEndpoint[]
): NotificationEndpoint[] =>
  endpoints.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  )

export const getAllActiveEndpoints = (
  state: AppState
): NotificationEndpoint[] => {
  const endpoints = state.resources.endpoints.allIDs.reduce(
    (acc, id) =>
      state.resources.endpoints.byID[id]?.activeStatus == 'active'
        ? acc.concat([state.resources.endpoints.byID[id]])
        : acc,
    []
  )
  return !!endpoints.length ? sortEndpointsByName(endpoints) : []
}
