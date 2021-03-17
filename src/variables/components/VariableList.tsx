// Libraries
import React, {FC, useMemo} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import VariableCard from 'src/variables/components/VariableCard'

// Types
import {Variable} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'
import {validateVariableName} from '../utils/validation'

interface ValidatedVariable {
  description: string
  variable: Variable
}

interface Props {
  variables: Variable[]
  emptyState: JSX.Element
  onDeleteVariable: (variable: Variable) => void
  onFilterChange: (searchTerm: string) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

const VariableList: FC<Props> = props => {
  const {
    emptyState,
    variables,
    sortKey,
    sortDirection,
    sortType,
    onDeleteVariable,
    onFilterChange,
  } = props

  const sortedVariables = useMemo(
    () => getSortedResources(variables, sortKey, sortDirection, sortType),
    [variables, sortKey, sortDirection, sortType]
  )

  const validatedVariables = useMemo(
    () =>
      sortedVariables.map(variable => {
        const validated: ValidatedVariable = {
          description: '',
          variable,
        }
        const {error} = validateVariableName(
          sortedVariables,
          variable.name,
          variable.id
        )
        if (error) {
          validated.description = `Please rename. ${error}`
        }
        return validated
      }),
    [sortedVariables]
  )

  return (
    <>
      <ResourceList>
        <ResourceList.Body emptyState={emptyState}>
          {validatedVariables.map(({description, variable}, index) => (
            <VariableCard
              key={variable.id || `variable-${index}`}
              variable={variable}
              description={description}
              onDeleteVariable={onDeleteVariable}
              onFilterChange={onFilterChange}
            />
          ))}
        </ResourceList.Body>
      </ResourceList>
    </>
  )
}

export default VariableList
