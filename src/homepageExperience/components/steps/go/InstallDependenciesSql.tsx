import React, {FC} from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

const goModuleSnippet = `mkdir -p influxdb_go_client
cd influxdb_go_client
go mod init influxdb_go_client
touch main.go
`

export const InstallDependenciesSql: FC = () => {
  const logCopyInitializeModuleSnippet = () => {
    event('firstMile.goWizard.initializeModule.code.copied')
  }

  const logCopyInstallCodeSnippet = () => {
    event('firstMile.goWizard.installDependencies.code.copied')
  }

  return (
    <>
      <h1>Install Dependencies</h1>
      <p>
        First, you need to create a new go module. Run the commands below in
        your terminal.
      </p>
      <CodeSnippet
        text={goModuleSnippet}
        onCopy={logCopyInitializeModuleSnippet}
        language="properties"
      />
      <p>
        Install the{' '}
        <SafeBlankLink href="https://github.com/InfluxCommunity/influxdb3-go">
          influxdb3-go
        </SafeBlankLink>{' '}
        module for writing. Run the command below in your terminal:
      </p>
      <CodeSnippet
        language="properties"
        onCopy={logCopyInstallCodeSnippet}
        text="go get github.com/InfluxCommunity/influxdb3-go"
      />
      <p>
        You'll need to have{' '}
        <SafeBlankLink href="https://go.dev/dl/">Go 1.20</SafeBlankLink> or
        higher installed. This sample code assumes you have go tools like{' '}
        <SafeBlankLink href="https://pkg.go.dev/cmd/gofmt">gofmt</SafeBlankLink>{' '}
        and{' '}
        <SafeBlankLink href="https://pkg.go.dev/golang.org/x/tools/cmd/goimports">
          goimports
        </SafeBlankLink>{' '}
        installed.
      </p>
    </>
  )
}
