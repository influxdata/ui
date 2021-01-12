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
    const {'start-time': startTime, 'end-time': endTime, ...props} = d
    const newData = {
      startTime,
      endTime,
      ...props,
    }

    return newData
  })

  return transformedResponse
}
