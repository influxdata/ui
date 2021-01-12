// Types
import {
  PostAnnotationResponse,
  PostAnnotationPayload,
  GetAnnotationResponse,
  GetAnnotationPayload,
} from 'src/types'

// Libraries
import axios, {AxiosResponse} from 'axios'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'

// URL
const url = `${API_BASE_PATH}api/v2private/annotations`

export const writeAnnotation = async (
  annotations: PostAnnotationPayload[]
): Promise<AxiosResponse<PostAnnotationResponse[]>> => {
  const res = await axios.post(url, annotations)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  const transformedResponse = res.data.map(d => {
    const newData = {
      startTime: d['start'],
      endTime: d['end'],
      stream: d.stream,
      summary: d.summary,
      stickers: d.stickers,
    }

    return newData
  })

  return transformedResponse
}

const formatAnnotationQueryString = (data: GetAnnotationPayload): string => {
  let qs: string = ''

  const {stream, startTime, endTime, summary, sticker} = data

  if (stream) {
    qs += `${qs.length ? '&' : '?'}stream=${stream}`
  }

  if (startTime) {
    qs += `${qs.length ? '&' : '?'}start=${startTime}`
  }

  if (endTime) {
    qs += `${qs.length ? '&' : '?'}end=${endTime}`
  }

  if (summary) {
    qs += `${qs.length ? '&' : '?'}summary=${encodeURI(summary)}`
  }

  if (sticker) {
    Object.keys(sticker).forEach((s: string) => {
      qs += `${qs.length ? '&' : '?'}sticker-includes[${s}]=${encodeURI(
        sticker[s]
      )}`
    })
  }

  return qs
}

export const getAnnotation = async (
  data: GetAnnotationPayload
): Promise<AxiosResponse<GetAnnotationResponse[]>> => {
  const formattedQueryString = formatAnnotationQueryString(data)
  const appendedURL = url + formattedQueryString
  console.log(appendedURL, 'THIS IS THE URL')
  const res = await axios.get(appendedURL)

  if (res.status >= 300) {
    throw new Error(res.data?.message)
  }

  const transformedResponse = res.data.map(d => {
    const newDataBlock = {
      stream: d?.stream,
      annotations: d.annotations.map(a => ({
        startTime: a['start'],
        endTime: a['end'],
        summary: a.summary,
        stickers: a.stickers,
      })),
    }
    return newDataBlock
  })

  return transformedResponse
}
