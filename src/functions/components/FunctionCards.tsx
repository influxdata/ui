import React, {FC, useContext} from 'react'

// Components
import {ComponentSize, EmptyState, ResourceList} from '@influxdata/clockface'
import FunctionCard from 'src/functions/components/FunctionCard'
import {FunctionListContext} from 'src/functions/context/function.list'

// Types
// import {Function} from 'src/client/managedFunctionsRoutes'

interface Props {
  searchTerm: string
}

const FunctionCards: FC<Props> = ({searchTerm}) => {
  const {functionsList} = useContext(FunctionListContext)

  return (
    <ResourceList>
      <ResourceList.Body
        emptyState={
          <EmptyState size={ComponentSize.Large}>
            <EmptyState.Text>
              Looks like you haven't created any <b>functions</b>... yet!
            </EmptyState.Text>
          </EmptyState>
        }
      >
        {Object.values(functionsList)
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter(f => f.name.includes(searchTerm))
          .map(({id}) => {
            return <FunctionCard key={id} id={id} />
          })}
      </ResourceList.Body>
    </ResourceList>
  )
}

export default FunctionCards
