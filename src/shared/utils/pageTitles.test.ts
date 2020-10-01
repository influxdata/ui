jest.mock('src/store/configureStore')
import {getStore} from 'src/store/configureStore'
import {mocked} from 'ts-jest/utils'

mocked(getStore)
  .mockImplementationOnce(() => {
    return {
      getState: jest.fn(() => {
        return {
          resources: {
            orgs: {
              byID: {},
              allIDs: [],
              status: 'NotStarted',
              org: {name: 'Fine Young Cannibals'},
            },
          },
        }
      }),
    }
  })
  .mockImplementationOnce(() => {
    return {
      getState: jest.fn(() => {
        return {
          resources: {
            orgs: {
              org: null,
            },
          },
        }
      }),
    }
  })

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

describe('suffixing page titles', () => {
  it('adds the titles, the org name, and the environment', () => {
    expect(pageTitleSuffixer(['Templates', 'Settings'])).toBe(
      'Templates | Settings | Fine Young Cannibals | InfluxDB'
    )
  })

  it('does not include blank org names', () => {
    expect(pageTitleSuffixer(['Templates', 'Settings'])).toBe(
      'Templates | Settings | InfluxDB'
    )
  })
})
