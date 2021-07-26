import React, {
  createContext,
  FC,
  useEffect,
  useState,
  memo,
  useCallback,
  ReactElement,
} from 'react'

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
  return await fetch(``, {
    method: 'GET',
  })
}

const removePinnedItem = async (id: string) => {
  return await fetch(`/${id}`, {
    method: 'DELETE',
  })
}
const addPinnedItem = async (item: Partial<PinnedItem>) => {
  const added = await fetch(``, {
    method: 'POST',
    body: JSON.stringify(item),
  })
  return await added.json()
}

const updatePinnedItem = async (_id: string, item: Partial<PinnedItem>) => {
  await fetch(``, {
    method: 'PUT',
    body: JSON.stringify({updateItemFields: item}),
  })

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

export const updatePinnedItemByParam = async (id: string, updateParams: {}) => {
  try {
    const res = await getPinnedItems()
    const pinnedItems = await res.json()
    const toUpdateItem = pinnedItems.find(item =>
      Object.values(item.metadata[0]).includes(id)
    )
    if (toUpdateItem) {
      await updatePinnedItem(toUpdateItem.id, {
        metadata: [{...toUpdateItem.metadata[0], ...updateParams}],
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
    getPinnedItems()
      .then(res => res.json())
      .then(res => setPinnedItems(res))
  }, [])

  return (
    <PinnedItemsContext.Provider value={{pinnedItems, deletePinnedItemsHelper}}>
      {children}
    </PinnedItemsContext.Provider>
  )
}

export default memo(PinnedItemsProvider)
