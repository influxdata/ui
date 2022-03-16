import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from '../../../cloud/utils/reporting'

export class InstallDependencies extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.pythonWizard.installDependencies.code.copied')
  }
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          First, you need to install the{' '}
          <code style={{color: '#B7B8FF'}}>influxdb-client</code> module. Run
          the command below in your terminal.
        </p>
        <CodeSnippet
          text="pip3 install influxdb-client"
          onCopy={this.logCopyCodeSnippet}
        />
        <p style={{fontStyle: 'italic'}}>
          You’ll need to have Python 3 installed.
        </p>
      </>
    )
  }
}
