// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ComponentStatus, ResourceCard} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import VariableContextMenu from 'src/variables/components/VariableContextMenu'

// Types
import {AppState, Label, Variable} from 'src/types'

// Utils
import {getVariables} from 'src/variables/selectors'
import {validateVariableName} from 'src/variables/utils/validation'

// Actions
import {
  addVariableLabelAsync,
  removeVariableLabelAsync,
} from 'src/variables/actions/thunks'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {downloadVariableTemplate} from '../apis'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface OwnProps {
  variable: Variable
  onDeleteVariable: (variable: Variable) => void
  onFilterChange: (searchTerm: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class VariableCard extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  public render() {
    const {variable, variables, onDeleteVariable} = this.props

    const {error} = validateVariableName(variables, variable.name, variable.id)
    const errorMessage = (error && `Rename required. ${error}`) ?? null
    const status = error ? ComponentStatus.Error : ComponentStatus.Default

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
            errorMessage={errorMessage}
            status={status}
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
    const {variable, match, history} = this.props

    if (isFlagEnabled('createWithDE')) {
      history.push(
        `/orgs/${match.params.orgID}/data-explorer/from/variable/${variable.id}`
      )
      return
    }
    history.push(
      `/orgs/${match.params.orgID}/settings/variables/${variable.id}/edit`
    )
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
    const {variable} = this.props
    downloadVariableTemplate(variable)
  }

  private handleRenameVariable = () => {
    const {history, variable, match} = this.props

    history.push(
      `/orgs/${match.params.orgID}/settings/variables/${variable.id}/rename`
    )
  }
}

const mstp = (state: AppState) => {
  const variables = getVariables(state)

  return {variables}
}

const mdtp = {
  onAddVariableLabel: addVariableLabelAsync,
  onRemoveVariableLabel: removeVariableLabelAsync,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(VariableCard))
