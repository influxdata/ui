import React, {FC} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import FunctionListEmpty from 'src/functions/components/FunctionListEmpty'
import FunctionCard from 'src/functions/components/FunctionCard'

// Types
import {Function} from 'src/client/managedFunctionsRoutes'

interface Props {
  searchTerm: string
}

const FunctionCards: FC<Props> = ({searchTerm}) => {
  const functionsList: Function[] = [
    {name: 'functionb', id: '1', orgID: '0', script: 'lalal'},
    {name: 'functiona', id: '2', orgID: '0', script: 'lalal'},
  ]
  return (
    <ResourceList>
      <ResourceList.Body emptyState={<FunctionListEmpty />}>
        {functionsList
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter(f => f.name.includes(searchTerm))
          .map(({id, name}) => {
            return <FunctionCard key={id} id={id} name={name} />
          })}
      </ResourceList.Body>
    </ResourceList>
  )
}

export default FunctionCards
