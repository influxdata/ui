// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {Overlay} from '@influxdata/clockface'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameOrgForm from 'src/organizations/components/RenameOrgForm'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

@ErrorHandling
class RenameOrgOverlay extends PureComponent<
  RouteComponentProps<{orgID: string}>
> {
  public render() {
    return (
      <Overlay visible={true}>
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
    const {history} = this.props

    history.goBack()
  }
}

export default withRouter(RenameOrgOverlay)
