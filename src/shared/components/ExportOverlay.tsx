import React, {PureComponent} from 'react'

// Components
import {
  Form,
  Button,
  SpinnerContainer,
  TechnoSpinner,
  Overlay,
} from '@influxdata/clockface'
import {Controlled as ReactCodeMirror} from 'react-codemirror2'
import CopyButton from 'src/shared/components/CopyButton'

// Utils
import {downloadTextFile} from 'src/shared/utils/download'

// Types
import {DocumentCreate} from '@influxdata/influx'
import {ComponentColor, ComponentSize} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

interface Props {
  onDismissOverlay: () => void
  resource: DocumentCreate
  resourceName: string
  onCopy?: () => void
  status: RemoteDataState
  isVisible: boolean
}

export default class ExportOverlay extends PureComponent<Props> {
  public static defaultProps = {
    isVisible: true,
  }

  public render() {
    const {isVisible, resourceName, onDismissOverlay, status} = this.props

    return (
      <Overlay visible={isVisible}>
        <Overlay.Container maxWidth={800}>
          <Form onSubmit={this.handleExport}>
            <Overlay.Header
              title={`Export ${resourceName}`}
              onDismiss={onDismissOverlay}
            />
            <Overlay.Body>
              <SpinnerContainer
                loading={status}
                spinnerComponent={<TechnoSpinner />}
              >
                {this.overlayBody}
              </SpinnerContainer>
            </Overlay.Body>
            <Overlay.Footer>
              {this.downloadButton}
              {this.copyButton}
            </Overlay.Footer>
          </Form>
        </Overlay.Container>
      </Overlay>
    )
  }

  private doNothing = () => {}

  private get overlayBody(): JSX.Element {
    const options = {
      tabIndex: 1,
      mode: 'json',
      readonly: true,
      lineNumbers: true,
      autoRefresh: true,
      theme: 'time-machine',
      completeSingle: false,
    }
    return (
      <div
        className="export-overlay--text-area"
        data-testid="export-overlay--text-area"
      >
        <ReactCodeMirror
          autoFocus={false}
          autoCursor={true}
          value={this.resourceText}
          options={options}
          onBeforeChange={this.doNothing}
          onTouchStart={this.doNothing}
        />
      </div>
    )
  }

  private get resourceText(): string {
    return JSON.stringify(this.props.resource, null, 2)
  }

  private get copyButton(): JSX.Element {
    return (
      <CopyButton
        text={this.resourceText}
        onCopy={this.props.onCopy}
        size={ComponentSize.Small}
      />
    )
  }

  private get downloadButton(): JSX.Element {
    return (
      <Button
        text="Download JSON"
        onClick={this.handleExport}
        color={ComponentColor.Primary}
      />
    )
  }

  private handleExport = (): void => {
    const {resource, resourceName, onDismissOverlay} = this.props
    const name = resource?.content?.data?.attributes?.name || resourceName
    downloadTextFile(JSON.stringify(resource, null, 1), name, '.json')
    onDismissOverlay()
  }
}
