import {getBillingAccount as getBillingAccountGenerated} from 'src/client/unityRoutes'

import {Account} from 'src/types/billing'

const makeResponse = (status, data, respName, ...args) => {
  console.log(respName) // eslint-disable-line no-console
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]) // eslint-disable-line no-console
  }

  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getBillingAccount = (): ReturnType<typeof getBillingAccountGenerated> => {
  const account: Account = {
    id: 1234,
    type: 'free',
    updatedAt: new Date().toString(),
  }
  return makeResponse(200, account, 'getBillingAccount')
}
