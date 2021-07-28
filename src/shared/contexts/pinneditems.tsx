import React, {
  createContext,
  FC,
  useEffect,
  useState,
  memo,
  useCallback,
  ReactElement,
} from 'react'

import {
  getPinned,
  putPinned,
  deletePinned,
  postPinned,
} from 'src/client/pinnedItemRoutes'

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

// The routes below are placeholders until we get the implementation of the swagger-defined routes through the pipeline

export const getPinnedItems = async () => {
  const pinnedRes = await getPinned({})
  if (pinnedRes.status !== 200) {
    throw new Error('Unable to retrieve pinned items')
  } else {
    return pinnedRes.data
  }
}

const removePinnedItem = async (id: string) => {
  await deletePinned({id})
}
const addPinnedItem = async (item: Partial<PinnedItem>) => {
  const pinnedRes = await postPinned({data: item})
  if (pinnedRes.status !== 200) {
    throw new Error('Unable to retrieve pinned items')
  } else {
    return
  }
}

const updatePinnedItem = async (id: string, item: Partial<PinnedItem>) => {
  await putPinned({id, data: item})

  return
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
    const items = await getPinnedItems()
    const toDeleteItem = items.find(item =>
      Object.values(item.metadata).includes(param)
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

export const updatePinnedItemByParam = async (id: string, updateParams: {}) => {
  try {
    const pinnedItems = await getPinnedItems()
    const toUpdateItem = pinnedItems?.find(item =>
      Object.values(item.metadata).includes(id)
    )
    if (toUpdateItem) {
      await updatePinnedItem(toUpdateItem.id, {
        metadata: {...toUpdateItem.metadata, ...updateParams},
      })
    }
  } catch (err) {
    console.error(err)
  }
}

interface Props {
  children: ReactElement<any>
}

const PinnedItemsProvider: FC<Props> = ({children}) => {
  const [pinnedItems, setPinnedItems] = useState([])

  const deletePinnedItemsHelper = useCallback(
    async (id: string) => {
      await deletePinnedItem(id)
      setPinnedItems(pinnedItems.filter(item => item.id !== id))
    },
    [pinnedItems]
  )

  useEffect(() => {
    getPinnedItems().then(data => setPinnedItems(data))
  }, [])

  return (
    <PinnedItemsContext.Provider value={{pinnedItems, deletePinnedItemsHelper}}>
      {children}
    </PinnedItemsContext.Provider>
  )
}

export default memo(PinnedItemsProvider)
