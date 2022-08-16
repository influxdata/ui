// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Actions
import {
  createAuthorization,
  getAllResources,
} from 'src/authorizations/actions/thunks'
import {getBuckets} from 'src/buckets/actions/thunks'

// Components
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

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'
import {getAllTokensResources} from 'src/resources/selectors'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

// Types
import {AppState, Authorization} from 'src/types'
import {getTimezoneOffset} from 'src/dashboards/utils/getTimezoneOffset'

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

  const sortedPermissionTypes = useMemo(
    () => allPermissionTypes.sort((a, b) => collator.compare(a, b)),
    [allPermissionTypes]
  )

  const {bucket} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    dispatch(getBuckets())
    dispatch(getAllResources())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onSelectBucket(bucket.name)
  }, [bucket.name, onSelectBucket])

  useEffect(() => {
    if (sortedPermissionTypes.length && tokenValue === null) {
      const authorization: Authorization = {
        orgID: org.id,
        description: `onboarding-arduinoWizard-token-${Date.now()}`,
        permissions: allAccessPermissions(sortedPermissionTypes, org.id, me.id),
      }

      dispatch(createAuthorization(authorization))
      event(`firstMile.arduinoWizard.tokens.tokenCreated`)
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
      if (keyboardCopyTriggered(event) && userSelection().includes('#define')) {
        logCopyCodeSnippet()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  const codeSnippet = `#if defined(ESP32)
  #include <WiFiMulti.h>
  WiFiMulti wifiMulti;
  #define DEVICE "ESP32"
  #elif defined(ESP8266)
  #include <ESP8266WiFiMulti.h>
  ESP8266WiFiMulti wifiMulti;
  #define DEVICE "ESP8266"
  #endif
  
  #include <InfluxDbClient.h>
  #include <InfluxDbCloud.h>
  
  // WiFi AP SSID
  #define WIFI_SSID "YOUR_WIFI_SSID"
  // WiFi password
  #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
  
  #define INFLUXDB_URL "${url}"
  #define INFLUXDB_TOKEN "${token}"
  #define INFLUXDB_ORG "${org.id}"
  #define INFLUXDB_BUCKET "${
    bucket.name === '<BUCKET>' ? 'YOUR_BUCKET' : bucket.name
  }"
  
  // Time zone info
  #define TZ_INFO "UTC${-getTimezoneOffset() / 60}"
  
  // Declare InfluxDB client instance with preconfigured InfluxCloud certificate
  InfluxDBClient client(INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN, InfluxDbCloud2CACert);
  
  // Declare Data point
  Point sensor("wifi_status");
  
  void setup() {
    Serial.begin(115200);
  
    // Setup wifi
    WiFi.mode(WIFI_STA);
    wifiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);
  
    Serial.print("Connecting to wifi");
    while (wifiMulti.run() != WL_CONNECTED) {
      Serial.print(".");
      delay(100);
    }
    Serial.println();
  
    // Accurate time is necessary for certificate validation and writing in batches
    // We use the NTP servers in your area as provided by: https://www.pool.ntp.org/zone/
    // Syncing progress and the time will be printed to Serial.
    timeSync(TZ_INFO, "pool.ntp.org", "time.nis.gov");
  
  
    // Check server connection
    if (client.validateConnection()) {
      Serial.print("Connected to InfluxDB: ");
      Serial.println(client.getServerUrl());
    } else {
      Serial.print("InfluxDB connection failed: ");
      Serial.println(client.getLastErrorMessage());
    }
  }`

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.arduinoWizard.initializeClient.code.copied`)
  }

  return (
    <>
      <h1>Initialize Client</h1>
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
      <h2>Configure an InfluxDB profile</h2>
      <p className="small-margins">
        Next we'll need to configure the client and its initial connection to
        InfluxDB. InfluxDB Cloud uses Tokens to authenticate API access. We've
        created an all-access token for you for this set up process.
      </p>
      <p className="small-margins">
        Paste the following snippet into a blank Arduino sketch file.
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="arduino"
      />
      <p style={{fontSize: '14px', marginTop: '8px', marginBottom: '48px'}}>
        Note: you will need to set the{' '}
        <code className="homepage-wizard--code-highlight">WIFI_SSID</code> and{' '}
        <code className="homepage-wizard--code-highlight">WIFI_PASSWORD</code>{' '}
        variables to the correct values for your wifi router.
      </p>
    </>
  )
}
