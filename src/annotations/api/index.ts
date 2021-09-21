// Types
import {
  Annotation,
  AnnotationResponse,
  DeleteAnnotation,
  AnnotationStream,
} from 'src/types'

import {
  deleteAnnotation as deleteAnnotationApi,
  getAnnotations as getAnnotationsApi,
  postAnnotation,
  putAnnotation,
  AnnotationEvent,
  Error as ResponseError,
  AnnotationList,
} from 'src/client/annotationdRoutes'

// Utils
import {formatAnnotationQueryString} from 'src/annotations/utils/formatQueryString'

export const getAnnotationStreams = (): Promise<AnnotationStream[]> => {
  throw new Error('getAnnotationStreams is not implemented')
}

export const writeAnnotation = async (
  annotations: Annotation[],
  orgID: string
): Promise<Annotation[]> => {
  // RFC 3339 is the standard serialization format for dates across the wire for annotations
  const annotationsRequestConverted = annotations.map(annotation => {
    return {
      ...annotation,
      startTime: new Date(annotation.startTime).toISOString(),
      endTime: new Date(annotation.endTime).toISOString(),
    }
  })
  const params = {data: annotationsRequestConverted, query: {orgID}}
  const res = await postAnnotation(params)

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
  orgID: string,
  stream?: string
): Promise<AnnotationResponse[]> => {
  const params = {
    query: {AnnotationListFilter: formatAnnotationQueryString({stream}), orgID},
  }
  const res = await getAnnotationsApi(params)
  if (res.status >= 300) {
    throw new Error((res.data as ResponseError).message)
  }

  return (res.data as AnnotationList).map((retrievedAnnotation: any) => ({
    stream: retrievedAnnotation.stream,
    annotations: retrievedAnnotation.annotations,
  }))
}

export const updateAnnotation = async (
  newAnnotation: AnnotationEvent
): Promise<AnnotationEvent> => {
  const params = {annotationID: newAnnotation.id, data: newAnnotation}
  const res = await putAnnotation(params)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
}

export const deleteAnnotation = async (
  annotationToDelete: DeleteAnnotation
): Promise<number> => {
  const params = {annotationID: annotationToDelete.id}
  const res = await deleteAnnotationApi(params)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.status
}
