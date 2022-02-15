import {useMemo, useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {setMainColumn} from 'src/timeMachine/actions'

export const useMainColumn = (
  mainColumn: string,
  resultColumnNames: Array<string>
): string => {
  const dispatch = useDispatch()
  const update = useCallback(
    mainColumnName => {
      dispatch(setMainColumn(mainColumnName))
    },
    [dispatch]
  )

  return useMemo(() => {
    if (!mainColumn || mainColumn.length < 1) {
      const defaultMainColumn = resultColumnNames?.length
        ? resultColumnNames[0]
        : ''
      update(defaultMainColumn)
      return defaultMainColumn
    }
    update(mainColumn)
    return mainColumn
  }, [mainColumn, resultColumnNames, update])
}
