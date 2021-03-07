// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'

// Components
import {ComponentSize, EmptyState, IndexList} from '@influxdata/clockface'
import {FunctionListContext} from 'src/functions/context/function.list'
import FunctionRunsRow from './FunctionRunsRow'

const FunctionRunsList: FC = () => {
  const {id: functionID} = useParams<{id: string}>()
  const {runsList, getRuns} = useContext(FunctionListContext)

  useEffect(() => {
    getRuns(functionID)
  }, [functionID, getRuns])

  return (
    <IndexList>
      <IndexList.Header>
        <IndexList.HeaderCell columnName="Status" width="10%" />
        <IndexList.HeaderCell columnName="Run ID" width="10%" />
        <IndexList.HeaderCell columnName="Start Time" width="20%" />
        <IndexList.HeaderCell width="10%" />
        <IndexList.HeaderCell columnName="Logs" width="20%" />
      </IndexList.Header>
      <IndexList.Body
        emptyState={
          <EmptyState size={ComponentSize.Large}>
            <EmptyState.Text>
              Looks like this Function doesn't have any <b>Runs</b>
            </EmptyState.Text>
          </EmptyState>
        }
        columnCount={5}
      >
        {runsList.map(r => (
          <FunctionRunsRow key={r.id} run={r} />
        ))}
      </IndexList.Body>
    </IndexList>
  )
}

export default FunctionRunsList
