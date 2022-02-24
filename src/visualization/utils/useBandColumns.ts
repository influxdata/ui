import {useMemo} from 'react'

export const useMainColumn = (
  mainColumn: string,
  resultColumnNames: Array<string>
): string =>
  useMemo(() => {
    if (!mainColumn || mainColumn.length < 1) {
      return resultColumnNames?.length ? resultColumnNames[0] : ''
    }

    return mainColumn
  }, [mainColumn, resultColumnNames])
