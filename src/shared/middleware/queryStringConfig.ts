import {Middleware, Dispatch, Action} from 'redux'

import {enablePresentationMode} from 'src/shared/actions/app'

export const queryStringConfig: Middleware =
  () => (dispatch: Dispatch<Action>) => (action: Action) => {
    dispatch(action)

    if (new URLSearchParams(window.location.search).get('present') === 'true') {
      dispatch(enablePresentationMode())
    }
  }
