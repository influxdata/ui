import {useEffect} from 'react'

export const usePersistReduxState = (
  state: any,
  storageId: string,
  dispatch,
  actionHandler: (payload: any) => void
): void => {
  const setReduxStateFromLocalStorage = () => {
    const fromLocalStorageState = JSON.parse(
      window.localStorage.getItem(storageId)
    )

    if (!fromLocalStorageState) {
      return null
    }

    // set the state in redux
    dispatch(actionHandler(fromLocalStorageState))
  }

  useEffect(() => {
    const setLocalStorageWithReduxState = e => {
      e.preventDefault()
      window.localStorage.setItem(storageId, JSON.stringify(state))
      return undefined
    }
    window.onbeforeunload = setLocalStorageWithReduxState
    setReduxStateFromLocalStorage()
    return () => {
      console.log('here')
      window.localStorage.clear()
      window.removeEventListener('beforeunload', setLocalStorageWithReduxState)
    }
  }, [state])
}
