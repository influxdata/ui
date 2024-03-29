// Libraries
import React, {PureComponent} from 'react'
import {CommunityTemplateReadme} from 'src/templates/components/CommunityTemplateReadme'
import {Overlay, Button, ComponentSize} from '@influxdata/clockface'

interface Props {
  url: string
}

interface State {
  isVisible: boolean
}

export class CommunityTemplateReadMeOverlay extends PureComponent<
  Props,
  State
> {
  state = {isVisible: false}

  render() {
    return (
      <React.Fragment>
        <Button
          text="View Readme"
          size={ComponentSize.Small}
          onClick={this.showOverlay}
          testID="community-template-readme-overlay-button"
          style={{display: 'inline-block'}}
        />
        <Overlay visible={this.state.isVisible}>
          <Overlay.Container maxWidth={800} testID="template-install-overlay">
            <Overlay.Header title="Read Me" onDismiss={this.onDismiss} />
            <Overlay.Body>
              <CommunityTemplateReadme url={this.props.url} />
            </Overlay.Body>
          </Overlay.Container>
        </Overlay>
      </React.Fragment>
    )
  }

  private showOverlay = () => {
    this.setState({isVisible: true})
  }

  private onDismiss = () => {
    this.setState({isVisible: false})
  }
}
