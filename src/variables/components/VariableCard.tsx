// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {ComponentStatus, ResourceCard} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import VariableContextMenu from 'src/variables/components/VariableContextMenu'

// Types
import {Label, Variable} from 'src/types'

// Utils
import {getVariables} from 'src/variables/selectors'
import {validateVariableName} from 'src/variables/utils/validation'
import {deleteVariable} from 'src/variables/actions/thunks'

// Actions
import {
  addVariableLabelAsync,
  removeVariableLabelAsync,
} from 'src/variables/actions/thunks'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {downloadVariableTemplate} from '../apis'

interface Props {
  onFilterChange: (searchTerm: string) => void
  variable: Variable
}

const VariableCard: FC<Props> = ({onFilterChange, variable}) => {
  const dispatch = useDispatch()
  const variables = useSelector(getVariables)
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleDeleteVariable = (variable: Variable): void => {
    dispatch(deleteVariable(variable.id))
  }

  const {error} = validateVariableName(variables, variable.name, variable.id)
  const errorMessage = (error && `Rename required. ${error}`) ?? null
  const status = error ? ComponentStatus.Error : ComponentStatus.Default

  const handleNameClick = (): void => {
    history.push(`/orgs/${orgID}/settings/variables/${variable.id}/edit`)
  }

  const handleAddLabel = (label: Label): void => {
    dispatch(addVariableLabelAsync(variable.id, label))
  }

  const handleRemoveLabel = (label: Label): void => {
    dispatch(removeVariableLabelAsync(variable.id, label))
  }

  const handleExport = () => {
    downloadVariableTemplate(variable)
  }

  const handleRenameVariable = () => {
    history.push(`/orgs/${orgID}/settings/variables/${variable.id}/rename`)
  }
  const labels = (
    <InlineLabels
      selectedLabelIDs={variable.labels}
      onFilterChange={onFilterChange}
      onAddLabel={handleAddLabel}
      onRemoveLabel={handleRemoveLabel}
    />
  )

  return (
    <ErrorBoundary>
      <ResourceCard
        testID="resource-card variable"
        contextMenu={
          <VariableContextMenu
            variable={variable}
            onExport={handleExport}
            onRename={handleRenameVariable}
            onDelete={handleDeleteVariable}
          />
        }
      >
        <ResourceCard.Name
          onClick={handleNameClick}
          name={variable.name}
          testID={`variable-card--name ${variable.name}`}
          errorMessage={errorMessage}
          status={status}
        />
        <ResourceCard.Meta>
          <>Type: {variable.arguments.type}</>
        </ResourceCard.Meta>
        {labels}
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default VariableCard
