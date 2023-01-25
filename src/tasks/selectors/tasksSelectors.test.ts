import {AppState} from 'src/types'
import {selectShouldShowTasks} from 'src/tasks/selectors/tasksSelectors'

jest.mock('src/shared/constants/index', () => ({
  ...(jest as any).requireActual('src/shared/constants/index'),
  CLOUD: true,
}))

jest.mock('src/organizations/selectors', () => ({
  selectOrgCreationDate: jest.fn(),
}))

jest.mock('src/shared/utils/featureFlag.ts', () => ({
  isFlagEnabled: () => jest.fn().mockImplementation(() => true),
}))

import {selectOrgCreationDate} from 'src/organizations/selectors'

describe('selecting whether tasks should be shown', () => {
  let fakeState
  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()

    fakeState = {
      resources: {
        orgs: {
          org: {
            createdAt: '2023-02-01T00:00:00:000Z',
          },
        },
      },
    } as AppState
  })

  it('does not show tasks when the org creation date is after the IOx cutoff date', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-02-01T11:00:00Z')
    expect(selectShouldShowTasks(fakeState)).toBeFalsy()
  })
  it('shows tasks when the org creation date is before the IOx cutoff date', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2020-07-04T11:00:00Z')
    expect(selectShouldShowTasks(fakeState)).toBeTruthy()
  })
  it('does not show tasks when the org creation date is the exact same as the IOx cutoff date', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-01-31T00:00:00Z')
    expect(selectShouldShowTasks(fakeState)).toBeFalsy()
  })

  it('shows tasks regadless of org creation date in OSS', () => {
    jest.mock('src/shared/constants/index', () => ({
      ...(jest as any).requireActual('src/shared/constants/index'),
      CLOUD: false,
    }))
    const {
      selectShouldShowTasks,
    } = require('src/tasks/selectors/tasksSelectors')
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-02-01T11:00:00Z')

    expect(selectShouldShowTasks(fakeState)).toBeTruthy()
  })
})
