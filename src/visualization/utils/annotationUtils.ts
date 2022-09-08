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

const makeCreateMethod = (
  dispatch: Dispatch<any>,
  streamName: string,
  eventPrefix = 'xyplot'
) => {
  const createAnnotation = async userModifiedAnnotation => {
    const {summary, startTime, endTime, type} = userModifiedAnnotation

    const actualEndTime = type === 'point' ? startTime : endTime

    try {
      await dispatch(
        writeThenFetchAndSetAnnotations([
          {
            summary,
            stream: streamName,
            startTime: new Date(startTime).getTime(),
            endTime: new Date(actualEndTime).getTime(),
          },
        ])
      )
      event(`annotations.create_annotation.create`, {
        prefix: eventPrefix,
        type,
      })
    } catch (err) {
      dispatch(notify(createAnnotationFailed(getErrorMessage(err))))
      event(`annotations.create_annotation.failure`, {
        prefix: eventPrefix,
        type,
      })
    }
  }

  return createAnnotation
}

// for point annotations only:
// (initially, the user can then change to a range once the dialog is up)
const makeAnnotationClickListener = (
  dispatch: Dispatch<any>,
  streamName: string,
  eventPrefix = 'xyplot'
) => {
  const createAnnotation = makeCreateMethod(dispatch, streamName, eventPrefix)

  const singleClickHandler = (plotInteraction: InteractionHandlerArguments) => {
    event(`annotations.create_annotation.show_overlay`, {prefix: eventPrefix})

    dispatch(
      showOverlay(
        'add-annotation',
        {
          createAnnotation,
          startTime: plotInteraction?.clampedValueX ?? plotInteraction.valueX,
          eventPrefix,
          streamName,
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
  streamName: string,
  eventPrefix = 'xyplot'
) => {
  const createAnnotation = makeCreateMethod(dispatch, streamName, eventPrefix)

  const rangeHandler = (start: number | string, end: number | string) => {
    event(`annotations.create_range_annotation.show_overlay`, {
      prefix: eventPrefix,
    })
    dispatch(
      showOverlay(
        'add-annotation',
        {
          createAnnotation,
          startTime: start,
          endTime: end,
          range: true,
          eventPrefix,
          streamName,
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
 *  For editing annotations
 *
 *  This handles both point and range annotations
 *  Point annotations have an stop time, it just is equal to the start time
 *
 *  The editing form will show the correct fields (it shows the stop time if the times are different,
 *  else shows just the start time.
 *
 *  so just need one handler for both types of annotations
 * */
const makeAnnotationClickHandler = (
  streamName: string,
  dispatch: Dispatch<any>,
  annotations: AnnotationsList,
  eventPrefix = 'xyplot'
) => {
  const clickHandler = (id: string) => {
    const annotationToEdit = annotations[streamName].find(
      annotation => annotation.id === id
    )
    if (annotationToEdit) {
      event(`annotations.edit_annotation.show_overlay`, {
        prefix: eventPrefix,
      })
      dispatch(
        showOverlay(
          'edit-annotation',
          {
            clickedAnnotation: {
              ...annotationToEdit,
              stream: streamName,
              eventPrefix,
            },
            streamName,
          },
          () => {
            dismissOverlay()
          }
        )
      )
    }
  }
  return clickHandler
}

// want all the ranges *before* all the points,
// so that can click on points that overlap ranges
// exporting for testing
export const sortAnnotations = (anno1, anno2) => {
  // if they are both ranges or both points, return 0
  // if anno1 is a range, and anno2 is a point return -1;
  // else return 1

  const anno1Value = anno1.startTime === anno1.endTime ? 1 : 0
  const anno2Value = anno2.startTime === anno2.endTime ? 1 : 0

  return anno1Value - anno2Value
}
const makeAnnotationLayer = (
  streamName: string,
  xColumn: string,
  yColumn: string,
  groupKey: string[],
  annotations: AnnotationsList,
  annotationsAreVisible: boolean,
  dispatch: Dispatch<any>,
  eventPrefix = 'xyplot'
) => {
  const cellAnnotations = annotations ? annotations[streamName] ?? [] : []

  const annotationsToRender: any[] = cellAnnotations
    .sort(sortAnnotations)
    .map(annotation => {
      return {
        ...annotation,
        color: InfluxColors.Honeydew,
      }
    })

  const handleAnnotationClick = makeAnnotationClickHandler(
    streamName,
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
  inAnnotationMode: boolean,
  streamName: string,
  xColumn: string,
  yColumn: string,
  groupKey: string[],
  annotations: AnnotationsList,
  dispatch: Dispatch<any>,
  eventPrefix = 'xyplot'
) => {
  if (inAnnotationMode && streamName) {
    config.interactionHandlers = {
      singleShiftClick: makeAnnotationClickListener(
        dispatch,
        streamName,
        eventPrefix
      ),
    }
    config.interactionHandlers.onXBrush = makeAnnotationRangeListener(
      dispatch,
      streamName,
      eventPrefix
    )
  }

  const annotationLayer: AnnotationLayerConfig = makeAnnotationLayer(
    streamName,
    xColumn,
    yColumn,
    groupKey,
    annotations,
    inAnnotationMode,
    dispatch,
    eventPrefix
  )

  if (annotationLayer) {
    config.layers.push(annotationLayer)
  }
}

export const handleUnsupportedGraphType = graphType => {
  return notify(annotationsUnsupportedOnGraph(graphType))
}
