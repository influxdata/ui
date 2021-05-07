// Types
import {
  Annotation,
  AnnotationResponse,
  GetAnnotationPayload,
  DeleteAnnotation,
  AnnotationStream,
} from 'src/types'

/* Note: Axios will be removed from here as part of #511, which is the next ticket to be worked on the annotations API */
// Libraries
import axios from 'axios'
import * as route from 'ui/annotationroutes.ts'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'

// URL
const url = `${API_BASE_PATH}api/v2private/annotations`
const streamsURL = `${API_BASE_PATH}api/v2private/streams`

const annotationsProxy = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Utils
import {formatAnnotationQueryString} from 'src/annotations/utils/formatQueryString'

export const getAnnotationStreams = async (): Promise<AnnotationStream[]> => {
  const params = {}
  const options = {}
  const annotationStreamResponse = await route.getStreams({
    params,
    options,
  })

  if (annotationStreamResponse.status >= 300) {
    throw new Error(
      annotationStreamResponse.data?.message ??
        'Error fetching annotation streams'
    )
  }
  return annotationStreamResponse.data ?? []
}

export const writeAnnotation = async (
  annotations: Annotation[]
): Promise<Annotation[]> => {
  // RFC 3339 is the standard serialization format for dates across the wire for annotations
  const annotationsRequestConverted = annotations.map(annotation => {
    return {
      ...annotation,
      startTime: new Date(annotation.startTime).toISOString(),
      endTime: new Date(annotation.endTime).toISOString(),
    }
  })

  const res = await annotationsProxy.post(url, annotationsRequestConverted)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  const [{startTime, endTime, summary, message, stickers, stream}] = res.data

  return [
    {
      startTime,
      endTime,
      summary,
      message,
      stickers,
      stream,
    },
  ]
}

export const getAnnotations = async (
  stream?: string
): Promise<AnnotationResponse[]> => {
  const params = {}
  const options = formatAnnotationQueryString({stream})
  const res = await route.getAnnotations({
    params,
    options,
  })

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data.map((retrievedAnnotation: AnnotationResponse) => ({
    stream: retrievedAnnotation.stream,
    annotations: retrievedAnnotation.annotations,
  }))
}

export const getAnnotation = async (
  annotation: GetAnnotationPayload
): Promise<AnnotationResponse[]> => {
  const params = {}
  const options = formatAnnotationQueryString(annotation)
  const res = await route.getAnnotation({
    params,
    options,
  })

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data.map((retrievedAnnotation: AnnotationResponse) => ({
    stream: retrievedAnnotation.stream,
    annotations: retrievedAnnotation.annotations,
  }))
}

export const updateAnnotation = async (
  newAnnotation: Annotation
): Promise<Annotation> => {
  const params = {}
  const options = newAnnotation.id
  const res = await route.putAnnotation({
    params,
    options,
  })

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
}

export const deleteAnnotation = async (
  annotationToDelete: DeleteAnnotation
): Promise<number> => {
  const params = {annotationID: annotationToDelete}
  const options = formatAnnotationQueryString(
    annotationToDelete,
  )
  const res = await route.deleteAnnotation({
    params,
    options,
  })
  
  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.status
}
