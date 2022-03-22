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
import {PROJECT_NAME} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
export const PRESET_MAP = [
  {
    title: `New ${PROJECT_NAME}`,
    href: `/${PROJECT_NAME.toLowerCase()}/from/default`,
    testID: 'new',
  },
  {
    title: 'Set an Alert',
    href: `/${PROJECT_NAME.toLowerCase()}/from/notification`,
    testID: 'alert',
  },
  {
    title: 'Schedule a Task',
    href: `/${PROJECT_NAME.toLowerCase()}/from/task`,
    testID: 'task',
  },
  {
    title: 'Write a Flux Script',
    href: `/${PROJECT_NAME.toLowerCase()}/from/flux`,
    testID: 'script',
  },
]

const PresetFlows: FC = () => {
  const history = useHistory()
  const body = (
    <div className="flows-index--presetContainer">
      <h3>Create a {PROJECT_NAME}</h3>
      <div className="flows-index--presetList">
        {PRESET_MAP.map((p, idx: number) => (
          <div key={p.testID} className="flows-index--presetCard">
            {idx === 0 ? (
              <Button
                titleText={p.title}
                color={ComponentColor.Primary}
                icon={IconFont.Plus_New}
                className="flows-index--presetButton"
                testID={`preset-${p.testID}`}
                onClick={() => history.push(p.href)}
              ></Button>
            ) : (
              <Button
                titleText={p.title}
                text=" "
                className="flows-index--presetButton"
                testID={`preset-${p.testID}`}
                onClick={() => history.push(p.href)}
              ></Button>
            )}
            <h5 className="flows-index--presetHeader">{p.title}</h5>
          </div>
        ))}
      </div>
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
