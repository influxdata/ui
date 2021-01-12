// Types
import {PostAnnotationResponse, PostAnnotationPayload} from 'src/types'

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
      ...d,
      startTime: d['start-time'],
      endTime: d['end-time'],
    }

    delete newData['start-time']
    delete newData['end-time']

    return newData
  })

  return transformedResponse
}
