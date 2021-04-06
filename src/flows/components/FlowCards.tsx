import React, {FC} from 'react'

import {
  ResourceList,
  Grid,
  Columns,
  ComponentSize,
  EmptyState,
} from '@influxdata/clockface'
import FlowsIndexEmpty from 'src/flows/components/FlowsIndexEmpty'
import FlowsExplainer from 'src/flows/components/FlowsExplainer'
import FlowCard from 'src/flows/components/FlowCard'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {FlowList} from 'src/types/flows'

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
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          <ResourceList>
            <ResourceList.Body
              emptyState={!!search ? <NoMatches /> : <FlowsIndexEmpty />}
            >
              {Object.entries(flows.flows).map(([id, {name}]) => {
                return <FlowCard key={id} id={id} name={name} />
              })}
            </ResourceList.Body>
          </ResourceList>
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Four}
          widthMD={Columns.Two}
        >
          <FlowsExplainer />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default FlowCards
