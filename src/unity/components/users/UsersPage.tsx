// Libraries
import React, {useReducer, Dispatch, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router'

// Components
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import UsersListContainer from './UserListContainer'

// Selectors
import {getMe} from 'src/me/selectors'

// Reducers
import {
  UserListState,
  Action,
  userListReducer,
  UserListReducer,
  initialState,
} from 'src/unity/reducers'

// Thunks
import {getUsersAndInvites} from 'src/unity/thunks'

export const UserListContext = React.createContext(null)
export type UserListContextResult = [UserListState, Dispatch<Action>]

function UsersPage() {
  const {orgID} = useParams<{orgID: string}>()
  const {id} = useSelector(getMe)

  const [state, dispatch] = useReducer<UserListReducer>(
    userListReducer,
    initialState({
      currentUserID: id,
      orgID,
    })
  )

  useEffect(() => {
    getUsersAndInvites(dispatch)
  }, [dispatch])

  const loading = state ? state.status : RemoteDataState.NotStarted

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
      <UserListContext.Provider value={[state, dispatch]}>
        <UsersListContainer />
      </UserListContext.Provider>
    </SpinnerContainer>
  )
}

export default UsersPage
