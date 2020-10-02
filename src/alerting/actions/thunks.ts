// Actions
import {executeQueries} from 'src/timeMachine/actions/queries'
import {setEvery} from 'src/alerting/actions/alertBuilder'

export const selectCheckEvery = (every: string) => dispatch => {
  dispatch(setEvery(every))
  dispatch(executeQueries())
}
