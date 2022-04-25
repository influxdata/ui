import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export class InstallDependencies extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.goWizard.installDependencies.code.copied')
  }
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          First, you need to install the{' '}
          <code style={{color: '#B7B8FF'}}>influxdb-client-go</code> module. Run
          the command below in your terminal.
        </p>
        <CodeSnippet
          text="go get github.com/influxdata/influxdb-client-go/v2"
          onCopy={this.logCopyCodeSnippet}
        />
        <p style={{fontStyle: 'italic'}}>
          You’ll need to have{' '}
          <SafeBlankLink href="https://go.dev/dl/">
            Go 1.17
          </SafeBlankLink>{' '}
          or higher installed.
        </p>
      </>
    )
  }
}
