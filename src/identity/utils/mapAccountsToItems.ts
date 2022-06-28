import {SubMenuItem} from '@influxdata/clockface'

export const mapAccountsToItems = userAccounts => {
  return (
    userAccounts?.map(acct => {
      return {name: acct.name, id: acct.id.toString()} as SubMenuItem
    }) || []
  )
}
