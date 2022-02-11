import {AppState, ResourceType, NotificationRuleDraft} from 'src/types'
import {getAll} from 'src/resources/selectors'

export const getRuleIDs = (state: AppState): {[x: string]: boolean} => {
  return state.resources.rules.allIDs.reduce(
    (acc, ruleID) => ({...acc, [ruleID]: true}),
    {}
  )
}

export const sortRulesByName = <T extends {name: string}>(rules: T[]): T[] =>
  rules.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))

export const getAllRules = (state: AppState) => {
  const rules = getAll<NotificationRuleDraft>(
    state,
    ResourceType.NotificationRules
  )
  return !!rules.length ? sortRulesByName(rules) : []
}
