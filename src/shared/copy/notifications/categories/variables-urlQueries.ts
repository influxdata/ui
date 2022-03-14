import {IconFont} from '@influxdata/clockface'
import {Notification} from 'src/types'
import {INDEFINITE} from 'src/shared/constants/index'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

// Variables & URL Queries
export const invalidTimeRangeValueInURLQuery = (): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Invalid URL query value supplied for lower or upper time range.`,
})

export const invalidVariableNameValuePairInURLQuery = (
  name: string,
  value: string
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Invalid URL query value "${value}" supplied for variable name "${name}".`,
})

export const getVariablesFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch variables',
})

export const getVariableFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch variable',
})

export const getVariableFailedWithMessage = (name, message): Notification => ({
  ...defaultErrorNotification,
  duration: INDEFINITE,
  message: `Failed to fetch variable ${name}: ${message}`,
})

export const createVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to create variable: ${error}`,
})

export const createVariableSuccess = (name: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: `Successfully created new variable: ${name}.`,
})

export const deleteVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to delete variable: ${error}`,
})

export const deleteVariableSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: 'Successfully deleted the variable',
})

export const updateVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to update variable: ${error}`,
})

export const updateVariableSuccess = (name: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: `Successfully updated variable: ${name}.`,
})

export const moveVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to move variable: ${error}`,
})

export const addVariableLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add label to variables`,
})

export const removeVariableLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to remove label from variables`,
})
