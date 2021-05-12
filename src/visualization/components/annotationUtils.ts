// React
import {Dispatch} from 'react'

// Redux
import {writeThenFetchAndSetAnnotations} from 'src/annotations/actions/thunks'

import {AnnotationsList} from 'src/types'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {createAnnotationFailed} from 'src/shared/copy/notifications'
import {getErrorMessage} from 'src/utils/api'

import {
  AnnotationLayerConfig,
  InfluxColors,
  InteractionHandlerArguments,
} from '@influxdata/giraffe'

export const makeAnnotationClickListener = (
  dispatch: Dispatch<any>,
  cellID: string,
  eventPrefix = 'xyplot'
) => {
  const createAnnotation = async userModifiedAnnotation => {
    const {message, startTime} = userModifiedAnnotation

    try {
      await dispatch(
        writeThenFetchAndSetAnnotations([
          {
            summary: message,
            stream: cellID,
            startTime: new Date(startTime).getTime(),
            endTime: new Date(startTime).getTime(),
          },
        ])
      )
      event(`${eventPrefix}.annotations.create_annotation.create`)
    } catch (err) {
      dispatch(notify(createAnnotationFailed(getErrorMessage(err))))
      event(`${eventPrefix}.annotations.create_annotation.failure`)
    }
  }

  const singleClickHandler = (plotInteraction: InteractionHandlerArguments) => {
    event(`${eventPrefix}.annotations.create_annotation.show_overlay`)
    dispatch(
      showOverlay(
        'add-annotation',
        {
          createAnnotation,
          startTime: plotInteraction?.clampedValueX ?? plotInteraction.valueX,
        },
        () => {
          event(`${eventPrefix}.annotations.create_annotation.cancel`)
          dismissOverlay()
        }
      )
    )
  }

  return singleClickHandler
}

const makeAnnotationClickHandler = (
  cellID: string,
  dispatch: Dispatch<any>,
  annotations: AnnotationsList,
  eventPrefix = 'xyplot'
) => {
  const clickHandler = (id: string) => {
    const annotationToEdit = annotations[cellID].find(
      annotation => annotation.id === id
    )
    if (annotationToEdit) {
      event(`${eventPrefix}.annotations.edit_annotation.show_overlay`)
      dispatch(
        showOverlay(
          'edit-annotation',
          {clickedAnnotation: {...annotationToEdit, stream: cellID}},
          () => {
            event(`${eventPrefix}.annotations.edit_annotation.cancel`)
            dismissOverlay()
          }
        )
      )
    }
  }
  return clickHandler
}

export const makeAnnotationLayer = (
  cellID: string,
  xColumn: string,
  yColumn: string,
  groupKey: string[],
  annotations: AnnotationsList,
  annotationsAreVisible: boolean,
  dispatch: Dispatch<any>,
  eventPrefix = 'xyplot'
) => {
  const cellAnnotations = annotations ? annotations[cellID] ?? [] : []
  const annotationsToRender: any[] = cellAnnotations.map(annotation => {
    return {
      ...annotation,
      color: InfluxColors.Honeydew,
    }
  })

  const handleAnnotationClick = makeAnnotationClickHandler(
    cellID,
    dispatch,
    annotations,
    eventPrefix
  )

  if (annotationsAreVisible && annotationsToRender.length) {
    const annotationLayer: AnnotationLayerConfig = {
      type: 'annotation',
      x: xColumn,
      y: yColumn,
      fill: groupKey,
      handleAnnotationClick,
      annotations: annotationsToRender.map(annotation => {
        return {
          id: annotation.id,
          title: annotation.summary,
          description: '',
          color: annotation.color,
          startValue: new Date(annotation.startTime).getTime(),
          stopValue: new Date(annotation.endTime).getTime(),
          dimension: 'x',
          pin: 'start',
        }
      }),
    }

    return annotationLayer
  }
  return null
}
