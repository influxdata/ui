// Libraries
import React, {PureComponent} from 'react'

// Decorator
import {ErrorHandling} from 'src/shared/decorators/errors'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'
import TokenCodeSnippet from 'src/shared/components/TokenCodeSnippet'

// Utils
import {event} from 'src/cloud/utils/reporting'

export interface Props {
  token: string
  configID: string
}

@ErrorHandling
class TelegrafInstructions extends PureComponent<Props> {
  componentDidMount() {
    event('telegrafs_page.telegraf_instructions.page_viewed')
  }

  public render() {
    const {token, configID} = this.props
    const configScript = `telegraf --config ${this.origin}/api/v2/telegrafs/${
      configID || ''
    }`
    const exportToken = `export INFLUX_TOKEN=${token || '<INFLUX_TOKEN>'}`
    return (
      <div
        data-testid="setup-instructions"
        className="telegraf-instructions"
        style={{textAlign: 'left'}}
      >
        <h5>1. Install the Latest Telegraf</h5>
        <p>
          You can install the latest Telegraf by visiting the{' '}
          <a
            href="https://portal.influxdata.com/downloads/"
            target="_blank"
            rel="noreferrer"
          >
            InfluxData Downloads&nbsp;
          </a>
          page. If you already have Telegraf installed on your system, make sure
          it's up to date. You will need version 1.9.2 or higher.
        </p>
        <h5>2. Configure your API Token</h5>
        <p>
          Your API token is required for pushing data into InfluxDB. You can
          copy the following command to your terminal window to set an
          environment variable with your API token.
        </p>
        <TokenCodeSnippet token={exportToken} configID={configID} label="CLI" />
        <h5>3. Start Telegraf</h5>
        <p>
          Finally, you can run the following command to start the Telegraf agent
          running on your machine.
        </p>
        <CodeSnippet text={configScript} label="CLI" />
      </div>
    )
  }

  private get origin(): string {
    return window.location.origin
  }
}

export default TelegrafInstructions
