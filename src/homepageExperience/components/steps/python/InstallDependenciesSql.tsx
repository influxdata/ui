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
          {' '}
          <SafeBlankLink href="https://github.com/influxdata/influxdb-client-python">
            influxdb-client
          </SafeBlankLink>{' '}
          module. You'll use this to write to InfluxDB. Run the command below in your terminal:
        </p>
        <CodeSnippet
          text="pip install influxdb-client"
          onCopy={this.logCopyCodeSnippet}
          language="properties"
        />
        <p>
          Next, install the{' '}
          {' '}
          <SafeBlankLink href="https://github.com/influxdata/flightsql-dbapi">
            flightsql-dbapi
          </SafeBlankLink>.{' '}
          This is used to Query InfluxDB with SQL.
        </p>
        <CodeSnippet
          text="pip install flightsql-dbapi"
          onCopy={this.logCopyCodeSnippet}
          language="properties"
        />
        <p>
          Lastly, let's install{' '}
          <SafeBlankLink href="https://pandas.pydata.org/">
            pandas
          </SafeBlankLink>{' '}
          which will be helpful for organizing our data output when we query.
        </p>
        <CodeSnippet
          text="pip install pandas"
          onCopy={this.logCopyCodeSnippet}
          language="properties"
        />
      </>
    )
  }
}
