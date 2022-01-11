// Libraries
import React, {FC, ReactElement} from 'react'

// Components
import {EmptyState, ComponentSize} from '@influxdata/clockface'

// Types
import {FluxToolbarFunction} from 'src/types/shared'

interface Props {
  funcs: any
  searchTerm?: string
  children: (funcs: FluxToolbarFunction[]) => JSX.Element | JSX.Element[]
}

const TransformToolbarFunctions: FC<Props> = props => {
  const {searchTerm, funcs, children} = props
  console.log(typeof funcs)

  const filteredFunctions = funcs.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (filteredFunctions.length === 0) {
    return (
      <EmptyState size={ComponentSize.ExtraSmall}>
        <EmptyState.Text>No functions match your search</EmptyState.Text>
      </EmptyState>
    )
  }

  return children(filteredFunctions) as ReactElement<any>
}

export default TransformToolbarFunctions
