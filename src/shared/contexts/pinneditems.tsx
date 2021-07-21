import React, {createContext, FC, useEffect, useState, memo} from 'react'
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
  return await fetch(
    `https://twodotoh-dev-shmuellotman20210720133644.a.influxcloud.dev.local/api/v2private/pinned`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJDbG91ZDIiLCJleHAiOjE2MjY5MTE2NTYsImlzcyI6IkluZmx1eERhdGEuQ2xvdWQyIiwia2lkIjoiZGQxODAyMzItMTQwZS00MjUzLWI3NDUtYWY0MzIzNTNmMGYzIiwidXNlcl9pZCI6IjA3ZGQ0Y2ZhMzI3NzkwMDAiLCJvcmdfaWQiOiIyZGUzZDVlN2YyNGY0ZWZkIiwiY2x1c3Rlcl91cmwiOiJodHRwczovL3R3b2RvdG9oLWRldi1zaG11ZWxsb3RtYW4yMDIxMDcyMDEzMzY0NC5hLmluZmx1eGNsb3VkLmRldi5sb2NhbCIsInZlcnNpb24iOiIxLjAuMCJ9.IFTVv9A82OGAaT5-J_X6IFxyKPP4UGikv1YRFmfzOjA`,
      },
    }
  )
}

const removePinnedItem = async (id: string) => {
  return await fetch(
    `https://twodotoh-dev-shmuellotman20210720133644.a.influxcloud.dev.local/api/v2private/pinned/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJDbG91ZDIiLCJleHAiOjE2MjY5MTE2NTYsImlzcyI6IkluZmx1eERhdGEuQ2xvdWQyIiwia2lkIjoiZGQxODAyMzItMTQwZS00MjUzLWI3NDUtYWY0MzIzNTNmMGYzIiwidXNlcl9pZCI6IjA3ZGQ0Y2ZhMzI3NzkwMDAiLCJvcmdfaWQiOiIyZGUzZDVlN2YyNGY0ZWZkIiwiY2x1c3Rlcl91cmwiOiJodHRwczovL3R3b2RvdG9oLWRldi1zaG11ZWxsb3RtYW4yMDIxMDcyMDEzMzY0NC5hLmluZmx1eGNsb3VkLmRldi5sb2NhbCIsInZlcnNpb24iOiIxLjAuMCJ9.IFTVv9A82OGAaT5-J_X6IFxyKPP4UGikv1YRFmfzOjA`,
      },
    }
  )
}
const addPinnedItem = async (item: Partial<PinnedItem>) => {
  const added = await fetch(
    `https://twodotoh-dev-shmuellotman20210720133644.a.influxcloud.dev.local/api/v2private/pinned`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJDbG91ZDIiLCJleHAiOjE2MjY5MTE2NTYsImlzcyI6IkluZmx1eERhdGEuQ2xvdWQyIiwia2lkIjoiZGQxODAyMzItMTQwZS00MjUzLWI3NDUtYWY0MzIzNTNmMGYzIiwidXNlcl9pZCI6IjA3ZGQ0Y2ZhMzI3NzkwMDAiLCJvcmdfaWQiOiIyZGUzZDVlN2YyNGY0ZWZkIiwiY2x1c3Rlcl91cmwiOiJodHRwczovL3R3b2RvdG9oLWRldi1zaG11ZWxsb3RtYW4yMDIxMDcyMDEzMzY0NC5hLmluZmx1eGNsb3VkLmRldi5sb2NhbCIsInZlcnNpb24iOiIxLjAuMCJ9.IFTVv9A82OGAaT5-J_X6IFxyKPP4UGikv1YRFmfzOjA`,
      },
      body: JSON.stringify(item),
    }
  )
  return await added.json()
}

export const pushPinnedItem = async (newItem: Partial<PinnedItem>) => {
  try {
    await addPinnedItem(newItem)
  } catch (err) {
    console.error(err)
  }
}

export const deletePinnedItemByParam = async (param: string) => {
  try {
    const res = await getPinnedItems()
    const items = await res.json()
    const toDeleteItem = items.find(item =>
      Object.values(item.metadata[0]).includes(param)
    )

    if (toDeleteItem) {
      await removePinnedItem(toDeleteItem.id)
    }
  } catch (err) {
    console.error(err)
  }
}
export const deletePinnedItem = async (itemID: string) => {
  try {
    await removePinnedItem(itemID)
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
    <PinnedItemsContext.Provider value={{pinnedItems, setPinnedItems}}>
      {children}
    </PinnedItemsContext.Provider>
  )
}

export default memo(PinnedItemsProvider)
