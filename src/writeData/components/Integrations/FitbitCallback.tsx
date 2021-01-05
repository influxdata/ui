import React, {FC, useEffect, useState} from 'react'
import {
  AppWrapper,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {useLocation} from 'react-router-dom'
import {FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET} from 'src/shared/constants'

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
  const body = `client_id=${FITBIT_CLIENT_ID}&redirect_uri=https%3A%2F%2Fkubernetes.docker.internal%3A8080%2Ffitbit-api-callback&grant_type=authorization_code&code=${code}`

  await fetch(URL, {method: 'POST', headers, body})
}

const FitbitCallback: FC = () => {
  const [loading, setLoading] = useState(RemoteDataState.Loading)
  const query = useQuery()
  const code = query.get('code')

  useEffect(() => {
    const fetchToken = async () => await getToken(code)
    console.log(fetchToken())

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
