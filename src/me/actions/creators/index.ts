import {MeState} from 'src/me/reducers'
import {Me} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export const SET_ME = 'SET_ME'
export const SET_QUARTZ_ME = 'SET_QUARTZ_ME'
export const SET_QUARTZ_ME_STATUS = 'SET_QUARTZ_ME_STATUS'
export const SET_ALERTS_STATUSES = 'SET_ALERTS_STATUSES'

export type Actions =
  | ReturnType<typeof setMe>
  | ReturnType<typeof setQuartzMe>
  | ReturnType<typeof setQuartzMeStatus>

export const setMe = (me: MeState) =>
  ({
    type: SET_ME,
    me,
  } as const)

export const setQuartzMe = (me: Me, status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_ME,
    quartzMe: me,
    status,
  } as const)

export const setQuartzMeStatus = (status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_ME_STATUS,
    status,
  } as const)
