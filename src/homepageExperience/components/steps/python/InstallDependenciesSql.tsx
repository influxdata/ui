import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export class InstallDependenciesSql extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.pythonWizard.InstallDependencies.code.copied')
  }
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>The first thing you'll need to do is ensure you have{' '}
          <SafeBlankLink href="https://www.python.org/download/releases/3.0/">
            Python 3
          </SafeBlankLink>{' '}
          installed, this will not work with older versions of Python.</p>
        <p>
          Then, install the{' '}
          <code className="homepage-wizard--code-highlight">
            influxdb-client
          </code>{' '}
          module by running the command below in your terminal:
        </p>
        <CodeSnippet
          text="pip3 install influxdb-client[sql]"
          onCopy={this.logCopyCodeSnippet}
          language="properties"
        />
        <p>
          This also comes with{' '}
          <SafeBlankLink href="https://pandas.pydata.org/">
            pandas
          </SafeBlankLink>{' '}
          which will be helpful for organizing our data output when we query.
        </p>
      </>
    )
  }
}
