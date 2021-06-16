// Libraries
import axios from 'axios'
// Constants
import {API_BASE_PATH} from 'src/shared/constants'
// URL
// const url = `${API_BASE_PATH}api/v2/maps/mapToken`
const url = `http://localhost:8617/v1/mapToken`
const request = {
  headers: {
    Authorization:
      'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjM3ODM2NTgsImlzcyI6InRlc3QiLCJzdWIiOiJ0ZXN0Iiwia2lkIjoic3RhdGljIiwicGVybWlzc2lvbnMiOlt7ImFjdGlvbiI6InJlYWQiLCJyZXNvdXJjZSI6eyJ0eXBlIjoiZmxvd3MifX0seyJhY3Rpb24iOiJ3cml0ZSIsInJlc291cmNlIjp7InR5cGUiOiJmbG93cyJ9fV0sInVpZCI6IjA2NGEyZDRiOGM4ZTEwMDAiLCJvaWQiOiJiYWM0Y2I2NWUyYzJhZWFkIn0.i-cP18oKo9PE_81eMSjL0kB4jMA1y7jkBFdy8lXGNKs',
    'Access-Control-Allow-Origin': '*',
  },
}
export const getMapToken = async () => {
  const res = await axios.get(url, request)
  return res.data ?? {}
}
