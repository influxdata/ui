// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {Overlay} from '@influxdata/clockface'
import _ from 'lodash'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameOrgForm from 'src/organizations/components/RenameOrgForm'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

@ErrorHandling
class RenameOrgOverlay extends PureComponent<
  RouteComponentProps<{orgID: string}>
> {
  state = {
    visible: false,
  }
  componentDidMount() {
    this.setState({visible: true})
  }

  private closeOverlay = () => {
    this.setState({visible: false})
    this.handleClose()
  }

  public render() {
    return (
      <Overlay visible={this.state.visible} onEscape={this.closeOverlay}>
        <DangerConfirmationOverlay
          title="Rename Organization"
          message={this.message}
          effectedItems={this.effectedItems}
          onClose={this.handleClose}
          confirmButtonText="I understand, let's rename my Organization"
        >
          <RenameOrgForm />
        </DangerConfirmationOverlay>
      </Overlay>
    )
  }

  private get message(): string {
    return 'Updating the name of an Organization can have unintended consequences. Anything that references this Organization by name will stop working including:'
  }

  private get effectedItems(): string[] {
    return [
      'Queries',
      'Dashboards',
      'Tasks',
      'Telegraf Configurations',
      'Client Libraries',
    ]
  }

  private handleClose = () => {
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props

    history.push(`/orgs/${orgID}/about`)
  }
}

export default withRouter(RenameOrgOverlay)
