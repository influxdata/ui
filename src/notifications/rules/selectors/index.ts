import {AppState, NotificationRuleDraft} from 'src/types'

export const getRuleIDs = (state: AppState): {[x: string]: boolean} => {
  return state.resources.rules.allIDs.reduce(
    (acc, ruleID) => ({...acc, [ruleID]: true}),
    {}
  )
}


export const sortRulesByName = <T extends {name: string}>(
  rules: T[]
): T[] =>
  rules.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))

export const getAllRules = (state: AppState): NotificationRuleDraft[] => {
  const rules: NotificationRuleDraft[] = Object.values(state.resources.rules.byID)
  return !!rules.length ? sortRulesByName(rules) : []
}
