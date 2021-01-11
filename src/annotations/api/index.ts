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
  try {
    const res = await axios.post(url, annotations)

    if (res.status !== 200) {
      throw new Error(res.data?.message)
    }

    return res.data
  } catch (err) {
    throw new Error(err?.message)
  }
}
