import React from 'react'
import {Grid, Columns, ComponentSize, EmptyState} from '@influxdata/clockface'
import FlowsExplainer from 'src/flows/components/FlowsExplainer'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

const FlowsIndexEmpty = () => {
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          <EmptyState size={ComponentSize.Large}>
            <div className="flow-empty">
              <div className="flow-empty--graphic" />
              <EmptyState.Text>
                You haven't created any {PROJECT_NAME_PLURAL} yet
              </EmptyState.Text>
              <div className="flow-empty--description-text">
                <p>
                  Click <strong>Create {PROJECT_NAME}</strong> in the top right
                  to get started
                </p>
              </div>
            </div>
          </EmptyState>
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

export default FlowsIndexEmpty
