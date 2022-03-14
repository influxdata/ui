// Libraries
import React, {FC, ReactElement, useMemo} from 'react'

// Components
import {EmptyState, ComponentSize} from '@influxdata/clockface'

// Types
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'

interface Props {
  funcs: any
  searchTerm?: string
  children: (funcs: Fluxdocs[]) => JSX.Element | JSX.Element[]
}

const TransformToolbarFunctions: FC<Props> = props => {
  const {searchTerm, funcs, children} = props

  const sortedFunctions = useMemo(
    () =>
      funcs.sort((a, b) => {
        if (a.package.toLowerCase() === b.package.toLowerCase()) {
          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        } else {
          return a.package.toLowerCase() < b.package.toLowerCase() ? -1 : 1
        }
      }),
    [funcs]
  )

  const filteredFunctions = sortedFunctions.filter(fn => {
    return (
      !searchTerm.length ||
      fn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fn.package.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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
