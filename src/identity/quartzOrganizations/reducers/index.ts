import {QuartzOrganizations} from 'src/identity/apis/auth'
import {
  Actions,
  SET_QUARTZ_ORGANIZATIONS,
  SET_QUARTZ_ORGANIZATIONS_STATUS,
  SET_DEFAULT_QUARTZ_ORG,
} from 'src/identity/quartzOrganizations/actions/creators'
import {emptyOrg} from 'src/identity/components/GlobalHeader/DefaultEntities'
import produce from 'immer'

import {OrganizationSummaries} from 'src/client/unityRoutes'

const initialState = {
  orgs: [emptyOrg] as OrganizationSummaries,
} as QuartzOrganizations

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

      case SET_DEFAULT_QUARTZ_ORG: {
        const {oldDefaultOrgId, newDefaultOrgId} = action

        if (oldDefaultOrgId !== newDefaultOrgId) {
          draftState.orgs.forEach(org => {
            if (org.id === oldDefaultOrgId) {
              org.isDefault = false
            }

            if (org.id === newDefaultOrgId) {
              org.isDefault = true
            }
          })
        }
        return
      }
    }
  })
