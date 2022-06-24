import {QuartzOrganizations} from 'src/identity/apis/auth'
import {
  Actions,
  SET_QUARTZ_ORGANIZATIONS,
  SET_QUARTZ_ORGANIZATIONS_STATUS,
} from '../actions/creators'
import produce from 'immer'

import {OrganizationSummaries} from '../../client/unityRoutes'

const initialState = {
  orgs: [
    {id: '', name: '', isActive: false, isDefault: false},
  ] as OrganizationSummaries,
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
    }
  })
