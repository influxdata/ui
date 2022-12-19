import {Dispatch} from 'redux'

import {Notebook} from 'src/client/notebooksRoutes'

import {getNotebooks as fetchNotebooks} from 'src/client/notebooksRoutes'
import {setNotebooks} from 'src/flows/actions/flowsActions'

export const getNotebooks =
  (orgID: string) => async (dispatch: Dispatch<any>) => {
    try {
      const response = await fetchNotebooks({query: {orgID}})

      if (response.status !== 200) {
        throw new Error()
      }

      dispatch(setNotebooks(response.data.flows))
    } catch {
      const emptyNotebooks = [] as Notebook[]
      dispatch(setNotebooks(emptyNotebooks))
    }
  }
