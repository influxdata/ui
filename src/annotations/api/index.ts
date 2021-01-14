// Types
import {
  Annotation,
  GetAnnotationResponse,
  GetAnnotationPayload,
  DeleteAnnotation,
} from 'src/types'

// Libraries
import axios, {AxiosResponse} from 'axios'

// Types
import {PostAnnotationResponse, PostAnnotationPayload} from 'src/types'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'
import {UpdateAnnotationPayload} from 'src/types/annotation'

// URL
const url = `${API_BASE_PATH}api/v2private/annotations`

export const writeAnnotation = async (
  annotations: Annotation[]
): Promise<AxiosResponse<Annotation[]>> => {
  const res = await axios.post(url, annotations)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
}

export const formatAnnotationQueryString = (
  data: GetAnnotationPayload,
  requestType?: string
): string => {
  let qs: string = ''

  const {stream, start, end, stickers} = data

  if (stream) {
    qs += `${qs.length ? '&' : '?'}${
      requestType === 'delete' ? 'stream' : 'streamIncludes'
    }=${encodeURI(stream)}`
  }

  if (start) {
    qs += `${qs.length ? '&' : '?'}start=${start}`
  }

  if (end) {
    qs += `${qs.length ? '&' : '?'}end=${end}`
  }

  if (stickers) {
    Object.keys(stickers).forEach((s: string) => {
      qs += `${qs.length ? '&' : '?'}stickerIncludes[${s}]=${encodeURI(
        stickers[s]
      )}`
    })
  }

  return qs
}

export const getAnnotation = async (
  data: GetAnnotationPayload
): Promise<AxiosResponse<GetAnnotationResponse[]>> => {
  const formattedQueryString = formatAnnotationQueryString(data)
  console.log(formattedQueryString)
  const appendedURL = url + formattedQueryString

  const res = await axios.get(appendedURL)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
}

export const updateAnnotation = async (
  oldAnnotation: UpdateAnnotationPayload['old'],
  newAnnotation: UpdateAnnotationPayload['new']
): Promise<AxiosResponse<Annotation>> => {
  const res = await axios.put(url, {old: oldAnnotation, new: newAnnotation})

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  return res.data
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
