// Types
import {TagRuleOperator} from 'src/client'
import {
  NotificationRuleDraft,
  StatusRuleDraft,
  TagRuleDraft,
  RuleStatusLevel,
} from 'src/types'

export type LevelType = 'currentLevel' | 'previousLevel'
type Schedule = 'cron' | 'every'

export type Action =
  | ReturnType<typeof updateRule>
  | ReturnType<typeof setActiveSchedule>
  | ReturnType<typeof addTagRule>
  | ReturnType<typeof updateTagRule>
  | ReturnType<typeof setTagRuleOperator>
  | ReturnType<typeof deleteTagRule>
  | ReturnType<typeof updateStatusRule>
  | ReturnType<typeof updateStatusLevel>
  | ReturnType<typeof deleteStatusRule>

export const updateRule = (rule: NotificationRuleDraft) =>
  ({
    type: 'UPDATE_RULE',
    rule,
  } as const)

export const setActiveSchedule = (schedule: Schedule) =>
  ({
    type: 'SET_ACTIVE_SCHEDULE',
    schedule,
  } as const)

export const addTagRule = (tagRule: TagRuleDraft) =>
  ({
    type: 'ADD_TAG_RULE',
    tagRule,
  } as const)

export const updateTagRule = (tagRule: TagRuleDraft) =>
  ({
    type: 'UPDATE_TAG_RULE',
    tagRule,
  } as const)

export const setTagRuleOperator = (
  tagRuleID: string,
  operator: TagRuleOperator
) =>
  ({
    type: 'SET_TAG_RULE_OPERATOR',
    tagRuleID,
    operator,
  } as const)

export const deleteTagRule = (tagRuleID: string) =>
  ({
    type: 'DELETE_TAG_RULE',
    tagRuleID,
  } as const)

export const updateStatusRule = (statusRule: StatusRuleDraft) =>
  ({
    type: 'UPDATE_STATUS_RULE',
    statusRule,
  } as const)

export const updateStatusLevel = (
  statusID: string,
  levelType: LevelType,
  level: RuleStatusLevel
) =>
  ({
    type: 'UPDATE_STATUS_LEVEL',
    statusID,
    levelType,
    level,
  } as const)

export const deleteStatusRule = (statusRuleID: string) =>
  ({
    type: 'DELETE_STATUS_RULE',
    statusRuleID,
  } as const)
