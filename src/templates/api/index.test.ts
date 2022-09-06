import {jest} from '@jest/globals'

import {
  postTemplatesApply as postTemplatesApplyMock,
  getStacks as getStacksMock,
  deleteStack as deleteStackMock,
  patchStack as patchStackMock,
} from 'src/client'

import {
  reviewTemplate,
  installTemplate,
  fetchStacks,
  deleteStack,
  updateStackName,
  fetchReadMe,
} from 'src/templates/api/'

jest.mock('src/client')

describe('templates api calls', () => {
  beforeEach(() => {
    jest.mocked(postTemplatesApplyMock).mockReset()
  })

  it('handles reviewing a template successfully', async () => {
    const orgID = '90d314b476c1cc67'
    const templateUrl =
      'https://github.com/influxdata/community-templates/blob/master/docker/docker.yml'

    jest.mocked(postTemplatesApplyMock).mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: {} as any,
        headers: {} as any,
      })
    })

    await reviewTemplate(orgID, templateUrl)
    const [mockArguments] = jest.mocked(postTemplatesApplyMock).mock.calls[0]

    expect(mockArguments.data.dryRun).toBeTruthy()
    expect(mockArguments.data.orgID).toBe(orgID)
    expect(mockArguments.data.remotes[0].url).toBe(templateUrl)
  })

  it('handles attempting to review a template with bad data', async () => {
    const orgID = '1234'
    const templateUrl = 'http://example.com'

    jest.mocked(postTemplatesApplyMock).mockImplementation(() => {
      return Promise.resolve({
        status: 500,
        data: {
          message: 'whoops',
        } as any,
        headers: {} as any,
      })
    })

    try {
      await reviewTemplate(orgID, templateUrl)
    } catch (error) {
      expect(error.message).toBe('whoops')
    }
  })

  it('handles installing a template', async () => {
    const orgID = '1234'
    const templateUrl = 'http://example.com'
    jest.mocked(postTemplatesApplyMock).mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: {} as any,
        headers: {} as any,
      })
    })

    await installTemplate(orgID, templateUrl, {})
    const [mockArguments] = jest.mocked(postTemplatesApplyMock).mock.calls[0]

    expect(mockArguments.data.dryRun).toBeFalsy()
    expect(mockArguments.data.orgID).toBe(orgID)
    expect(mockArguments.data.remotes[0].url).toBe(templateUrl)
  })

  it('handles unsuccessfully installing a template when bad data is passed in', async () => {
    const orgID = '90d314b476c1cc67'
    const templateUrl =
      'https://github.com/influxdata/community-templates/blob/master/docker/docker.yml'

    jest.mocked(postTemplatesApplyMock).mockImplementation(() => {
      return Promise.resolve({
        status: 500,
        data: {
          message: 'whoops',
        } as any,
        headers: {} as any,
      })
    })

    try {
      await installTemplate(orgID, templateUrl, {})
    } catch (error) {
      expect(error.message).toBe('whoops')
    }
  })

  it('fetches installed stacks', async () => {
    const orgID = '90d314b476c1cc67'
    jest.mocked(getStacksMock).mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: {} as any,
        headers: {} as any,
      })
    })

    await fetchStacks(orgID)
    const [mockArguments] = jest.mocked(getStacksMock).mock.calls[0]

    expect(mockArguments.query.orgID).toBe(orgID)
  })

  it('handles failures while fetching stacks', async () => {
    const orgID = '1234'
    jest.mocked(getStacksMock).mockImplementation(() => {
      return Promise.resolve({
        status: 500,
        data: {
          message: 'whoops',
        } as any,
        headers: {} as any,
      })
    })

    try {
      await fetchStacks(orgID)
    } catch (error) {
      expect(error.message).toBe('whoops')
    }
  })

  it('deletes a stack', async () => {
    const orgID = '90d314b476c1cc67'
    const stackID = '063ea6d269ea4000'
    jest.mocked(deleteStackMock).mockImplementation(() => {
      return Promise.resolve({
        status: 204,
        data: {} as any,
        headers: {} as any,
      })
    })

    await deleteStack(stackID, orgID)
    const [mockArguments] = jest.mocked(deleteStackMock).mock.calls[0]

    expect(mockArguments.query.orgID).toBe(orgID)
    expect(mockArguments.stack_id).toBe(stackID)
  })

  it('handles failures to delete stacks', async () => {
    const orgID = '1234'
    const stackID = '63728'
    jest.mocked(deleteStackMock).mockImplementation(() => {
      return Promise.resolve({
        status: 500,
        data: {
          message: 'whoops',
        } as any,
        headers: {} as any,
      })
    })

    try {
      await deleteStack(orgID, stackID)
    } catch (error) {
      expect(error.message).toBe('whoops')
    }
  })

  it('updates the name of a stack', async () => {
    const name = 'test rule'
    const stackID = '063ea6d269ea4000'
    jest.mocked(patchStackMock).mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: {} as any,
        headers: {} as any,
      })
    })

    await updateStackName(stackID, name)
    const [mockArguments] = jest.mocked(patchStackMock).mock.calls[0]

    expect(mockArguments.data.name).toBe(name)
    expect(mockArguments.stack_id).toBe(stackID)
  })

  it('handles failures when updating a stack name', async () => {
    const name = 'test rule'
    const stackID = '63728'
    jest.mocked(patchStackMock).mockImplementation(() => {
      return Promise.resolve({
        status: 500,
        data: {
          message: 'whoops',
        } as any,
        headers: {} as any,
      })
    })

    try {
      await updateStackName(stackID, name)
    } catch (error) {
      expect(error.message).toBe('whoops')
    }
  })

  it('fetches readmes', async () => {
    const name = 'docker'
    fetchMock.enableMocks()

    await fetchReadMe(name)

    expect(fetchMock).toHaveReturned()
    expect(jest.mocked(fetchMock).mock.calls[0][0]).toBe(
      'https://raw.githubusercontent.com/influxdata/community-templates/master/docker/readme.md'
    )
  })

  it('handles failures when fetching readmes', async () => {
    const name = 'imABadName'
    fetchMock.mockReject(new Error('foo'))

    try {
      await fetchReadMe(name)
    } catch (error) {
      expect(error.message).toBe('foo')
    }
  })
})
