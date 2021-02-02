// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import ConfigFieldSwitcher from 'src/dataLoaders/components/configureStep/streaming/ConfigFieldSwitcher'

// Types
import {ConfigFieldType} from 'src/types'
import {TelegrafPluginInputCpu} from '@influxdata/influx'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    fieldName: '',
    fieldType: ConfigFieldType.String,
    onChange: jest.fn(),
    addTagValue: jest.fn(),
    removeTagValue: jest.fn(),
    index: 0,
    value: '',
    isRequired: true,
    onSetConfigArrayValue: jest.fn(),
    telegrafPluginName: TelegrafPluginInputCpu.NameEnum.Cpu,
    ...override,
  }

  renderWithReduxAndRouter(<ConfigFieldSwitcher {...props} />)
}

describe('Onboarding.Components.ConfigureStep.Streaming.ConfigFieldSwitcher', () => {
  describe('if type is string', () => {
    it('renders an input', async () => {
      const fieldName = 'yo'
      const fieldType = ConfigFieldType.String
      setup({fieldName, fieldType})

      const input = await screen.getByTestId('input-field')

      expect(input).toBeVisible()
    })

    describe('if not required', () => {
      it('optional is displayed as help text', async () => {
        const fieldName = 'yo'
        const fieldType = ConfigFieldType.String
        const value = ''
        setup({
          fieldName,
          fieldType,
          isRequired: false,
          value,
        })

        const input = await screen.getByTestId('input-field')
        const formElement = await screen.queryByTestId('form--help-text')

        expect(input).toBeVisible()
        expect(formElement.innerHTML).toBe('optional')
      })
    })
  })

  describe('if type is array', () => {
    it('renders an array input', async () => {
      const fieldName = ['yo']
      const fieldType = ConfigFieldType.StringArray
      const value = []
      setup({fieldName, fieldType, value})

      const input = await screen.getByTestId('input-field')
      const formElement = await screen.queryByTestId('form--help-text')

      expect(input).toBeVisible()
      expect(formElement).toBeNull()
    })

    describe('if not required', () => {
      it('optional is displayed as help text', async () => {
        const fieldName = ['yo']
        const value = []
        const fieldType = ConfigFieldType.StringArray
        setup({fieldName, fieldType, value, isRequired: false})

        const input = await screen.getByTestId('multiple-input')
        const formElement = await screen.queryByTestId('form--help-text')

        expect(input).toBeVisible()
        expect(formElement.innerHTML).toBe('optional')
      })
    })
  })

  describe('if type is uri', () => {
    it('renders a uri input ', async () => {
      const fieldName = ['http://google.com']
      const fieldType = ConfigFieldType.Uri
      const value = ''
      setup({fieldName, fieldType, value})

      const input = await screen.getByTestId('grid')

      expect(input).toBeVisible()
    })

    describe('if not required', () => {
      it('optional is displayed as help text', async () => {
        const fieldName = ['http://google.com']
        const fieldType = ConfigFieldType.Uri
        const value = ''
        setup({fieldName, fieldType, value, isRequired: false})

        const input = await screen.getByTestId('grid')

        expect(input).toBeVisible()
      })
    })
  })
})
