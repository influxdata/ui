import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export class InstallDependencies extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.nodejsWizard.installDependencies.code.copied')
  }
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          First, you need to install the{' '}
          <code className="homepage-wizard--code-highlight">
            @influxdata/influxdb-client
          </code>{' '}
          module. Run the command below in your terminal.
        </p>
        <CodeSnippet
          text="npm install --save @influxdata/influxdb-client"
          onCopy={this.logCopyCodeSnippet}
        />
        <p style={{fontStyle: 'italic'}}>
          You’ll need to have{' '}
          <SafeBlankLink href="https://nodejs.org/en/">
            Node.js v14 LTS
          </SafeBlankLink>{' '}
          or higher installed.
        </p>
      </>
    )
  }
}
