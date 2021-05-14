// Types
import {
  Annotation,
  AnnotationCreate,
  AnnotationResponse,
  GetAnnotationPayload,
  DeleteAnnotation,
  AnnotationStream,
} from 'src/types'

/* Note: Axios will be removed from here as part of #511, which is the next ticket to be worked on the annotations API */
// Libraries
import * as route from 'src/annotations/api/annotationroutes'

// Utils
import {formatAnnotationQueryString} from 'src/annotations/utils/formatQueryString'
import {
  GetAnnotationsParams,
  GetAnnotationParams,
} from 'src/annotations/api/annotationroutes'

export const getAnnotationStreams = async (): Promise<AnnotationStream[]> => {
  // NOTE: we have changed the route on this functionality, but it needs to be tested.
  // This is an example of the params, we need to send in the stream search
  // const params: GetStreamsParams = {query: {StreamListFilter: streamSearch }}
  const annotationStreamResponse = await route.getStreams({})
  if (annotationStreamResponse.status >= 300) {
    throw new Error('Error fetching annotation streams')
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
  const params = {data: annotationsRequestConverted}
  const res = await route.postAnnotation(params)

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
  const params: GetAnnotationsParams = {
    query: {AnnotationListFilter: formatAnnotationQueryString({stream})},
  }
  const res = await route.getAnnotations(params)
  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data.map((retrievedAnnotation: AnnotationResponse) => ({
    stream: retrievedAnnotation.stream,
    annotations: retrievedAnnotation.annotations,
  }))
}

// NOTE: not currently in use
export const getAnnotation = async (
  annotation: GetAnnotationPayload
): Promise<AnnotationResponse[]> => {
  const params: GetAnnotationParams = {annotationID: annotation.stream}
  const res = await route.getAnnotation(params)
  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
  // (retrievedAnnotation: AnnotationResponse) => ({
  //   stream: retrievedAnnotation.stream,
  //   annotations: retrievedAnnotation.annotations,
  // })
}

export const updateAnnotation = async (
  newAnnotation: AnnotationCreate
): Promise<AnnotationCreate> => {
  const params = {annotationID: newAnnotation.id, data: newAnnotation}
  const res = await route.putAnnotation(params)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
}

export const deleteAnnotation = async (
  annotationToDelete: DeleteAnnotation
): Promise<number> => {
  const params = {annotationID: annotationToDelete.id}
  const res = await route.deleteAnnotation(params)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.status
}
