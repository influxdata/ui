// Types
import {
  Annotation,
  AnnotationStream,
  GetAnnotationPayload,
  DeleteAnnotation,
  AnnotationStreamDetail,
} from 'src/types'

/* Note: Axios will be removed from here as part of #511, which is the next ticket to be worked on the annotations API */
// Libraries
import axios from 'axios'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'

// URL
const url = `${API_BASE_PATH}api/v2private/annotations`
const streamsURL = `${API_BASE_PATH}api/v2private/streams`

// Utils
import {formatAnnotationQueryString} from 'src/annotations/utils/formatQueryString'

export const getAnnotationStreamsDetails = async (): Promise<AnnotationStreamDetail[]> => {
  const annotationStreamResponse = await axios.get(streamsURL)
  if (annotationStreamResponse.status >= 300) {
    throw new Error(annotationStreamResponse.data?.message)
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

  const res = await axios.post(url, annotationsRequestConverted)

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
): Promise<AnnotationStream[]> => {
  const res = await axios.get(`${url}?${formatAnnotationQueryString({stream})}`)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data.map((retrievedAnnotation: AnnotationStream) => ({
    stream: retrievedAnnotation.stream,
    annotations: retrievedAnnotation.annotations,
  }))
}

export const getAnnotation = async (
  annotation: GetAnnotationPayload
): Promise<AnnotationStream[]> => {
  const formattedQueryString = formatAnnotationQueryString(annotation)
  const appendedURL = `${url}?${formattedQueryString}`

  const res = await axios.get(appendedURL)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data.map((retrievedAnnotation: AnnotationStream) => ({
    stream: retrievedAnnotation.stream,
    annotations: retrievedAnnotation.annotations,
  }))
}

export const updateAnnotation = async (
  oldAnnotation: DeleteAnnotation,
  newAnnotation: Annotation
): Promise<Annotation> => {
  const res = await axios.put(url, {old: oldAnnotation, new: newAnnotation})

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  const {startTime, endTime, summary, message, stickers, stream} = res.data
  return {
    startTime,
    endTime,
    summary,
    message,
    stickers,
    stream,
  }
}

export const deleteAnnotation = async (
  deleteAnnotation: DeleteAnnotation
): Promise<number> => {
  const formattedQueryString = formatAnnotationQueryString(
    deleteAnnotation,
    'delete'
  )

  const appendedURL = `${url}?${formattedQueryString}`

  const res = await axios.delete(appendedURL)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.status
}
