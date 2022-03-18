import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export class InstallDependencies extends PureComponent {
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          First, you need to install the{' '}
          <code style={{color: '#B7B8FF'}}>influxdb-client</code> module. Run
          the command below in your terminal.
        </p>
        <CodeSnippet text="pip3 install influxdb-client" onCopy={null} />
        <p style={{fontStyle: 'italic'}}>
          You’ll need to have{' '}
          <SafeBlankLink href="https://www.python.org/download/releases/3.0/">
            Python 3
          </SafeBlankLink>{' '}
          installed.
        </p>
      </>
    )
  }
}
