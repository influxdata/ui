import {AppState} from 'src/types'
import {selectShouldShowNotebooks} from 'src/flows/selectors/flowsSelectors'

jest.mock('src/shared/constants/index', () => ({
  ...(jest as any).requireActual('src/shared/constants/index'),
  CLOUD: true,
}))

jest.mock('src/organizations/selectors', () => ({
  selectOrgCreationDate: jest.fn(),
}))

import {selectOrgCreationDate} from 'src/organizations/selectors'

describe('selecting whether notebooks should be shown', () => {
  let fakeState
  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()

    fakeState = {
      resources: {
        notebooks: {
          notebooks: [],
        },
      },
    } as AppState
  })

  it('does not show notebooks when the org creation date is after the IOx cutoff date', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-02-01T11:00:00Z')

    expect(selectShouldShowNotebooks(fakeState)).toBeFalsy()
  })

  it('does not show notebooks when the org creation date is after the IOx cutoff date, even if there are notebooks in cloud', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-02-01T11:00:00Z')

    fakeState.resources.notebooks.notebooks = [1, 2, 3]
    expect(selectShouldShowNotebooks(fakeState)).toBeFalsy()
  })

  it('shows notebooks when the org creation date is after the IOx cutoff date if there are notebooks in OSS', () => {
    jest.mock('src/shared/constants/index', () => ({
      ...(jest as any).requireActual('src/shared/constants/index'),
      CLOUD: false,
    }))
    const {
      selectShouldShowNotebooks,
    } = require('src/flows/selectors/flowsSelectors')

    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-02-01T11:00:00Z')

    fakeState.resources.notebooks.notebooks = [1, 2, 3]
    expect(selectShouldShowNotebooks(fakeState)).toBeTruthy()
  })

  it('does not show notebooks when the org creation date is before the IOx cutoff date, and there are no existing notebooks', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2020-07-04T11:00:00Z')

    expect(selectShouldShowNotebooks(fakeState)).toBeFalsy()
  })

  it('does not show notebooks when the org creation date is the exact same as the IOx cutoff date, and there are existing notebooks', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2023-01-31T00:00:00Z')
    fakeState.resources.notebooks.notebooks = [1, 2, 3]

    expect(selectShouldShowNotebooks(fakeState)).toBeFalsy()
  })

  it('shows notebooks when the org creation date is before the IOx cutoff date, and there are existing notebooks', () => {
    jest
      .mocked(selectOrgCreationDate)
      .mockImplementationOnce(() => '2020-07-04T11:00:00Z')
    fakeState.resources.notebooks.notebooks = [1, 2, 3]

    expect(selectShouldShowNotebooks(fakeState)).toBeTruthy()
  })
})
