import React, {createContext, FC, useEffect, useState} from 'react'

export interface PinnedItem {
  orgID: string
  userID: string
  id: string
  createdAt: string
  updatedAt: string
  metadata: {}
  type: string
}

export enum PinnedItemType {
  Dashboard = 'dashboard',
  Cell = 'cell',
  Notebook = 'notebook',
  Task = 'task',
  Alert = 'alert',
  UploadCSV = 'uploadCsv',
  UploadLP = 'uploadLP',
  ClientLibrary = 'clientLibrary',
}
export const PinnedItemContext = createContext(null)

const getPinnedItems = async () => {
  return await fetch('http://localhost:8772/recentlyused', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjY3OTc4MzAsImlzcyI6InRlc3QiLCJzdWIiOiJ0ZXN0Iiwia2lkIjoic3RhdGljIiwicGVybWlzc2lvbnMiOlt7ImFjdGlvbiI6InJlYWQiLCJyZXNvdXJjZSI6eyJ0eXBlIjoiZmxvd3MifX0seyJhY3Rpb24iOiJ3cml0ZSIsInJlc291cmNlIjp7InR5cGUiOiJmbG93cyJ9fV0sInVpZCI6IjA2NGEyZDRiOGM4ZTEwMDAiLCJvaWQiOiJiYWM0Y2I2NWUyYzJhZWFkIn0.rH56QSumB6nc7UQIVWLCfKp7_O1WOo7Td7oqHXy9qPs`,
    },
  })
}

export const addPinnedItem = async (item: Partial<PinnedItem>) => {
  const added = await fetch('http://localhost:8772/recentlyused', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjY3OTc4MzAsImlzcyI6InRlc3QiLCJzdWIiOiJ0ZXN0Iiwia2lkIjoic3RhdGljIiwicGVybWlzc2lvbnMiOlt7ImFjdGlvbiI6InJlYWQiLCJyZXNvdXJjZSI6eyJ0eXBlIjoiZmxvd3MifX0seyJhY3Rpb24iOiJ3cml0ZSIsInJlc291cmNlIjp7InR5cGUiOiJmbG93cyJ9fV0sInVpZCI6IjA2NGEyZDRiOGM4ZTEwMDAiLCJvaWQiOiJiYWM0Y2I2NWUyYzJhZWFkIn0.rH56QSumB6nc7UQIVWLCfKp7_O1WOo7Td7oqHXy9qPs`,
    },
    body: JSON.stringify(item),
  })
  return await added.json()
}

export const pushRecentlyUsedItem = async (newItem: Partial<PinnedItem>) => {
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
    <PinnedItemContext.Provider value={{pinnedItems}}>
      {children}
    </PinnedItemContext.Provider>
  )
}

export default PinnedItemsProvider
