// Libraries
import React from 'react'
import {fireEvent} from '@testing-library/react'

// Types
import RuleOverlayProvider from 'src/notifications/rules/components/RuleOverlayProvider'
import {TagRuleDraft, TagRule as TagRuleType} from 'src/types'

// Mocks
import {notificationRule} from 'mocks/dummyData'
import {renderWithReduxAndRouter} from 'src/mockState'
import RuleOverlayContents from './RuleOverlayContents'
import {DURATIONS} from 'src/timeMachine/constants/queryBuilder'
import {CHECK_OFFSET_OPTIONS} from 'src/alerting/constants'

function setup(override = {key: 'key', value: 'value', operator: 'equal'}) {
  const {key, value, operator} = override

  const tagRule: TagRuleDraft = {
    cid: notificationRule.tagRules[0].cid,
    value: {
      key: key,
      value: value,
      operator: operator as TagRuleType['operator'],
    },
  }

  const rule = {...notificationRule, tagRules: [tagRule]}

  const wrapper = renderWithReduxAndRouter(
    <RuleOverlayProvider initialState={rule}>
      <RuleOverlayContents onSave={jest.fn()} saveButtonText="Save" />
    </RuleOverlayProvider>
  )
  return wrapper
}

describe('RuleOverlayContents', () => {
  it('renders RuleOverlayContents components', () => {
    const {getByTestId} = setup()
    expect(getByTestId('rule-name--input'))
  })
  it('name input should update input value', () => {
    const {getByTestId} = setup()
    const ruleName = 'NewRuleName'
    const input = getByTestId('rule-name--input')
    fireEvent.change(input, {target: {value: ruleName}})
    expect(getByTestId('rule-name--input').getAttribute('value')).toBe(ruleName)
  })
})

describe('RuleSchedule', () => {
  it('renders RuleSchedule component', () => {
    const {getByTestId} = setup()
    expect(getByTestId('rule-schedule-every--input'))
    expect(getByTestId('rule-schedule-offset--input'))
  })
  it('should update schedule every', () => {
    const {getByTestId} = setup()
    const duration = DURATIONS[4]
    const input = getByTestId('rule-schedule-every--input')
    fireEvent.change(input, {target: {value: duration}})
    expect(
      getByTestId('rule-schedule-every--input').getAttribute('value')
    ).toBe(duration)
  })
  it('should update offset options', () => {
    const {getByTestId} = setup()
    const offsetOptions = CHECK_OFFSET_OPTIONS[4]
    const input = getByTestId('rule-schedule-offset--input')
    fireEvent.change(input, {target: {value: offsetOptions}})
    expect(
      getByTestId('rule-schedule-offset--input').getAttribute('value')
    ).toBe(offsetOptions)
  })
})

describe('RuleConditions', () => {
  it('should render RuleConditions component', () => {
    const {getByTestId} = setup()
    expect(getByTestId('add-tag-filter--button'))
  })
  it('renders StatusRule Component', () => {
    const {getByTestId} = setup()
    expect(getByTestId('status-rule'))
  })
  it('clicking add buttons renders TagRuleComponent', () => {
    const {getByTestId} = setup()
    const input = getByTestId('add-tag-filter--button')
    fireEvent.change(input)
    expect(getByTestId('tag-rule'))
  })
})

describe('RuleMessage', () => {
  it('renders RuleMessage component', () => {
    const {getByTestId} = setup()
    expect(getByTestId('rule-message'))
  })
})

describe('TagRule', () => {
  it('renders TagRule component', () => {
    const {getByText, getByTestId} = setup()
    expect(getByText('AND'))
    expect(getByText('When'))
    expect(getByTestId('tag-rule-key--input'))
    expect(getByTestId('tag-rule-value--input'))
  })

  it('key input should update input value', () => {
    const {getByTestId} = setup()
    const input = getByTestId('tag-rule-key--input')
    fireEvent.change(input, {target: {value: 'random key'}})
    expect(getByTestId('tag-rule-key--input').getAttribute('value')).toBe(
      'random key'
    )
  })

  it('TagRule value input should update input value', () => {
    const {getByTestId} = setup()
    const input = getByTestId('tag-rule-value--input')
    fireEvent.change(input, {target: {value: 'random value'}})
    expect(getByTestId('tag-rule-value--input').getAttribute('value')).toBe(
      'random value'
    )
  })
})
