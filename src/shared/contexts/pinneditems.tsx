import React, {
  createContext,
  FC,
  useEffect,
  useState,
  memo,
  useCallback,
  ReactElement,
} from 'react'
import {CLOUD} from '../constants'

let getPinned
let putPinned
let deletePinned
let postPinned

if (CLOUD) {
  const pinnedItemFunctions = require('src/client/pinnedItemRoutes')
  getPinned = pinnedItemFunctions.getPinned
  putPinned = pinnedItemFunctions.putPinned
  postPinned = pinnedItemFunctions.postPinned
  deletePinned = pinnedItemFunctions.deletePinned
}

export interface PinnedItem {
  orgID: string
  userID: string
  id: string
  createdAt: string
  updatedAt: string
  metadata: {
    [key: string]: string
  }
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

export const getPinnedItems = async () => {
  const pinnedRes = await getPinned({})
  if (pinnedRes.status !== 200) {
    throw new Error('Unable to retrieve pinned items')
  } else {
    return pinnedRes.data
  }
}

export const addPinnedItem = async (item: Partial<PinnedItem>) => {
  const pinnedRes = await postPinned({data: item})
  if (pinnedRes.status !== 200) {
    throw new Error('Unable to retrieve pinned items')
  }
}

export const deletePinnedItemByParam = async (param: string) => {
  try {
    const items = await getPinnedItems()
    const toDeleteItem = items.find(item =>
      Object.values(item.metadata).includes(param)
    )

    if (toDeleteItem) {
      await deletePinned({id: toDeleteItem.id})
    }
  } catch (err) {
    throw new Error('Unable to delete item under those parameters')
  }
}

export const deletePinnedItem = async (itemID: string) => {
  try {
    await deletePinned({id: itemID})
  } catch (err) {
    throw new Error('Unable to delete pinned item')
  }
}

export const updatePinnedItemByParam = async (id: string, updateParams: {}) => {
  const pinnedItems = await getPinnedItems()
  const toUpdateItem = pinnedItems?.find(item =>
    Object.values(item.metadata).includes(id)
  )
  if (toUpdateItem) {
    try {
      await putPinned({
        id: toUpdateItem.id,
        data: {
          metadata: {...toUpdateItem.metadata, ...updateParams},
        },
      })
    } catch (err) {
      throw new Error('Unable to update item with those parameters')
    }
  }
}

interface Props {
  children: ReactElement<any>
}

const PinnedItemsProvider: FC<Props> = ({children}) => {
  const [pinnedItems, setPinnedItems] = useState([])
  const [pinnedItemsError, setPinnedItemsError] = useState('')

  const deletePinnedItemsHelper = useCallback(
    async (id: string) => {
      await deletePinnedItem(id)
      setPinnedItems(pinnedItems.filter(item => item.id !== id))
    },
    [pinnedItems]
  )

  useEffect(() => {
    getPinnedItems()
      .then(data => setPinnedItems(data))
      .catch(err => {
        console.error(err.message)
        setPinnedItemsError('Failed to retrieve pinned items.')
      })
  }, [])

  return (
    <PinnedItemsContext.Provider
      value={{pinnedItems, deletePinnedItemsHelper, pinnedItemsError}}
    >
      {children}
    </PinnedItemsContext.Provider>
  )
}

export default memo(PinnedItemsProvider)
