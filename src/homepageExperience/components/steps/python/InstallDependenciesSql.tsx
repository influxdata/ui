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
        <p>
          The first thing you'll need to do is ensure you have{' '}
          <SafeBlankLink href="https://www.python.org/download/releases/3.0/">
            Python 3
          </SafeBlankLink>{' '}
          installed, this will not work with older versions of Python.
        </p>
        <p>
          Install the{' '}
          <SafeBlankLink href="https://github.com/InfluxCommunity/influxdb3-python">
            influxdb3-python
          </SafeBlankLink>{' '}
          module. You'll use this to write and query InfluxDB. Run the command below in
          your terminal:
        </p>
        <CodeSnippet
          language="properties"
          onCopy={this.logCopyCodeSnippet}
          text="pip install influxdb3-python"
        />
        <p>
          Lastly, let's install{' '}
          <SafeBlankLink href="https://pandas.pydata.org/">
            pandas
          </SafeBlankLink>{' '}
          which will be helpful for organizing our data output when we query.
        </p>
        <CodeSnippet
          language="properties"
          onCopy={this.logCopyCodeSnippet}
          text="pip install pandas"
        />
      </>
    )
  }
}
