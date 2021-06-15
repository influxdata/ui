// TODO: uncomment when we change jest structure to accomodate cloud tests only

// import {getUserStatus, USER_PILOT_USER_STATUS} from './useGetUserStatus'
// import {usageStatsCsv} from 'src/shared/utils/mocks/usagestats'
// import {fromFlux} from '@influxdata/giraffe'
// import {CLOUD} from 'src/shared/constants'

// export const itif = (
//   name: string,
//   condition: () => boolean | Promise<boolean>,
//   cb
// ) => {
//   it(name, done => {
//     if (condition()) {
//       cb(done)
//     } else {
//       console.warn(`[skipped]: ${name}`)
//       done()
//     }
//   })
// }

// describe('useGetUserStatus helper', () => {
//   const parsedTable = fromFlux(usageStatsCsv)

//   itif(
//     'gets user status based on passed usage data',
//     () => !!CLOUD,
//     done => {
//       const status = getUserStatus(parsedTable.table)

//       expect(status).toEqual([
//         USER_PILOT_USER_STATUS.ACTIVE_WRITING_USER,
//         USER_PILOT_USER_STATUS.ACTIVE_USER,
//       ])
//       done()
//     }
//   )

//   it('returns a NEW_USER status if no states are ascertained', () => {
//     const status = getUserStatus({getColumn: () => []})
//     expect(status).toEqual([USER_PILOT_USER_STATUS.NEW_USER])
//   })
// })
