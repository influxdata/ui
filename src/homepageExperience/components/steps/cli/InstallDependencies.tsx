import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {ComponentColor, Button, ButtonGroup, Orientation, Table, BorderType} from '@influxdata/clockface'

import React, {useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {getBuckets} from 'src/buckets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

export const InstallDependencies = () => {

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getBuckets())
  }, [])

  const logCopyCodeSnippetMac = () => {
    event('firstMile.cliWizard.installDependenciesMac.code.copied')
  }
  const logCopyCodeSnippetWindows = () => {
    event('firstMile.cliWizard.installDependenciesWindows.code.copied')
  }
  const logCopyCodeSnippetLinux = () => {
    event('firstMile.cliWizard.installDependenciesLinux.code.copied')
  }

  const windowsCodeSnippet = "> Expand-Archive .\\influxdb2-client-latest-amd64.zip -DestinationPath 'C:\\Program Files\\InfluxData\\'\n" +
  "> mv 'C:\\Program Files\\InfluxData\\influxdb2-client-latest-windows-amd64' 'C:\\Program Files\\InfluxData\\influx'"
  const linuxCodeSnippetA = `# amd64
wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-latest-linux-amd64.tar.gz
  
# arm
wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-latest-linux-arm64.tar.gz
  `
  const linuxCodeSnippetB = `# amd64
tar xvzf path/to/influxdb2-client-latest-linux-amd64.tar.gz
  
# arm
tar xvzf path/to/influxdb2-client-latest-linux-arm64.tar.gz
  `
  const linuxCodeSnippetC = `# amd64
sudo cp influxdb2-client-latest-linux-amd64/influx /usr/local/bin/
            
# arm
sudo cp influxdb2-client-latest-linux-arm64/influx /usr/local/bin/
  `

  const [macSelected, setMacSelected] = useState(true)
  const [windowsSelected, setWindowsSelected] = useState(false)
  const [linuxSelected, setLinuxSelected] = useState(false)

    return (
      <>
      <h1>Install Dependencies</h1>
      <ButtonGroup orientation={Orientation.Horizontal}>
        <Button 
          text='mac OS'
          color={macSelected ? ComponentColor.Primary : ComponentColor.Default}
          onClick={() => {
            setMacSelected(true)
            setWindowsSelected(false)
            setLinuxSelected(false)
          }}
        />
        <Button 
          text='windows'
          color={windowsSelected ? ComponentColor.Primary : ComponentColor.Default}
          onClick={() => {
            setMacSelected(false)
            setWindowsSelected(true)
            setLinuxSelected(false)
          }}
        />
        <Button 
          text='linux'
          color={linuxSelected ? ComponentColor.Primary : ComponentColor.Default}
          onClick={() => {
            setMacSelected(false)
            setWindowsSelected(false)
            setLinuxSelected(true)
          }}
        />
      </ButtonGroup>
      {macSelected && (
      <>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Use Homebrew</h2>
        <CodeSnippet
          text="brew install influxdb-cli"
          onCopy={logCopyCodeSnippetMac}
          language="properties"
        />
        <p>
          If you prefer to manually download and install the CLI package, follow our{' '}
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/tools/influx-cli/">  
            documentation.
          </SafeBlankLink>{' '}
        </p>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Useful InfluxCLI commands</h2>
        <p>
          To invoke a command, use the following format in the command line:
        </p>
        <p style={{marginLeft: '40px'}}>
          influx [command]
        </p>
        <Table borders={BorderType.All}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>bucket</Table.Cell>
              <Table.Cell>Bucket management commands</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>export</Table.Cell>
              <Table.Cell>Export resources as a template</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>help</Table.Cell>
              <Table.Cell>List all commands</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>help [command]</Table.Cell>
              <Table.Cell>Get help with an individual command</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>query</Table.Cell>
              <Table.Cell>Execute a Flux query</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>write</Table.Cell>
              <Table.Cell>Write points to InfluxDB</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <p>
          Full list of commands is available in our {' '}
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/reference/cli/influx/">  
            documentation.
          </SafeBlankLink>{' '}
        </p>
      </>
      )}
      {windowsSelected && (
      <>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Download the CLI package</h2>
        <p>
          {' '}
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/tools/influx-cli/?t=Windows">  
            Download via our documentation.
          </SafeBlankLink>{' '}
        </p>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Expand the downloaded archive</h2>
        <p>
          Expand the downloaded archive into C:\Program Files\InfluxData\ and rename it if desired
        </p>
        <CodeSnippet
          text={windowsCodeSnippet}
          onCopy={logCopyCodeSnippetWindows}
          language="properties"
        />
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Grant network access (optional)</h2>
        <p>To grant the InfluxCLI the required access, do the following:</p>
        <p>1. Select Private networks, such as my home or work network </p>
        <p>2. Click Allow access</p>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Useful InfluxCLI commands</h2>
        <p>
          To invoke a command, use the following format in the command line:
        </p>
        <p style={{marginLeft: '40px'}}>
          influx [command]
        </p>
        <Table borders={BorderType.All}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>bucket</Table.Cell>
              <Table.Cell>Bucket management commands</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>export</Table.Cell>
              <Table.Cell>Export resources as a template</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>help</Table.Cell>
              <Table.Cell>List all commands</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>help [command]</Table.Cell>
              <Table.Cell>Get help with an individual command</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>query</Table.Cell>
              <Table.Cell>Execute a Flux query</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>write</Table.Cell>
              <Table.Cell>Write points to InfluxDB</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <p>
          Full list of commands is available in our {' '}
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/reference/cli/influx/">  
            documentation.
          </SafeBlankLink>{' '}
        </p>
      </>
      )}
      {linuxSelected && (
      <>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Download from the command line</h2>
        <CodeSnippet
          text={linuxCodeSnippetA}
          onCopy={logCopyCodeSnippetLinux}
          language="properties"
        />
        <p>
          If you prefer to manually download and install the CLI package, follow our{' '}
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/tools/influx-cli/?t=Linux">  
            documentation.
          </SafeBlankLink>{' '}
        </p>
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Unpackage the downloaded package</h2>
        <p>
          Install the downloaded InfluxDB client package. 
          Adjust filenames, paths, and utilities as needed.
        </p>
        <CodeSnippet
          text={linuxCodeSnippetB}
          onCopy={logCopyCodeSnippetLinux}
          language="properties"
        />
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Place the executable in your $PATH (optional)</h2>
        <p>If you do not move the influx binary into your $PATH, prefix the executable ./ to run it in place.</p>
        <CodeSnippet
          text={linuxCodeSnippetC}
          onCopy={logCopyCodeSnippetLinux}
          language="properties"
        />
        <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Useful InfluxCLI commands</h2>
        <p>
          To invoke a command, use the following format in the command line:
        </p>
        <p style={{marginLeft: '40px'}}>
          influx [command] 
        </p>
        <Table borders={BorderType.All}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>bucket</Table.Cell>
              <Table.Cell>Bucket management commands</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>export</Table.Cell>
              <Table.Cell>Export resources as a template</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>help</Table.Cell>
              <Table.Cell>List all commands</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>help [command]</Table.Cell>
              <Table.Cell>Get help with an individual command</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>query</Table.Cell>
              <Table.Cell>Execute a Flux query</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>write</Table.Cell>
              <Table.Cell>Write points to InfluxDB</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <p>
          Full list of commands is available in our {' '}
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/reference/cli/influx/">  
            documentation.
          </SafeBlankLink>{' '}
        </p>
      </>
      )}
      </>
    )
}