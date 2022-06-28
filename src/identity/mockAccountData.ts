import {UserAccount} from 'src/client/unityRoutes'

export const generateAccounts = (num: number): UserAccount[] => {
  const accountArr = []
  for (let i = 1; i <= num; i++) {
    accountArr.push({
      id: 20000 + i,
      // Change this if desired that default account not be first.
      isActive: i === 1 ? true : false,
      isDefault: i === 1 ? true : false,
      name: 'Random Account ' + Math.floor(Math.random() * 50000),
    })
  }
  return accountArr
}
