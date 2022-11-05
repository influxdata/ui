import React, {FC} from 'react'
import {Form, Input, DapperScrollbars} from '@influxdata/clockface'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface Props {
  selectedScript: any
  scriptParams: any
}

export const ScriptForm: FC<Props> = props => {
  const {selectedScript, scriptParams} = props

  const paramList = (
    <>
    {Object.keys(scriptParams).map(param => (
      <Form.Element
      label={`param.${param}`}
      required={true}
      key={param}
      >
        <Input
          name="name"
          onChange={() => {}}
          // value={}
          testID="script-param-value"
          />
      </Form.Element>
    ))}
    </>
  )

  return (
    <>
      <h3>{selectedScript.name}</h3>
      <div className="script-description">
        <div>Description</div>
        <p>{selectedScript.description}</p>
      </div>
      <div className="script-params">
        <h3>Set Param Values</h3>
        <p>
          Params are InfluxDB objects that define runtime variables. You must
          provide values for params when you invoke a script.{' '}
          <SafeBlankLink href="">Learn More.</SafeBlankLink>
        </p>
        <DapperScrollbars
          autoHide={false}
          autoSize
          style={{width: '100%', maxWidth: '552px', maxHeight: '400px'}}
        >
          <div className="script-params-list">
            {paramList}
          </div>
        </DapperScrollbars>
      </div>
    </>
  )
}
