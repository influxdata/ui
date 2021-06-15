import {getUserStatus, USER_PILOT_USER_STATUS} from './useGetUserStatus'
import {usageStatsCsv} from 'src/shared/utils/mocks/usagestats'
import {fromFlux} from '@influxdata/giraffe'

jest.mock('src/client')
describe('useGetUserStatus helper', () => {
  const parsedTable = fromFlux(usageStatsCsv)

  it('gets user status based on passed usage data', () => {
    const status = getUserStatus(parsedTable.table)

    expect(status).toEqual([
      USER_PILOT_USER_STATUS.ACTIVE_WRITING_USER,
      USER_PILOT_USER_STATUS.ACTIVE_USER,
    ])
  })

  it('returns a NEW_USER status if no states are ascertained', () => {
    const status = getUserStatus({getColumn: () => []})
    expect(status).toEqual([USER_PILOT_USER_STATUS.NEW_USER])
  })
})
