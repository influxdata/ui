import {getMapToken as apiGetMapToken} from 'src/client/mapsdRoutes'

export const getMapToken = async () => {
  const res = await apiGetMapToken({})
  return res.data ?? {}
}
