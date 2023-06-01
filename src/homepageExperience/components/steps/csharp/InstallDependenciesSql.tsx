import React, {PureComponent} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export class InstallDependenciesSql extends PureComponent {
  private logCopyCodeSnippet = () => {
    event('firstMile.csharpWizard.InstallDependencies.code.copied')
  }
  render() {
    return (
      <>
        <h1>Install Dependencies</h1>
        <p>
          Install the NuGet package to your project{' '}
          <SafeBlankLink href="https://github.com/bonitoo-io/influxdb3-csharp">
            InfluxDB3.Client
          </SafeBlankLink>{' '}
          :
        </p>
        <CodeSnippet
          language="properties"
          onCopy={this.logCopyCodeSnippet}
          text="dotnet add package InfluxDB3.Client"
        />
      </>
    )
  }
}
