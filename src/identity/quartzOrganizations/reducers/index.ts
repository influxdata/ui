import {QuartzOrganizations} from 'src/identity/apis/auth'
import {
  Actions,
  SET_QUARTZ_ORGANIZATIONS,
  SET_QUARTZ_ORGANIZATIONS_STATUS,
  SET_QUARTZ_DEFAULT_ORG,
} from 'src/identity/quartzOrganizations/actions/creators'
import {emptyOrg} from 'src/identity/components/GlobalHeader/DefaultEntities'
import produce from 'immer'

// Types

import {OrganizationSummaries} from 'src/client/unityRoutes'
export const initialState = {
  orgs: [emptyOrg] as OrganizationSummaries,
} as QuartzOrganizations

export class OrgValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OrgValidationError'
  }
}

export default (state = initialState, action: Actions): QuartzOrganizations =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_ORGANIZATIONS: {
        draftState.orgs = action.quartzOrganizations
        return
      }
      case SET_QUARTZ_ORGANIZATIONS_STATUS: {
        draftState.status = action.status
        return
      }

      case SET_QUARTZ_DEFAULT_ORG: {
        // No existing default org is acceptable; oldDefaultOrg may be undefined.
        const oldDefaultOrg = draftState.orgs.find(
          org => org.isDefault === true
        )
        const oldDefaultOrgId = oldDefaultOrg?.id
        const {newDefaultOrgId} = action

        if (oldDefaultOrgId === newDefaultOrgId) {
          return
        }

        let newIdCount = 0

        draftState.orgs.forEach(org => {
          if (org.id === oldDefaultOrgId) {
            org.isDefault = false
          }
          if (org.id === newDefaultOrgId) {
            org.isDefault = true
            newIdCount++
          }
        })

        if (newIdCount !== 1) {
          throw new OrgValidationError(
            'Error: Did not find one old and one new default org.'
          )
        }

        return
      }
    }
  })
