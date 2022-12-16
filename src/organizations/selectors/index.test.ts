import {isOrgIOx} from 'src/organizations/selectors'

let fakeState: any = {}

describe('determining if an org is an IOx org', () => {
  beforeEach(() => {
    fakeState = {
      resources: {
        orgs: {
          byID: {
            '9c5955fc99a60b8f': {
              links: {
                buckets: '/api/v2/buckets?org=dev',
                dashboards: '/api/v2/dashboards?org=dev',
                labels: '/api/v2/orgs/9c5955fc99a60b8f/labels',
                limits: '/api/v2/orgs/9c5955fc99a60b8f/limits',
                logs: '/api/v2/orgs/9c5955fc99a60b8f/logs',
                members: '/api/v2/orgs/9c5955fc99a60b8f/members',
                owners: '/api/v2/orgs/9c5955fc99a60b8f/owners',
                secrets: '/api/v2/orgs/9c5955fc99a60b8f/secrets',
                self: '/api/v2/orgs/9c5955fc99a60b8f',
                tasks: '/api/v2/tasks?org=dev',
              },
              id: '9c5955fc99a60b8f',
              name: 'dev',
              description: '',
              defaultStorageType: 'tsm',
              createdAt: '2022-10-24T17:06:47.427700345Z',
              updatedAt: '2022-10-24T17:06:47.427700533Z',
            },
          },
          allIDs: ['9c5955fc99a60b8f'],
          status: 'Done',
          org: {
            links: {
              buckets: '/api/v2/buckets?org=dev',
              dashboards: '/api/v2/dashboards?org=dev',
              labels: '/api/v2/orgs/9c5955fc99a60b8f/labels',
              limits: '/api/v2/orgs/9c5955fc99a60b8f/limits',
              logs: '/api/v2/orgs/9c5955fc99a60b8f/logs',
              members: '/api/v2/orgs/9c5955fc99a60b8f/members',
              owners: '/api/v2/orgs/9c5955fc99a60b8f/owners',
              secrets: '/api/v2/orgs/9c5955fc99a60b8f/secrets',
              self: '/api/v2/orgs/9c5955fc99a60b8f',
              tasks: '/api/v2/tasks?org=dev',
            },
            id: '9c5955fc99a60b8f',
            name: 'dev',
            description: '',
            defaultStorageType: 'tsm',
            createdAt: '2022-10-24T17:06:47.427700345Z',
            updatedAt: '2022-10-24T17:06:47.427700533Z',
          },
        },
      },
    }
  })
  it('returns false when the defaultStorageType is tsm', () => {
    expect(isOrgIOx(fakeState)).toBe(false)
  })

  it('returns false when the defaultStorageType is an empty string', () => {
    fakeState.resources.orgs.org.defaultStorageType = ''
    expect(isOrgIOx(fakeState)).toBe(false)
  })

  it('returns false when the defaultStorageType is null', () => {
    fakeState.resources.orgs.org.defaultStorageType = null
    expect(isOrgIOx(fakeState)).toBe(false)
  })

  it('returns false when no storage type is present', () => {
    delete fakeState.resources.orgs.org.defaultStorageType
    expect(isOrgIOx(fakeState)).toBe(false)
  })

  it('returns true when the defaultStorageType is iox', () => {
    fakeState.resources.orgs.org.defaultStorageType = 'iox'
    expect(isOrgIOx(fakeState)).toBe(true)

    fakeState.resources.orgs.org.defaultStorageType = 'IoX'
    expect(isOrgIOx(fakeState)).toBe(true)
  })
})
