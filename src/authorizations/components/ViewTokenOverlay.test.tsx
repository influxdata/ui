// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import ViewTokenOverlay from 'src/authorizations/components/ViewTokenOverlay'

// Fixtures
import {auth} from 'mocks/dummyData'
import {Permission} from '@influxdata/influx'
import {get} from 'lodash'
import {renderWithReduxAndRouter} from 'src/mockState'

const permissions = (
  permissions: Permission[]
): {[x: string]: Permission.ActionEnum[]} => {
  const p = permissions.reduce((acc, {action, resource}) => {
    const {type} = resource
    const name = get(resource, 'name', '')
    let key = `${type}`
    if (name) {
      key = `${type}-${name}`
    }

    let actions = get(acc, key, [])

    if (name && actions) {
      return {...acc, [key]: [...actions, action]}
    }

    actions = get(acc, key || resource.type, [])
    return {...acc, [type]: [...actions, action]}
  }, {})
  return p
}

const setup = (override?) => {
  const props = {
    auth,
    ...override,
  }

  renderWithReduxAndRouter(<ViewTokenOverlay {...props} />)
}

describe('Account', () => {
  describe('rendering', () => {
    it('renders!', async () => {
      setup()

      const elm = await screen.findByTestId('overlay--container')
      expect(elm).toBeVisible()
    })
  })

  describe('if there is all access tokens', () => {
    it('renders permissions correctly', () => {
      const actual = permissions(auth.permissions)

      const expected = {
        'orgs-a': ['read'],
        authorizations: ['read', 'write'],
        buckets: ['read', 'write'],
        dashboards: ['read', 'write'],
        sources: ['read', 'write'],
        tasks: ['read', 'write'],
        telegrafs: ['read', 'write'],
        users: ['read', 'write'],
        variables: ['read', 'write'],
        scrapers: ['read', 'write'],
        secrets: ['read', 'write'],
        labels: ['read', 'write'],
        views: ['read', 'write'],
        documents: ['read', 'write'],
      }

      expect(actual).toEqual(expected)
    })
  })
})
