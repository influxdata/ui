import React, {createContext, FC, useEffect, useState} from 'react'
import {API_BASE_PATH} from 'src/shared/constants'

export interface PinnedItem {
  orgID: string
  userID: string
  id: string
  createdAt: string
  updatedAt: string
  metadata: {}
  type: string
}

export enum PinnedItemTypes {
  Dashboard = 'dashboard',
  Cell = 'cell',
  Notebook = 'notebook',
  Task = 'task',
  Alert = 'alert',
  UploadCSV = 'uploadCsv',
  UploadLP = 'uploadLP',
  ClientLibrary = 'clientLibrary',
}
export const PinnedItemsContext = createContext(null)

const getPinnedItems = async () => {
  return await fetch(`${API_BASE_PATH}/api/v2private/pinned`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer `,
    },
  })
}

const addPinnedItem = async (item: Partial<PinnedItem>) => {
  const added = await fetch('http://localhost:8772/recentlyused', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer`,
    },
    body: JSON.stringify(item),
  })
  return await added.json()
}

export const pushPinnedItem = async (newItem: Partial<PinnedItem>) => {
  try {
    await addPinnedItem(newItem)
  } catch (err) {
    console.error(err)
  }
}

const PinnedItemsProvider: FC = ({children}) => {
  const [pinnedItems, setPinnedItems] = useState([])
  useEffect(() => {
    getPinnedItems()
      .then(res => res.json())
      .then(res => setPinnedItems(res))
  }, [])

  return (
    <PinnedItemsContext.Provider value={{pinnedItems}}>
      {children}
    </PinnedItemsContext.Provider>
  )
}

export default PinnedItemsProvider
