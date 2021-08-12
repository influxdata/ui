import React, {FC} from 'react'
import './PresetFlows.scss'
import {Button, ComponentColor, IconFont} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'

const PresetMap = {
  'New Notebook': '/notebook/from/default',
  'Set an Alert': '/notebook/from/notification',
  'Schedule a Task': '/notebook/from/task',
  'Write a Flux Script': '/notebook/from/flux',
  'Blank Notebook': '/notebook/from/blank',
}

const PresetFlows: FC = () => {
  const history = useHistory()
  return (
    <>
      <div className="flows-index--presetcontainer">
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
    </>
  )
}

export default PresetFlows
