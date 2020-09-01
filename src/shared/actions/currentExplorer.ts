export type Action = ReturnType<typeof setIsAutoFunction>

export const SET_IS_AUTO_FUNCTION = 'SET_IS_AUTO_FUNCTION'

export const setIsAutoFunction = (bool: boolean) =>
  ({
    type: SET_IS_AUTO_FUNCTION,
    isAutoFunction: bool,
  } as const)
