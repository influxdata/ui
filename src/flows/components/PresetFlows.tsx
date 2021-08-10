import React, {FC} from 'react'
import './PresetFlows.scss'
import {Button, ComponentColor, IconFont} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'

const PresetMap = {
  'New Notebook': '/notebook/from/default',
  Alert: '/notebook/from/notification',
  Flux: '/notebook/from/flux',
  'Demo: Task Automation': '/notebook/from/task',
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
                  onClick={() => history.replace(PresetMap[p])}
                ></Button>
              ) : (
                <Button
                  text=" "
                  className="flows-index--presetButton"
                  onClick={() => history.replace(PresetMap[p])}
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
