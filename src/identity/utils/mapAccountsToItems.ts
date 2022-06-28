import {SubMenuItem} from '@influxdata/clockface'

export const mapAccountsToItems = userAccounts => {
  console.log('entering map accounts to items with value')
  console.log(userAccounts)
  return (
    userAccounts?.map(acct => {
      return {name: acct.name, id: acct.id.toString()} as SubMenuItem
    }) || []
  )
}
