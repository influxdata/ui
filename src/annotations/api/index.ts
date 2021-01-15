// Types
import {
  Annotation,
  GetAnnotationResponse,
  GetAnnotationPayload,
  DeleteAnnotation,
} from 'src/types'

// Libraries
import axios from 'axios'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'

// URL
const url = `${API_BASE_PATH}api/v2private/annotations`

export const writeAnnotation = async (
  annotations: Annotation[]
): Promise<Annotation[]> => {
  const res = await axios.post(url, annotations)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  const [{start, end, summary, message, stickers, stream}] = res.data
  return [
    {
      start,
      end,
      summary,
      message,
      stickers,
      stream,
    },
  ]
}

export const formatAnnotationQueryString = (
  annotation: GetAnnotationPayload,
  requestType?: string
): string => {
  let queryString: string = ''

  const {stream, start, end, stickers} = annotation

  if (stream) {
    queryString += `${queryString.length ? '&' : '?'}${
      requestType === 'delete' ? 'stream' : 'streamIncludes'
    }=${encodeURI(stream)}`
  }

  if (start) {
    queryString += `${queryString.length ? '&' : '?'}start=${start}`
  }

  if (end) {
    queryString += `${queryString.length ? '&' : '?'}end=${end}`
  }

  if (stickers) {
    Object.keys(stickers).forEach((s: string) => {
      queryString += `${
        queryString.length ? '&' : '?'
      }stickerIncludes[${s}]=${encodeURI(stickers[s])}`
    })
  }

  return queryString
}

export const getAnnotation = async (
  annotation: GetAnnotationPayload
): Promise<GetAnnotationResponse[]> => {
  const formattedQueryString = formatAnnotationQueryString(annotation)
  const appendedURL = url + formattedQueryString

  const res = await axios.get(appendedURL)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data.map((anno: GetAnnotationResponse) => ({
    stream: anno.stream,
    annotations: anno.annotations,
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

  const {start, end, summary, message, stickers, stream} = res.data
  return {
    start,
    end,
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
  const res = await axios.delete(url + formattedQueryString)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.status
}
