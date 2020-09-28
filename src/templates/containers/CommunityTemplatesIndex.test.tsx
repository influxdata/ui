import React, {Component} from 'react'

jest.mock('src/shared/components/TomlMonacoEditor', () => (<div />))
jest.mock('src/shared/components/FluxMonacoEditor', () => (<div />))
jest.mock('src/shared/components/draggable_column/DraggableColumn', () => (<div />))
jest.mock('src/dashboards/components/variablesControlBar/DraggableDropdown', () => (<div />))
jest.mock('src/shared/decorators/withDragDropContext', () => () => {})
jest.mock('src/notebooks/index', () => {})
jest.mock('src/writeData/constants/contentClientLibraries', () => {})
jest.mock('src/writeData/constants/contentTelegrafPlugins', () => {})
jest.mock('src/writeData/components/WriteDataItem', () => {})
jest.mock('src/writeData/components/WriteDataDetailsView', () => {})

import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'
import {renderWithReduxAndRouter} from 'src/mockState'

import {withRouterProps} from 'mocks/dummyData'

const stateOverride = {
  org: {
    orgID: '12345'
  }
}

describe('the Community Templates integration test', () => {
  it('is super basic', () => {
    const {getByTitle} = renderWithReduxAndRouter(<CommunityTemplatesIndex  />)

    expect(true).toBeTruthy()
  })
})
