// Libraries
import axios from 'axios'

// Constants
import {API_BASE_PATH} from 'src/shared/constants'

// URL
const url = `${API_BASE_PATH}api/v2/maps/mapToken`

export const getMapToken = async () => {
  const res = await axios.get(url)
  return res.data ?? {}
}
