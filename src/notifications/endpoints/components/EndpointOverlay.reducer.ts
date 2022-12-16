// Types
import {NotificationEndpoint} from 'src/types'
import {DEFAULT_ENDPOINT_URLS} from 'src/alerting/constants'

export type Action =
  | {type: 'UPDATE_ENDPOINT'; endpoint: NotificationEndpoint}
  | {type: 'UPDATE_ENDPOINT_TYPE'; endpoint: NotificationEndpoint}
  | {type: 'DELETE_ENDPOINT'; endpointID: string}

export type EndpointState = NotificationEndpoint

export const reducer = (
  state: EndpointState,
  action: Action
): EndpointState => {
  switch (action.type) {
    case 'UPDATE_ENDPOINT': {
      const {endpoint} = action
      return {...state, ...endpoint}
    }
    case 'UPDATE_ENDPOINT_TYPE': {
      const {endpoint} = action
      if (state.type != endpoint.type) {
        const baseProps: any = {
          ...endpoint,
        }
        if (baseProps?.url) {
          delete baseProps.url
        }
        if (baseProps?.token) {
          delete baseProps.token
        }
        if (baseProps?.username) {
          delete baseProps.username
        }
        if (baseProps?.password) {
          delete baseProps.password
        }
        if (baseProps?.method) {
          delete baseProps.method
        }
        if (baseProps?.authMethod) {
          delete baseProps.authMethod
        }
        if (baseProps?.contentTemplate) {
          delete baseProps.contentTemplate
        }
        if (baseProps?.headers) {
          delete baseProps.headers
        }
        if (baseProps?.clientURL) {
          delete baseProps.clientURL
        }
        if (baseProps?.routingKey) {
          delete baseProps.routingKey
        }

        switch (endpoint.type) {
          case 'pagerduty':
            return {
              ...baseProps,
              type: 'pagerduty',
              clientURL: `${location.origin}/orgs/${baseProps.orgID}/alert-history`,
              routingKey: '',
            }
          case 'http':
            return {
              ...baseProps,
              type: 'http',
              method: 'POST',
              authMethod: 'none',
              url: DEFAULT_ENDPOINT_URLS.http,
            }
          case 'slack':
            return {
              ...baseProps,
              type: 'slack',
              url: DEFAULT_ENDPOINT_URLS.slack,
              token: '',
            }
          case 'telegram':
            return {
              ...baseProps,
              type: 'telegram',
              token: '',
              channel: '',
            }
        }
      }
      return state
    }
    case 'DELETE_ENDPOINT': {
      return state
    }

    default:
      const neverAction: never = action

      throw new Error(
        `Unhandled action "${
          (neverAction as any).type
        }" in EndpointsOverlay.reducer.ts`
      )
  }
}
