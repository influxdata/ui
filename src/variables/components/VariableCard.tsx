// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import VariableContextMenu from 'src/variables/components/VariableContextMenu'

// Types
import {AppState, Label, Variable} from 'src/types'

// Actions
import {
  addVariableLabelAsync,
  removeVariableLabelAsync,
} from 'src/variables/actions/thunks'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {getOrg} from 'src/organizations/selectors'

interface OwnProps {
  variable: Variable
  onDeleteVariable: (variable: Variable) => void
  onEditVariable: (variable: Variable) => void
  onFilterChange: (searchTerm: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class VariableCard extends PureComponent<Props & RouteComponentProps> {
  public render() {
    const {variable, onDeleteVariable} = this.props

    return (
      <ErrorBoundary>
        <ResourceCard
          testID="resource-card variable"
          contextMenu={
            <VariableContextMenu
              variable={variable}
              onExport={this.handleExport}
              onRename={this.handleRenameVariable}
              onDelete={onDeleteVariable}
            />
          }
        >
          <ResourceCard.Name
            onClick={this.handleNameClick}
            name={variable.name}
            testID={`variable-card--name ${variable.name}`}
          />
          <ResourceCard.Meta>
            <>Type: {variable.arguments.type}</>
          </ResourceCard.Meta>
          {this.labels}
        </ResourceCard>
      </ErrorBoundary>
    )
  }

  private handleNameClick = (): void => {
    const {variable, org, history} = this.props

    history.push(`/orgs/${org.id}/settings/variables/${variable.id}/edit`)
  }

  private get labels(): JSX.Element {
    const {variable, onFilterChange} = this.props

    return (
      <InlineLabels
        selectedLabelIDs={variable.labels}
        onFilterChange={onFilterChange}
        onAddLabel={this.handleAddLabel}
        onRemoveLabel={this.handleRemoveLabel}
      />
    )
  }

  private handleAddLabel = (label: Label): void => {
    const {variable, onAddVariableLabel} = this.props

    onAddVariableLabel(variable.id, label)
  }

  private handleRemoveLabel = (label: Label): void => {
    const {variable, onRemoveVariableLabel} = this.props

    onRemoveVariableLabel(variable.id, label)
  }

  private handleExport = () => {
    const {history, variable, org} = this.props

    history.push(`/orgs/${org.id}/settings/variables/${variable.id}/export`)
  }

  private handleRenameVariable = () => {
    const {history, variable, org} = this.props

    history.push(`/orgs/${org.id}/settings/variables/${variable.id}/rename`)
  }
}

const mstp = (state: AppState) => {
  const org = getOrg(state)

  return {org}
}

const mdtp = {
  onAddVariableLabel: addVariableLabelAsync,
  onRemoveVariableLabel: removeVariableLabelAsync,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(VariableCard))
