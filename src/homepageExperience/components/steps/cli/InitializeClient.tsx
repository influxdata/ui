// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'
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

// Thunks
import {getBuckets} from 'src/buckets/actions/thunks'

// Helper Components
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {
  Columns,
  ComponentSize,
  Grid,
  InfluxColors,
  Panel,
} from '@influxdata/clockface'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

// Types
import {AppState, Authorization} from 'src/types'

// Styles
import './CliSteps.scss'

type OwnProps = {
  setTokenValue: (tokenValue: string) => void
  tokenValue: string
  onSelectBucket: (bucketName: string) => void
}

const collator = new Intl.Collator(navigator.language || 'en-US')

export const InitializeClient: FC<OwnProps> = ({
  setTokenValue,
  tokenValue,
  onSelectBucket,
}) => {
  const org = useSelector(getOrg)
  const me = useSelector(getMe)
  const allPermissionTypes = useSelector(getAllTokensResources)
  const dispatch = useDispatch()
  const url =
    me.quartzMe?.clusterHost || 'https://us-west-2-1.aws.cloud2.influxdata.com/'
  const currentAuth = useSelector((state: AppState) => {
    return state.resources.tokens.currentAuth.item
  })
  const token = currentAuth.token

  const codeSnippet = `influx config create --config-name onboarding 
  --host-url "${url}" 
  --org "${org.id}" 
  --token "${token}" 
  --active`

  const bucketSnippet = `influx bucket create --name sample-bucket -c onboarding`

  const sortedPermissionTypes = useMemo(
    () => allPermissionTypes.sort((a, b) => collator.compare(a, b)),
    [allPermissionTypes]
  )
  const {bucket} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    dispatch(getBuckets())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onSelectBucket(bucket.name)
  }, [bucket, onSelectBucket])

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
        description: `onboarding-cliWizard-token-${Date.now()}`,
        permissions: allAccessPermissions(sortedPermissionTypes, org.id, me.id),
      }

      dispatch(createAuthorization(authorization))
      event(`firstMile.cliWizard.tokens.tokenCreated`)
    }
  }, [sortedPermissionTypes.length])

  // when token generated, save it to the parent component
  useEffect(() => {
    if (currentAuth.token) {
      setTokenValue(currentAuth.token)
    }
  }, [currentAuth.token])

  useEffect(() => {
    const fireKeyboardCopyEvent = event => {
      if (
        keyboardCopyTriggered(event) &&
        (userSelection().includes('influx config create') ||
          userSelection().includes('influx bucket create'))
      ) {
        logCopyCodeSnippet()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.cliWizard.buckets.code.copied`)
  }

  return (
    <>
      <h1>Initialize Client</h1>
      <h2 className="small-margins">Configure an InfluxDB profile</h2>
      <p className="small-margins">
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
      <h2 className="large-margins">Select or Create a bucket</h2>
      <p className="small-margins">
        A <b>bucket</b> is used to store time-series data. Here is a list of
        your existing buckets. You can select one to use for the rest of the
        tutorial, or create one below.
      </p>
      <Panel backgroundColor={InfluxColors.Grey15}>
        <Panel.Body size={ComponentSize.ExtraSmall}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Twelve}>
                <WriteDataHelperBuckets useSimplifiedBucketForm={true} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Panel.Body>
      </Panel>
      <p className="large-margins">
        We can also create a bucket using the InfluxDB CLI. We'll link the
        bucket to the profile you created.
      </p>
      <CodeSnippet
        text={bucketSnippet}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
    </>
  )
}
