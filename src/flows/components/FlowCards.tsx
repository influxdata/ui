import React, {FC} from 'react'

import {
  ResourceList,
  Grid,
  Columns,
  ComponentSize,
  EmptyState,
} from '@influxdata/clockface'
import FlowsIndexEmpty from 'src/flows/components/FlowsIndexEmpty'
import FlowCard from 'src/flows/components/FlowCard'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {FlowList} from 'src/types/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface Props {
  flows: FlowList
  search: string
}

const NoMatches = () => {
  return (
    <EmptyState size={ComponentSize.Large}>
      <EmptyState.Text>{`No ${PROJECT_NAME_PLURAL} match your query`}</EmptyState.Text>
    </EmptyState>
  )
}

const FlowCards: FC<Props> = ({flows, search}) => {
  const body = (
    <ResourceList>
      <ResourceList.Body
        emptyState={!!search ? <NoMatches /> : <FlowsIndexEmpty />}
      >
        {Object.keys(flows.flows).map(id => (
          <FlowCard key={id} id={id} />
        ))}
      </ResourceList.Body>
    </ResourceList>
  )

  if (isFlagEnabled('noTutorial')) {
    return <div className="preset--no-tutorial">{body}</div>
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          {body}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default FlowCards
