// Reducer
import {
  reducer,
  RuleState,
} from 'src/notifications/rules/components/RuleOverlay.reducer'

// Actions
import {
  addTagRule,
  deleteStatusRule,
  deleteTagRule,
  setActiveSchedule,
  setTagRuleOperator,
  updateRule,
  updateStatusLevel,
  updateStatusRule,
  updateTagRule,
} from 'src/notifications/rules/components/RuleOverlay.actions'

// Types
import {RuleStatusLevel, TagRuleDraft} from 'src/types'
import {TagRuleOperator} from 'src/client/generatedRoutes'

// DummyData
import {notificationRule} from 'mocks/dummyData'

const each = require('jest-each').default

const initialState = (): RuleState => ({...notificationRule})

describe('rule overlay reducer', () => {
  it('can update rule', () => {
    const newRuleName = 'Updated Name'
    const newRule = {...notificationRule, name: newRuleName}

    const actual = reducer(initialState(), updateRule(newRule))

    expect(actual.name).toEqual(newRuleName)
  })

  each([['cron'], ['every']]).it('can set active schedule', schedule => {
    const actual = reducer(initialState(), setActiveSchedule(schedule))
    expect(actual).toHaveProperty(schedule)
  })

  each([['equal'], ['notequal'], ['equalregex'], ['notequalregex']]).it(
    'can add tag rule',
    operator => {
      const newTagRule = {
        cid: 'Random CID',
        value: {
          key: 'tagRuleKey',
          value: 'tagRuleValue',
          operator: operator as TagRuleOperator,
        },
      }

      const actual = reducer(initialState(), addTagRule(newTagRule))
      const actualTagRule = actual.tagRules.filter(
        tagRule => tagRule.cid === newTagRule.cid
      )

      expect(actualTagRule[0].cid).toEqual(newTagRule.cid)
      expect(actualTagRule[0].value['key']).toEqual(newTagRule.value.key)
      expect(actualTagRule[0].value['value']).toEqual(newTagRule.value.value)
      expect(actualTagRule[0].value['operator']).toEqual(
        newTagRule.value.operator
      )
    }
  )

  it('can update tag rule', () => {
    const updatedTagRule: TagRuleDraft = {
      ...notificationRule.tagRules[0],
      value: {
        key: 'updatedTagRuleKey',
        value: 'updatedTagRuleValue',
        operator: 'equal',
      },
    }

    const actual = reducer(initialState(), updateTagRule(updatedTagRule))
    const actualTagRule = actual.tagRules.filter(
      tagRule => tagRule.cid === updatedTagRule.cid
    )

    expect(actualTagRule[0].value['key']).toEqual(updatedTagRule.value.key)
    expect(actualTagRule[0].value['value']).toEqual(updatedTagRule.value.value)
    expect(actualTagRule[0].value['operator']).toEqual(
      updatedTagRule.value.operator
    )
  })

  each([['equal'], ['notequal'], ['equalregex'], ['notequalregex']]).it(
    'can set tag rule operator',
    operator => {
      const tagRuleID = notificationRule.tagRules[0].cid

      expect(
        reducer(
          initialState(),
          setTagRuleOperator(tagRuleID, operator)
        ).tagRules.filter(tagRule => tagRule.cid == tagRuleID)[0]['value'][
          'operator'
        ]
      ).toEqual(operator)
    }
  )

  it('can delete tag rule', () => {
    const tagRuleID = notificationRule.tagRules[0].cid

    const actual = reducer(initialState(), deleteTagRule(tagRuleID))
    const received = actual.tagRules.filter(tagRule => tagRule.cid != tagRuleID)
    expect(received).toEqual([])
  })

  it('can udpate status rules', () => {
    const newStatusRule = {
      ...notificationRule.statusRules[0],
      value: {
        currentLevel: 'CRIT' as RuleStatusLevel,
        previousLevel: 'WARN' as RuleStatusLevel,
      },
    }

    const actual = reducer(initialState(), updateStatusRule(newStatusRule))
    const actualStatusRule = actual.statusRules.filter(
      status => status.cid === newStatusRule.cid
    )

    expect(actualStatusRule[0]).toEqual(newStatusRule)
  })

  each([
    ['currentLevel', 'CRIT'],
    ['previousLevel', 'WARN'],
  ]).it('can update status level', (levelType, newLevel) => {
    const statusID = notificationRule.statusRules[0].cid

    const actual = reducer(
      initialState(),
      updateStatusLevel(statusID, levelType, newLevel)
    )
    const actualStatusRule = actual.statusRules.filter(
      status => status.cid === statusID
    )

    expect(actualStatusRule[0]['value'][levelType]).toEqual(newLevel)
  })

  it('can delete status rule', () => {
    const statusRuleID = notificationRule.statusRules[0].cid

    const actual = reducer(initialState(), deleteStatusRule(statusRuleID))
    const received = actual.statusRules.filter(
      statusRule => statusRule.cid != statusRuleID
    )
    expect(received).toEqual([])
  })
})
