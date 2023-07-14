import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export class InstallDependenciesSql extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.nodejsWizard.InstallDependencies.code.copied')
  }
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          First, you need to install the{' '}
          <SafeBlankLink href="https://github.com/InfluxCommunity/influxdb3-js">
            @influxdata/influxdb3-client
          </SafeBlankLink>{' '}
          module. Run the command below in your terminal.
        </p>
        <h2>NPM project</h2>
        <CodeSnippet
          text="npm install --save @influxdata/influxdb3-client"
          onCopy={this.logCopyCodeSnippet}
          language="properties"
        />
        <h2>Yarn project</h2>
        <CodeSnippet
          text="yarn add @influxdata/influxdb3-client"
          onCopy={this.logCopyCodeSnippet}
          language="properties"
        />
        <p style={{fontStyle: 'italic'}}>
          You’ll need to have{' '}
          <SafeBlankLink href="https://nodejs.org/en/">
            Node.js v16
          </SafeBlankLink>{' '}
          or higher installed.
        </p>
      </>
    )
  }
}
