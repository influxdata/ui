import {Notebook} from 'src/client/notebooksRoutes'

export const SET_NOTEBOOKS = 'SET_NOTEBOOKS'

export type Actions = ReturnType<typeof setNotebooks>

export const setNotebooks = (notebooks: Notebook[]) => ({
  type: SET_NOTEBOOKS,
  notebooks,
})
