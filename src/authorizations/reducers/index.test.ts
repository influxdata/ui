import {normalize} from 'normalizr'
import {authsReducer, AuthsState} from 'src/authorizations/reducers'
import {authSchema} from 'src/schemas'
import {AuthEntities, Authorization, RemoteDataState} from 'src/types'
import {
  addAuthorization,
  editAuthorization,
  setAuthorizations,
  removeAuthorization,
} from '../actions/creators'

const mockState = (): AuthsState => ({
  allIDs: ['id01', 'id02'],
  byID: {
    id01: {
      org: 'org01',
      orgID: 'org01id',
    },
    id02: {},
  },
  status: RemoteDataState.Done,
})

describe('the authorizations reducer', () => {
  it('initialize empty state', () => {
    const newState = authsReducer(undefined, '' as any)

    expect(newState.byID).toEqual({})
    expect(newState.allIDs).toEqual([])
  })

  it('add auth', () => {
    const resp: Authorization = {
      id: 'new-id-01',
    }

    const newAuth = normalize<Authorization, AuthEntities, string>(
      resp,
      authSchema
    )

    const newState = authsReducer(mockState(), addAuthorization(newAuth))

    expect(newState.allIDs).toContain('new-id-01')
  })

  it('edit auth', () => {
    const org = 'newOrg'

    const resp: Authorization = {
      id: 'id01',
      org,
    }

    const newAuth = normalize<Authorization, AuthEntities, string>(
      resp,
      authSchema
    )

    const newState = authsReducer(mockState(), editAuthorization(newAuth))

    expect(newState.allIDs).toContain('id01')
    expect(newState.byID['id01'].org).toBe(org)
    expect(newState.byID['id01'].orgID).toBe(undefined)
  })

  it('set auth', () => {
    let newState = authsReducer(
      mockState(),
      setAuthorizations(RemoteDataState.NotStarted)
    )
    expect(newState.status).toBe(RemoteDataState.NotStarted)

    newState = authsReducer(
      newState,
      setAuthorizations(RemoteDataState.Loading)
    )
    expect(newState.status).toBe(RemoteDataState.Loading)

    newState = authsReducer(newState, setAuthorizations(RemoteDataState.Error))
    expect(newState.status).toBe(RemoteDataState.Error)

    newState = authsReducer(newState, setAuthorizations(RemoteDataState.Done))
    expect(newState.status).toBe(RemoteDataState.Done)
  })

  it('remova auth', () => {
    const newState = authsReducer(mockState(), removeAuthorization('id01'))
    expect(newState.allIDs).toContain('id02')
    expect(newState.allIDs).not.toContain('id01')
    expect(newState.byID['id01']).toBe(undefined)
    expect(newState.byID['id02']).not.toBe(undefined)
  })
})
