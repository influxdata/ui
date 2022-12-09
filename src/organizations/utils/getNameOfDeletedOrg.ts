import {
  DELETED_ORG_ID_LOCALSTORAGE_KEY,
  DELETED_ORG_NAME_LOCALSTORAGE_KEY,
} from 'src/cloud/constants'
import {getFromLocalStorage, removeFromLocalStorage} from 'src/localStorage'

// This is a workaround that ensures that a user always receives a notification after deleting an organization.
// Since quartz forces a reload to the new org, the notification trigger lives in LocalStorage.
const justDeletedOrgName = getFromLocalStorage(
  DELETED_ORG_NAME_LOCALSTORAGE_KEY
)
const justDeletedOrgID = getFromLocalStorage(DELETED_ORG_ID_LOCALSTORAGE_KEY)

type DeletedOrgResponse = string | false

export const getNameOfDeletedOrg = (): DeletedOrgResponse => {
  if (
    justDeletedOrgName &&
    justDeletedOrgID &&
    !window.location.href.includes(justDeletedOrgID)
  ) {
    const deletedOrgName = justDeletedOrgName
    clearOrgFromLocalStorage()

    return deletedOrgName
  } else {
    return false
  }
}

const clearOrgFromLocalStorage = () => {
  removeFromLocalStorage(DELETED_ORG_NAME_LOCALSTORAGE_KEY)
  removeFromLocalStorage(DELETED_ORG_ID_LOCALSTORAGE_KEY)
}
