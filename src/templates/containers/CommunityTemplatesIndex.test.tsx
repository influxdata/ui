import React, {Component} from 'react'

import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'
import {renderWithReduxAndRouter} from 'src/mockState'

import {withRouterProps} from 'mocks/dummyData'

describe('the Community Templates integration test', () => {
  it('is super basic', () => {
    const props = {...withRouterProps}
    const {getByTitle} = renderWithReduxAndRouter(<CommunityTemplatesIndex {...props} />, () => redux)

    expect(true).toBeTruthy()
  })
})
