// APIs
import {
  getAccount,
  getAccounts,
  patchAccount,
  putAccountsDefault,
  Account,
  IdentityAccount,
  UserAccount,
} from 'src/client/unityRoutes'

// Types
import {
  GenericError,
  ServerError,
  UnauthorizedError,
  UnprocessableEntityError,
} from 'src/types/error'

export interface CurrentAccount extends IdentityAccount {
  billingProvider?: 'zuora' | 'aws' | 'gcm' | 'azure'
}

// get a list of the user's accounts
export const getUserAccounts = async (): Promise<UserAccount[]> => {
  const response = await getAccounts({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }
  if (!Array.isArray(response.data)) {
    throw new GenericError('No account found')
  }

  return response.data
}

// fetch more details about one of the user's accounts
export const fetchAccountDetails = async (
  accountId: string | number
): Promise<Account> => {
  const accountIdString = accountId.toString()

  const response = await getAccount({
    accountId: accountIdString,
  })

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  const accountDetails = response.data
  return accountDetails
}

// change the user's default account
export const updateDefaultQuartzAccount = async (
  accountId: number
): Promise<void> => {
  const response = await putAccountsDefault({
    data: {
      id: accountId,
    },
  })

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  // success status code is 204; no response body expected.
}

// rename the user's current account
export const updateUserAccount = async (accountId, name) => {
  const response = await patchAccount({accountId, data: {name}})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 422) {
    throw new UnprocessableEntityError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}
