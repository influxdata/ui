import {
  RUDDERSTACK_DATA_PLANE_URL,
  RUDDERSTACK_WRITE_KEY,
} from 'src/shared/constants'
import * as rudderstack from 'rudder-sdk-js'

export const loadRudderstack = (): void => {
  rudderstack.ready(() => {})
  rudderstack.load(RUDDERSTACK_WRITE_KEY, RUDDERSTACK_DATA_PLANE_URL)
}

export const identify = (
  userId?: string,
  traits?: object,
  options?: object,
  callback?: Function
): void => {
  rudderstack.identify(userId, traits, options, callback)
}

export const page = (
  category?: string,
  name?: string,
  properties?: object,
  options?: object,
  callback?: Function
): void => {
  rudderstack.page(category, name, properties, options, callback)
}

export const track = (
  eventTitle: string,
  properties?: object,
  options?: object,
  callback?: Function
): void => {
  rudderstack.track(eventTitle, properties, options, callback)
}

export const alias = (
  to: string,
  from?: string,
  options?: object,
  callback?: Function
): void => {
  rudderstack.alias(to, from, options, callback)
}

export const group = (
  groupId: string,
  traits?: object,
  options?: object,
  callback?: Function
): void => {
  rudderstack.group(groupId, traits, options, callback)
}

export const reset = (): void => {
  rudderstack.reset()
}
