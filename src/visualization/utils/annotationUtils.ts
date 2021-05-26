// React
import {Dispatch} from 'react'

// Redux
import {writeThenFetchAndSetAnnotations} from 'src/annotations/actions/thunks'

import {AnnotationsList} from 'src/types'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {
  annotationsUnsupportedOnGraph,
  createAnnotationFailed,
} from 'src/shared/copy/notifications'
import {getErrorMessage} from 'src/utils/api'

import {
  AnnotationLayerConfig,
  Config,
  InfluxColors,
  InteractionHandlerArguments,
} from '@influxdata/giraffe'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const makeAnnotationClickListener = (
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

    console.log('about to create an annotation......', plotInteraction)
    dispatch(
      showOverlay(
        'add-annotation',
        {
          createAnnotation,
          startTime: plotInteraction?.clampedValueX ?? plotInteraction.valueX,
        },
        () => {
          dismissOverlay()
        }
      )
    )
  }

  return singleClickHandler
}

const makeAnnotationRangeListener = (
  dispatch: Dispatch<any>,
  cellID: string,
  eventPrefix = 'xyplot'
) => {
  const createAnnotation = async userModifiedAnnotation => {
    const {message, startTime, endTime} = userModifiedAnnotation

    try {
      await dispatch(
        writeThenFetchAndSetAnnotations([
          {
            summary: message,
            stream: cellID,
            startTime: new Date(startTime).getTime(),
            endTime: new Date(endTime).getTime(),
          },
        ])
      )
      event(`${eventPrefix}.annotations.create_range_annotation.create`)
    } catch (err) {
      dispatch(notify(createAnnotationFailed(getErrorMessage(err))))
      event(`${eventPrefix}.annotations.create_range_annotation.failure`)
    }
  }

  const rangeHandler = (start: number | string, end: number | string) => {
    event(`${eventPrefix}.annotations.create_range_annotation.show_overlay`)
    dispatch(
      showOverlay(
        'add-annotation',
        {
          createAnnotation,
          startTime: start,
          endTime: end,
          range: true,
        },
        () => {
          dismissOverlay()
        }
      )
    )
  }

  return rangeHandler
}

/**
 *  This handles both point and range annotations
 *  Point annotations have an stop time, it just is equal to the start time
 *
 *  The editing form will show the correct fields (it shows the stop time if the times are different,
 *  else shows just the start time.
 *
 *  so just need one handler for both types of annotations
 * */
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
            dismissOverlay()
          }
        )
      )
    }
  }
  return clickHandler
}

const makeAnnotationLayer = (
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

export const addAnnotationLayer = (
  config: Config,
  inAnnotationWriteMode: boolean,
  cellID: string,
  xColumn: string,
  yColumn: string,
  groupKey: string[],
  annotations: AnnotationsList,
  annotationsAreVisible: boolean,
  dispatch: Dispatch<any>,
  eventPrefix = 'xyplot'
) => {
  if (isFlagEnabled('annotations')) {
    if (inAnnotationWriteMode && cellID) {
      config.interactionHandlers = {
        singleClick: makeAnnotationClickListener(dispatch, cellID, 'band'),
      }
      if (isFlagEnabled('rangeAnnotations')) {
        config.interactionHandlers.onXBrush = makeAnnotationRangeListener(
          dispatch,
          cellID,
          eventPrefix
        )
      }
    }

    const annotationLayer: AnnotationLayerConfig = makeAnnotationLayer(
      cellID,
      xColumn,
      yColumn,
      groupKey,
      annotations,
      annotationsAreVisible,
      dispatch,
      eventPrefix
    )

    if (annotationLayer) {
      config.layers.push(annotationLayer)
    }
  }
}

export const handleUnsupportedGraphType = graphType => {
  return notify(annotationsUnsupportedOnGraph(graphType))
}
