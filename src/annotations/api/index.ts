// Types
import {
  Annotation,
  AnnotationStream,
  GetAnnotationPayload,
  DeleteAnnotation,
} from 'src/types'

/* Note: Axios will be removed from here as part of #511, which is the next ticket to be worked on the annotations API */
// Libraries
import axios from 'axios'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'

// URL
const url = `${API_BASE_PATH}api/v2private/annotations`

// Utils
import {formatAnnotationQueryString} from 'src/annotations/utils/formatQueryString'

export const writeAnnotation = async (
  annotations: Annotation[]
): Promise<Annotation[]> => {
  // we need to convert the annotation object's start and end time fields to be
  // string types so they can be parsed in the backend.
  const annotationsRequestConverted = annotations.map(annotation => {
    return {
      ...annotation,
      start: new Date(annotation.startTime).toISOString(),
      end: new Date(annotation.endTime).toISOString(),
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
