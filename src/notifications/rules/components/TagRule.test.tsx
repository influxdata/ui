// Libraries
import React from 'react'
import {render, fireEvent} from '@testing-library/react'

// Types
import {
  RuleStateContext,
  RuleDispatchContext,
} from 'src/notifications/rules/components/RuleOverlayProvider'
import TagRule from 'src/notifications/rules/components/TagRule'
import {TagRuleDraft, TagRule as TagRuleType} from 'src/types'

// Mocks
import {notificationRule} from 'mocks/dummyData'

const mockContextValue = {
  state: notificationRule,
  dispatch: jest.fn(),
}

function setup(override = {key: 'key', value: 'value', operator: 'equal'}) {
  const {key, value, operator} = override

  const tagRule: TagRuleDraft = {
    cid: 'Random CID',
    value: {
      key: key,
      value: value,
      operator: operator as TagRuleType['operator'],
    },
  }

  const wrapper = render(
    <RuleStateContext.Provider value={mockContextValue.state}>
      <RuleDispatchContext.Provider value={mockContextValue.dispatch}>
        <TagRule tagRule={tagRule} />
      </RuleDispatchContext.Provider>
    </RuleStateContext.Provider>
  )
  return wrapper
}

describe('TagRule', () => {
  it('renders TagRule component', () => {
    const {getByText, getByTestId} = setup()
    expect(getByText('AND'))
    expect(getByText('When'))
    expect(getByTestId('tag-rule-key--input')).toBeTruthy()
    expect(getByTestId('tag-rule-value--input')).toBeTruthy()
  })

  it('TagRule key input should update input value', () => {
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
