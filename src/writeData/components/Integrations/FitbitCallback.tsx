import React, {FC, useEffect, useState} from 'react'
import {
  AppWrapper,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {useLocation} from 'react-router-dom'
import {
  FITBIT_CLIENT_ID,
  FITBIT_CLIENT_SECRET,
  FITBIT_REDIRECT_URI,
} from 'src/shared/constants'
import {useDispatch} from 'react-redux'
import {setIntegrationToken} from 'src/writeData/actions'
import {get} from 'lodash'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const getToken = async (code: string) => {
  const URL = 'https://api.fitbit.com/oauth2/token'

  const encodedSecrets = window.btoa(
    `${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`
  )

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${encodedSecrets}`,
  }
  const redirect_uri = encodeURIComponent(FITBIT_REDIRECT_URI)
  const body = `client_id=${FITBIT_CLIENT_ID}&redirect_uri=${redirect_uri}&grant_type=authorization_code&code=${code}`

  const resp = await fetch(URL, {method: 'POST', headers, body})
  const respBody = await resp.json()

  return get(respBody, 'access_token', '')
}

const FitbitCallback: FC = () => {
  const [loading, setLoading] = useState(RemoteDataState.Loading)
  const query = useQuery()
  const code = query.get('code')
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken(code)
      dispatch(setIntegrationToken('fitbit', token))
    }

    fetchToken()
    setLoading(RemoteDataState.Done)
  }, [])

  return (
    <AppWrapper>
      <SpinnerContainer loading={loading} spinnerComponent={<TechnoSpinner />}>
        <h1>You have been authorized!</h1>
      </SpinnerContainer>
    </AppWrapper>
  )
}

export default FitbitCallback
