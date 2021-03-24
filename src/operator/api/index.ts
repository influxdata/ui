import {getOperatorAccount, getOperatorOrg} from 'src/client/unityRoutes'
import {Account, Organizations} from 'src/types/operator'

const makeResponse = (status, data) => {
  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getAccounts = (
  searchTerm?: string
): ReturnType<typeof getOperatorAccount> => {
  const accounts: Account[] = [
    {
      id: '123',
      marketplace: 'Zuora',
      balance: 0,
      billingContact: {
        companyName: 'Influx',
        email: 'asalem@influxdata.com',
        firstName: 'Ariel',
        lastName: 'Salem',
        country: 'USA',
        street1: '123 Main St',
        city: 'New York',
        subdivision: 'NY',
        postalCode: 30000,
      },
      users: [],
      type: 'pay_as_you_go',
    },
    {
      id: '345',
      marketplace: 'aws',
      balance: 10,
      billingContact: {
        companyName: 'Data',
        email: 'watts@influxdata.com',
        firstName: 'Andrew',
        lastName: 'Watkins',
        country: 'USA',
        street1: '345 Main St',
        city: 'Austin',
        subdivision: 'TX',
        postalCode: 50000,
      },
      users: [],
      type: 'cancelled',
    },
    {
      id: '678',
      marketplace: 'azure',
      balance: 20,
      billingContact: {
        companyName: 'Pineapple',
        email: 'desa@influxdata.com',
        firstName: 'Michael',
        lastName: 'De Sa',
        country: 'USA',
        street1: '678 Main St',
        city: 'Seattle',
        subdivision: 'WA',
        postalCode: 80000,
      },
      users: [],
      type: 'free',
    },
  ]

  const filtered = accounts.filter(account => {
    if (searchTerm) {
      return account.billingContact.email.includes(searchTerm)
    }
    return true
  })
  return makeResponse(200, filtered)
}

export const getOrgs = (
  searchTerm?: string
): ReturnType<typeof getOperatorOrg> => {
  const organizations: Organizations = [
    {
      id: '123',
      idpeID: '123',
      name: 'Best Org',
      region: 'us-west',
      provider: 'Zuora',
      date: '01/01/2010',
      account: {
        id: '123',
        marketplace: 'Zuora',
        balance: 0,
        billingContact: {
          companyName: 'Influx',
          email: 'asalem@influxdata.com',
          firstName: 'Ariel',
          lastName: 'Salem',
          country: 'USA',
          street1: '123 Main St',
          city: 'New York',
          subdivision: 'NY',
          postalCode: 30000,
        },
        users: [],
        type: 'pay_as_you_go',
      },
    },
    {
      id: '345',
      idpeID: '345',
      name: 'Second_best_org',
      region: 'eu-central',
      provider: 'aws',
      date: '01/01/2011',
      account: {
        id: '345',
        marketplace: 'aws',
        balance: 10,
        billingContact: {
          companyName: 'Data',
          email: 'watts@influxdata.com',
          firstName: 'Andrew',
          lastName: 'Watkins',
          country: 'USA',
          street1: '345 Main St',
          city: 'Austin',
          subdivision: 'TX',
          postalCode: 50000,
        },
        users: [],
        type: 'cancelled',
      },
    },
    {
      id: '678',
      idpeID: '678',
      name: 'Lucky 3',
      region: 'gcp-west',
      provider: 'azure',
      date: '01/01/2012',
      account: {
        id: '678',
        marketplace: 'azure',
        balance: 20,
        billingContact: {
          companyName: 'Pineapple',
          email: 'desa@influxdata.com',
          firstName: 'Michael',
          lastName: 'De Sa',
          country: 'USA',
          street1: '678 Main St',
          city: 'Seattle',
          subdivision: 'WA',
          postalCode: 80000,
        },
        users: [],
        type: 'free',
      },
    },
  ]

  const filtered = organizations.filter(org => {
    if (searchTerm) {
      return org.id.includes(searchTerm) || org.idpeID.includes(searchTerm)
    }
    return true
  })
  return makeResponse(200, filtered)
}
