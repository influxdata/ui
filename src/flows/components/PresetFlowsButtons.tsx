import React, {FC} from 'react'
import 'src/flows/components/PresetFlows.scss'
import {PresetMap} from 'src/flows/components/PresetFlows'
import {
  Button,
  ComponentColor,
  IconFont,
  Grid,
  Columns,
} from '@influxdata/clockface'

import {useHistory} from 'react-router-dom'

const PresetFlowsButtons: FC = () => {
  const history = useHistory()
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          <div className="flows-index--presetList buttonModeList">
            {Object.keys(PresetMap).map((p: string, idx: number) => (
              <div key={p} className="flows-index--presetButtons">
                {idx === 0 ? (
                  <Button
                    color={ComponentColor.Primary}
                    icon={IconFont.Plus_New}
                    text={p}
                    onClick={() => history.push(PresetMap[p])}
                    className="flows-preset--buttonmode"
                  ></Button>
                ) : (
                  <Button
                    text={p}
                    color={ComponentColor.Tertiary}
                    onClick={() => history.push(PresetMap[p])}
                    className="flows-preset--buttonmode"
                  ></Button>
                )}
              </div>
            ))}
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
export default PresetFlowsButtons
