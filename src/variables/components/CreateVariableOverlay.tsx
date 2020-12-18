// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import VariableFormContext from 'src/variables/components/VariableFormContext'
import GetResources from 'src/resources/components/GetResources'

// Types
import {ResourceType} from 'src/types'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

type Props = RouteComponentProps<{orgID: string}>

class CreateVariableOverlay extends PureComponent<Props> {
  public render() {
    return (
      <Overlay visible={true} onEscape={this.handleHideOverlay}>
        <Overlay.Container maxWidth={1000}>
          <Overlay.Header
            title="Create Variable"
            onDismiss={this.handleHideOverlay}
          />
          <Overlay.Body>
            <GetResources resources={[ResourceType.Variables]}>
              <ErrorBoundary>
                <VariableFormContext onHideOverlay={this.handleHideOverlay} />
              </ErrorBoundary>
            </GetResources>
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    )
  }

  private handleHideOverlay = () => {
    console.log('helo')
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props

    history.push(`/orgs/${orgID}/settings/variables`)
  }
}

export {CreateVariableOverlay}
export default withRouter(CreateVariableOverlay)
