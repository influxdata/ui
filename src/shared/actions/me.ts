import {MeState} from 'src/shared/reducers/me'

export const SET_ME = 'SET_ME'

export type Actions = ReturnType<typeof setMe>

export const setMe = (me: MeState) =>
  ({
    type: SET_ME,
    payload: {
      me,
    },
  } as const)
