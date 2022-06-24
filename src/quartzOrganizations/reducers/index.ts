import {QuartzOrganizations} from 'src/identity/apis/auth'
import {Actions, SET_QUARTZ_ORGANIZATIONS} from '../actions/creators'
import produce from 'immer'

import {OrganizationSummaries} from '../../client/unityRoutes'

const initialState = {
  orgs: [
    {id: '', name: '', isActive: false, isDefault: false},
  ] as OrganizationSummaries,
} as QuartzOrganizations

export default (state = initialState, action: Actions): QuartzOrganizations =>
  /*
    const copyState = cloneDeep(initialState)

    copyState.name = action.name
    copyState.id = action.id

    return copyState
*/

  // draftState.name = action.name

  produce(state, draftState => {
    switch (action.type) {
      case SET_QUARTZ_ORGANIZATIONS: {
        draftState.orgs = action.quartzOrganizations

        // TODO : verify if more copying (deep copying) needed (produce specific)
        return
      }
    }
  })
