import {IconFont} from '@influxdata/clockface'
import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

export const deleteAnnotationSuccess = (message: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: message
    ? `Successfully deleted the annotation: ${message}`
    : 'Successfully deleted the annotation',
})

export const deleteAnnotationFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to delete annotation: ${error}`,
})

export const editAnnotationSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.CheckMark_New,
  message: 'Annotation updated successfully',
})

export const editAnnotationFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to edit annotation: ${error}`,
})

export const createAnnotationFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to create annotation: ${error}`,
})

export const annotationsUnsupportedOnGraph = (
  graphType: string = 'This graph type'
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `${graphType} does not support adding annotations.`,
})
