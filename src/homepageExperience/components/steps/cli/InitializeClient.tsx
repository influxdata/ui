// Libraries
import React, {FC, useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Actions
import {
  createAuthorization,
  getAllResources,
} from 'src/authorizations/actions/thunks'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'
import {getAllTokensResources} from 'src/resources/selectors'

// Helper Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'

// Types
import {AppState, Authorization} from 'src/types'

type OwnProps = {
  wizardEventName: string
  setTokenValue: (tokenValue: string) => void
  tokenValue: string
}

// Style

const inlineStyle = {
  marginTop: '0px',
  marginBottom: '8px',
}

const collator = new Intl.Collator(navigator.language || 'en-US')

export const InitializeClient: FC<OwnProps> = ({
  wizardEventName,
  setTokenValue,
  tokenValue,
}) => {
  const org = useSelector(getOrg)
  const me = useSelector(getMe)
  const allPermissionTypes = useSelector(getAllTokensResources)
  const dispatch = useDispatch()
  const url =
    me.quartzMe?.clusterHost || 'https://us-west-2-1.aws.cloud2.influxdata.com/'
  const orgID = org.id
  const currentAuth = useSelector((state: AppState) => {
    return state.resources.tokens.currentAuth.item
  })
  const token = currentAuth.token

  const codeSnippet = `influx config create --config-name onboarding 
  --host-url "${url}" 
  --org "${orgID}" 
  --token "${token}" 
  --active`

  const bucketSnippet = `influx bucket create --name sample-bucket -c onboarding`

  const sortedPermissionTypes = useMemo(
    () => allPermissionTypes.sort((a, b) => collator.compare(a, b)),
    [allPermissionTypes]
  )

  useEffect(() => {
    const fetchResources = async () => {
      await dispatch(getAllResources())
    }
    fetchResources()
  }, [])

  useEffect(() => {
    if (sortedPermissionTypes.length && tokenValue === null) {
      const authorization: Authorization = {
        orgID: org.id,
        description: `onboarding-${wizardEventName}-token-${Date.now()}`,
        permissions: allAccessPermissions(sortedPermissionTypes, org.id, me.id),
      }

      dispatch(createAuthorization(authorization))
      event(`firstMile.${wizardEventName}.tokens.tokenCreated`)
    }
  }, [sortedPermissionTypes.length])

  // when token generated, save it to the parent component
  useEffect(() => {
    if (currentAuth.token) {
      setTokenValue(currentAuth.token)
    }
  }, [currentAuth.token])

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.${wizardEventName}.buckets.code.copied`)
  }

  return (
    <>
      <h1>Initialize Client</h1>
      <h2 style={inlineStyle}>Configure an InfluxDB profile</h2>
      <p style={inlineStyle}>
        Next we'll need to configure the client and its initial connection to
        InfluxDB.
      </p>
      <p>
        The snippet below creates a configuration profile named onboarding. You
        may choose a different name if you'd like. You'll likely create another
        profile using a different token for working with your own data.
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p style={{fontSize: '14px', marginTop: '8px', marginBottom: '48px'}}>
        Note: we've created an all-access token here for simplicity, but we
        recommend using a token with more specific permissions in the long-term.
        You can edit your tokens anytime from the app.
      </p>
      <h2 style={{marginTop: '48px', marginBottom: '8px'}}>Create a bucket</h2>
      <p style={inlineStyle}>
        Now we'll create a bucket. A <b>bucket</b> is used to store time-series
        data. We'll link the bucket to the profile you created.
      </p>
      <CodeSnippet
        text={bucketSnippet}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
    </>
  )
}
