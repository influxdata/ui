import React, {FC} from 'react'
import 'src/flows/components/PresetFlows.scss'
import {PRESET_MAP} from 'src/flows/components/PresetFlows'
import {
  Button,
  ComponentColor,
  IconFont,
  Grid,
  Columns,
} from '@influxdata/clockface'

import {useHistory} from 'react-router-dom'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const PresetFlowsButtons: FC = () => {
  const history = useHistory()
  const body = (
    <div className="flows-index--presetList buttonModeList">
      {PRESET_MAP.map((p, idx: number) => (
        <div key={p.title} className="flows-index--presetButtons">
          {idx === 0 ? (
            <Button
              color={ComponentColor.Primary}
              icon={IconFont.Plus_New}
              text={p.title}
              testID={`preset-${p.testID}`}
              onClick={() => history.push(p.href)}
              className="flows-preset--buttonmode"
            ></Button>
          ) : (
            <Button
              text={p.title}
              color={ComponentColor.Tertiary}
              onClick={() => history.push(p.href)}
              testID={`preset-${p.testID}`}
              className="flows-preset--buttonmode"
            ></Button>
          )}
        </div>
      ))}
    </div>
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
export default PresetFlowsButtons
