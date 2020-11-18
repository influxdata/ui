import React, {useContext} from 'react'

import {ResourceList, Grid, Columns} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'
import FlowsIndexEmpty from 'src/flows/components/FlowsIndexEmpty'
import FlowsExplainer from 'src/flows/components/FlowsExplainer'
import FlowCard from 'src/flows/components/FlowCard'

const FlowCards = () => {
  const {flows} = useContext(FlowListContext)

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          <ResourceList>
            <ResourceList.Body emptyState={<FlowsIndexEmpty />}>
              {Object.entries(flows).map(([id, {name}]) => {
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
