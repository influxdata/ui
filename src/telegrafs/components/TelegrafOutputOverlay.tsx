// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

// Components
import CodeSnippet, {
  transform,
  Provider as TemplateProvider,
} from 'src/shared/components/CodeSnippet'
import BucketDropdown from 'src/dataLoaders/components/BucketsDropdown'
import {ComponentColor, Button, Overlay} from '@influxdata/clockface'

// Utils
import {downloadTextFile} from 'src/shared/utils/download'
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'

interface OwnProps {
  onClose: () => void
}

interface StateProps {
  org: string
  orgID: string
  server: string
  buckets: Bucket[]
}

type Props = OwnProps & StateProps

const TELEGRAF_OUTPUT = ` [[outputs.influxdb_v2]]
  ## The URLs of the InfluxDB cluster nodes.
  ##
  ## Multiple URLs can be specified for a single cluster, only ONE of the
  ## urls will be written to each interval.
  ##   ex: urls = ["https://us-west-2-1.aws.cloud2.influxdata.com"]
  urls = ["<%= server %>"]

  ## API token for authentication.
  token = "<%= token %>"

  ## Organization is the name of the organization you wish to write to; must exist.
  organization = "<%= org %>"

  ## Destination bucket to write into.
  bucket = "<%= bucket %>"

  ## The value of this tag will be used to determine the bucket.  If this
  ## tag is not set the 'bucket' option is used as the default.
  # bucket_tag = ""

  ## If true, the bucket tag will not be added to the metric.
  # exclude_bucket_tag = false

  ## Timeout for HTTP messages.
  # timeout = "5s"

  ## Additional HTTP headers
  # http_headers = {"X-Special-Header" = "Special-Value"}

  ## HTTP Proxy override, if unset values the standard proxy environment
  ## variables are consulted to determine which proxy, if any, should be used.
  # http_proxy = "http://corporate.proxy:3128"

  ## HTTP User-Agent
  # user_agent = "telegraf"

  ## Content-Encoding for write request body, can be set to "gzip" to
  ## compress body or "identity" to apply no encoding.
  # content_encoding = "gzip"

  ## Enable or disable uint support for writing uints influxdb 2.0.
  # influx_uint_support = false

  ## Optional TLS Config for use on HTTP connections.
  # tls_ca = "/etc/telegraf/ca.pem"
  # tls_cert = "/etc/telegraf/cert.pem"
  # tls_key = "/etc/telegraf/key.pem"
  ## Use TLS but skip chain & host verification
  # insecure_skip_verify = false
`

const OUTPUT_DEFAULTS = {
  server: 'http://127.0.0.1:9999',
  token: '$INFLUX_TOKEN',
  org: 'orgID',
  bucket: 'bucketID',
}

class TelegrafOutputOverlay extends PureComponent<Props> {
  state = {
    selectedBucket: null,
  }

  public render() {
    return <>{this.overlay}</>
  }

  private get buckets() {
    const {buckets} = this.props
    return (buckets || [])
      .filter(item => item.type !== 'system')
      .sort((a, b) => {
        const _a = a.name.toLowerCase()
        const _b = b.name.toLowerCase()

        if (_a > _b) {
          return 1
        }

        if (_a < _b) {
          return -1
        }

        return 0
      })
  }

  private get currentBucket() {
    const _buckets = this.buckets
    const {selectedBucket} = this.state

    if (_buckets.length) {
      return selectedBucket ? selectedBucket : _buckets[0]
    }

    return null
  }

  private get overlay(): JSX.Element {
    const {server, org, orgID} = this.props
    const _buckets = this.buckets
    const bucket = this.currentBucket
    let bucket_dd = null

    if (_buckets.length) {
      bucket_dd = (
        <BucketDropdown
          selectedBucketID={this.currentBucket.id}
          buckets={_buckets}
          onSelectBucket={this.handleSelectBucket}
        />
      )
    }

    return (
      <Overlay.Container maxWidth={1200}>
        <Overlay.Header
          title="Telegraf Output Configuration"
          onDismiss={this.handleDismiss}
        />
        <Overlay.Body>
          <p style={{marginTop: '-18px'}}>
            The $INFLUX_TOKEN can be generated on the
            <Link
              to={`/orgs/${orgID}/load-data/tokens`}
              onClick={this.handleDismiss}
            >
              &nbsp;API Tokens tab
            </Link>
            .
          </p>
          <div style={{marginBottom: '13px'}}>{bucket_dd}</div>
          <div className="output-overlay">
            <TemplateProvider
              variables={{
                server: server || OUTPUT_DEFAULTS.server,
                org: org || OUTPUT_DEFAULTS.org,
                token: '$INFLUX_TOKEN',
                bucket: bucket ? bucket.name : OUTPUT_DEFAULTS.bucket,
              }}
            >
              <CodeSnippet
                text={TELEGRAF_OUTPUT}
                label="telegraf.conf"
                testID="telegraf-output-overlay--code-snippet"
              />
            </TemplateProvider>
          </div>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            color={ComponentColor.Secondary}
            text="Download Config"
            onClick={this.handleDownloadConfig}
          />
        </Overlay.Footer>
      </Overlay.Container>
    )
  }

  private handleDismiss = () => {
    this.props.onClose()
  }

  private handleSelectBucket = bucket => {
    this.setState({
      selectedBucket: bucket,
    })
  }

  private handleDownloadConfig = () => {
    const {server, org} = this.props
    const bucket = this.currentBucket
    const config = transform(
      TELEGRAF_OUTPUT,
      Object.assign({}, OUTPUT_DEFAULTS, {
        server,
        org,
        bucket: bucket ? bucket.name : OUTPUT_DEFAULTS.bucket,
      })
    )
    downloadTextFile(config, 'outputs.influxdb_v2', '.conf')
  }
}

const mstp = (state: AppState) => {
  const {name, id} = getOrg(state)
  const server = window.location.origin
  const buckets = getAll<Bucket>(state, ResourceType.Buckets)

  return {
    org: name,
    orgID: id,
    server,
    buckets,
  }
}

export {TelegrafOutputOverlay}
export default connect<StateProps>(mstp)(TelegrafOutputOverlay)
