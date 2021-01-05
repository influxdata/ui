import React, {FC, useEffect, useState} from 'react'
import {
  AlignItems,
  AppWrapper,
  ComponentSize,
  CTAButton,
  FlexBox,
  FlexDirection,
  JustifyContent,
  Page,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {connect} from 'react-redux'
import {RouteComponentProps} from 'react-router-dom'

import {useLocation} from 'react-router-dom'
import {
  FITBIT_CLIENT_ID,
  FITBIT_CLIENT_SECRET,
  FITBIT_REDIRECT_URI,
} from 'src/shared/constants'
import {useDispatch} from 'react-redux'
import {setIntegrationToken} from 'src/writeData/actions'
import {get} from 'lodash'
import {ORGS, INTEGRATIONS} from 'src/shared/constants/routes'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {AppState, Organization, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

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

interface StateProps {
  orgs: Organization[]
  org: {id?: string}
}

type Props = StateProps & RouteComponentProps

const FitbitCallback: FC<Props> = ({org, orgs, history}) => {
  const [loading, setLoading] = useState(RemoteDataState.Loading)
  const query = useQuery()
  const code = query.get('code')
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken(code)
      if (!!token) {
        dispatch(setIntegrationToken('fitbit', token))
      }
    }

    fetchToken()
    setLoading(RemoteDataState.Done)
  }, [])

  const fitbitPath = orgID =>
    `/${ORGS}/${orgID}/load-data/${INTEGRATIONS}/fitbit/view`

  const linkToFitbitViewer = () => {
    if (!orgs || !orgs.length) {
      return
    }

    // org from local storage
    if (org && org.id) {
      history.push(fitbitPath(org.id))
      return
    }

    // else default to first org
    history.push(fitbitPath(orgs[0].id))
  }

  return (
    <AppWrapper>
      <Page titleTag={pageTitleSuffixer(['Fitbit', 'Load Data'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title="Fitbit" />
        </Page.Header>
        <Page.Contents fullWidth={false} scrollable={true}>
          <SpinnerContainer
            loading={loading}
            spinnerComponent={<TechnoSpinner />}
          >
            <FlexBox
              direction={FlexDirection.Column}
              alignItems={AlignItems.Center}
              justifyContent={JustifyContent.Center}
              margin={ComponentSize.Large}
            >
              <h1>You have been authorized!</h1>
              <CTAButton onClick={linkToFitbitViewer} text="View My Data" />
            </FlexBox>
          </SpinnerContainer>
        </Page.Contents>
      </Page>
    </AppWrapper>
  )
}

const mstp = (state: AppState) => {
  const org = getOrg(state)
  const orgs = getAll<Organization>(state, ResourceType.Orgs)

  return {orgs, org}
}

export default connect<StateProps>(mstp)(FitbitCallback)
