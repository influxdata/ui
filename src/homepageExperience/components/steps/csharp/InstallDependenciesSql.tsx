import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

export const InstallDependenciesSql: FC = () => {
  const logCopyCodeSnippet = () => {
    event('firstMile.csharpWizard.InstallDependencies.code.copied')
  }

  return (
    <>
      <h1>Install Dependencies</h1>
      <p>
        Install the NuGet package{' '}
        <SafeBlankLink href="https://github.com/InfluxCommunity/influxdb3-csharp">
          InfluxDB3.Client
        </SafeBlankLink>{' '}
        to your project :
      </p>
      <CodeSnippet
        language="properties"
        onCopy={logCopyCodeSnippet}
        text="dotnet add package InfluxDB3.Client"
      />
    </>
  )
}
