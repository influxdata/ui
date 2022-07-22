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
import {RemoteDataState} from 'src/types'

export const initialState = {
  orgs: [emptyOrg] as OrganizationSummaries,
  status: RemoteDataState.NotStarted,
} as QuartzOrganizations

export default (state = initialState, action: Actions): QuartzOrganizations =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_ORGANIZATIONS: {
        draftState.orgs = action.quartzOrganizations
        draftState.status = RemoteDataState.Done

        return
      }

      case SET_QUARTZ_ORGANIZATIONS_STATUS: {
        draftState.status = action.status
        return
      }

      case SET_QUARTZ_DEFAULT_ORG: {
        const oldDefaultOrg = draftState.orgs.find(
          org => org.isDefault === true
        )
        if (oldDefaultOrg === undefined) {
          draftState.status = RemoteDataState.Error
          return
        }

        const oldDefaultOrgId = oldDefaultOrg.id
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
          draftState.status = RemoteDataState.Error
          return
        }

        draftState.status = RemoteDataState.Done
        return
      }
    }
  })
