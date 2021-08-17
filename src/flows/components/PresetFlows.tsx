import React, {FC} from 'react'
import './PresetFlows.scss'
import {
  Button,
  ComponentColor,
  IconFont,
  Grid,
  Columns,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import FlowsExplainer from 'src/flows/components/FlowsExplainer'
const PresetMap = {
  'New Notebook': '/notebook/from/default',
  'Set an Alert': '/notebook/from/notification',
  'Schedule a Task': '/notebook/from/task',
  'Write a Flux Script': '/notebook/from/flux',
  'Blank Notebook': '/notebook/from/blank',
}

interface Props {
  buttonMode?: boolean
}
const PresetFlows: FC<Props> = ({buttonMode}) => {
  const history = useHistory()
  return buttonMode ? (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          <div className="flows-index--presetList">
            {Object.keys(PresetMap).map((p: string, idx: number) => (
              <div key={p} className="flows-index--presetButtons">
                {idx === 0 ? (
                  <Button
                    color={ComponentColor.Primary}
                    icon={IconFont.Plus}
                    text={p}
                    onClick={() => history.push(PresetMap[p])}
                  ></Button>
                ) : (
                  <Button
                    text={p}
                    color={ComponentColor.Tertiary}
                    onClick={() => history.push(PresetMap[p])}
                  ></Button>
                )}
              </div>
            ))}
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  ) : (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthSM={Columns.Eight}
          widthMD={Columns.Ten}
        >
          <div id="presetContainer" className="flows-index--presetContainer">
            <h3>Create a Notebook</h3>
            <div className="flows-index--presetList">
              {Object.keys(PresetMap).map((p: string, idx: number) => (
                <div key={p} className="flows-index--presetCard">
                  {idx === 0 ? (
                    <Button
                      color={ComponentColor.Primary}
                      icon={IconFont.Plus}
                      className="flows-index--presetButton"
                      onClick={() => history.push(PresetMap[p])}
                    ></Button>
                  ) : (
                    <Button
                      text=" "
                      className="flows-index--presetButton"
                      onClick={() => history.push(PresetMap[p])}
                    ></Button>
                  )}
                  <h4 className="flows-index--presetHeader">{p}</h4>
                </div>
              ))}
            </div>
          </div>
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

export default PresetFlows
