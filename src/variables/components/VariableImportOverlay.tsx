import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import ImportOverlay from 'src/shared/components/ImportOverlay'

// Copy
import {invalidJSON} from 'src/shared/copy/notifications'

// Actions
import {
  createVariableFromTemplate as createVariableFromTemplateAction,
  getVariables as getVariablesAction,
} from 'src/variables/actions/thunks'
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Types
import {ComponentStatus} from '@influxdata/clockface'

// Utils
import jsonlint from 'jsonlint-mod'

interface State {
  status: ComponentStatus
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = RouteComponentProps<{orgID: string}> & ReduxProps

class VariableImportOverlay extends PureComponent<Props> {
  public state: State = {
    status: ComponentStatus.Default,
  }

  public render() {
    return (
      <ImportOverlay
        onDismissOverlay={this.onDismiss}
        resourceName="Variable"
        onSubmit={this.handleImportVariable}
        status={this.state.status}
        updateStatus={this.updateOverlayStatus}
      />
    )
  }

  private onDismiss = () => {
    const {history} = this.props

    history.goBack()
  }

  private updateOverlayStatus = (status: ComponentStatus) =>
    this.setState(() => ({status}))

  private handleImportVariable = (uploadContent: string) => {
    const {createVariableFromTemplate, notify} = this.props

    let template
    this.updateOverlayStatus(ComponentStatus.Default)
    try {
      template = jsonlint.parse(uploadContent)
    } catch (error) {
      this.updateOverlayStatus(ComponentStatus.Error)
      notify(invalidJSON(error.message))
      return
    }

    createVariableFromTemplate(template)

    this.onDismiss()
  }
}

const mdtp = {
  createVariableFromTemplate: createVariableFromTemplateAction,
  getVariables: getVariablesAction,
  notify: notifyAction,
}

const connector = connect(null, mdtp)

export default connector(withRouter(VariableImportOverlay))
